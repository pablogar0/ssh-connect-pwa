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

// Inicializar el manejador de SSH
const sshManager = new SSHManager(); 