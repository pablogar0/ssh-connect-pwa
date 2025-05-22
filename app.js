// Registrar el Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado');
            })
            .catch(error => {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
}

// Clase para manejar la información de red
class NetworkManager {
    constructor() {
        this.statusElement = document.getElementById('connectionStatus');
        this.typeElement = document.getElementById('connectionType');
        this.speedElement = document.getElementById('connectionSpeed');
        this.ipElement = document.getElementById('localIP');
        this.refreshButton = document.getElementById('refreshNetwork');
        
        this.setupEventListeners();
        this.updateNetworkInfo();
    }

    setupEventListeners() {
        // Actualizar cuando cambie la conexión
        window.addEventListener('online', () => this.updateNetworkInfo());
        window.addEventListener('offline', () => this.updateNetworkInfo());
        
        // Actualizar cuando cambie el tipo de conexión
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => this.updateNetworkInfo());
        }
        
        // Botón de actualizar
        this.refreshButton.addEventListener('click', () => this.updateNetworkInfo());
    }

    async updateNetworkInfo() {
        // Estado de conexión
        const isOnline = navigator.onLine;
        this.statusElement.textContent = isOnline ? 'Conectado' : 'Desconectado';
        this.statusElement.className = isOnline ? 'status-online' : 'status-offline';

        // Tipo de conexión
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.typeElement.textContent = this.getConnectionType(connection.type);
            this.speedElement.textContent = this.getConnectionSpeed(connection);
        } else {
            this.typeElement.textContent = 'No disponible';
            this.speedElement.textContent = 'No disponible';
        }

        // Intentar obtener IP local
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            this.ipElement.textContent = data.ip;
        } catch (error) {
            this.ipElement.textContent = 'No disponible';
        }
    }

    getConnectionType(type) {
        const types = {
            'bluetooth': 'Bluetooth',
            'cellular': 'Datos móviles',
            'ethernet': 'Ethernet',
            'none': 'Sin conexión',
            'wifi': 'WiFi',
            'wimax': 'WiMAX',
            'other': 'Otra',
            'unknown': 'Desconocida'
        };
        return types[type] || 'Desconocido';
    }

    getConnectionSpeed(connection) {
        if (connection.downlink) {
            return `${connection.downlink} Mbps`;
        }
        return 'No disponible';
    }
}

// Clase para manejar las conexiones SSH
class SSHManager {
    constructor() {
        this.connections = this.loadConnections();
        this.form = document.getElementById('sshForm');
        this.connectionsList = document.getElementById('connectionsList');
        this.setupEventListeners();
        this.renderConnections();
    }

    loadConnections() {
        const saved = localStorage.getItem('sshConnections');
        return saved ? JSON.parse(saved) : [];
    }

    saveConnections() {
        localStorage.setItem('sshConnections', JSON.stringify(this.connections));
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleConnect();
        });
    }

    handleConnect() {
        const usuario = document.getElementById('usuario').value;
        const ip = document.getElementById('ip').value;
        const puerto = document.getElementById('puerto').value || '22';

        // Crear URL SSH
        const sshUrl = `ssh://${usuario}@${ip}:${puerto}`;

        // Guardar la conexión
        this.saveConnection({ usuario, ip, puerto });

        // Intentar abrir el cliente SSH
        window.location.href = sshUrl;
    }

    saveConnection(connection) {
        // Evitar duplicados
        const exists = this.connections.some(c => 
            c.usuario === connection.usuario && 
            c.ip === connection.ip && 
            c.puerto === connection.puerto
        );

        if (!exists) {
            this.connections.unshift(connection);
            if (this.connections.length > 10) {
                this.connections.pop(); // Mantener solo las últimas 10 conexiones
            }
            this.saveConnections();
            this.renderConnections();
        }
    }

    renderConnections() {
        this.connectionsList.innerHTML = '';
        this.connections.forEach((connection, index) => {
            const item = document.createElement('div');
            item.className = 'connection-item';
            item.innerHTML = `
                <div class="connection-info">
                    ${connection.usuario}@${connection.ip}:${connection.puerto}
                </div>
                <div class="connection-actions">
                    <button onclick="sshManager.connect(${index})" class="connect-btn">Conectar</button>
                    <button onclick="sshManager.delete(${index})" class="delete-btn">Eliminar</button>
                </div>
            `;
            this.connectionsList.appendChild(item);
        });
    }

    connect(index) {
        const connection = this.connections[index];
        const sshUrl = `ssh://${connection.usuario}@${connection.ip}:${connection.puerto}`;
        window.location.href = sshUrl;
    }

    delete(index) {
        this.connections.splice(index, 1);
        this.saveConnections();
        this.renderConnections();
    }
}

// Inicializar los manejadores
const networkManager = new NetworkManager();
const sshManager = new SSHManager(); 