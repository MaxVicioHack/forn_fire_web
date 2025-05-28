// 🔥 assets/js/realtime.js - Forn Fire Real-time Connection
// Desarrollado por MaxVixioHack con ChuyMine

class FornFireWebPanel {
    constructor() {
        // Configuración
        this.apiUrl = window.location.origin.includes('github.io') 
            ? 'https://your-server.herokuapp.com/api' // Cambiar por tu servidor en producción
            : 'http://localhost:3000/api';
        this.wsUrl = window.location.origin.includes('github.io')
            ? 'wss://your-server.herokuapp.com' // Cambiar por tu servidor WebSocket
            : 'ws://localhost:8080';
            
        // Estado
        this.socket = null;
        this.reconnectInterval = 5000;
        this.isConnected = false;
        this.gameState = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        
        // Elementos DOM
        this.statusDots = null;
        this.statusItems = null;
        
        console.log('🔥 Inicializando Forn Fire Web Panel v1.0.0');
        console.log('👨‍💻 Desarrollado por MaxVixioHack');
        
        this.init();
    }
    
    // 🚀 Inicialización
    async init() {
        try {
            console.log('⚡ Iniciando sistema de tiempo real...');
            
            // Cachear elementos DOM
            this.cacheElements();
            
            // Conectar WebSocket
            this.connectWebSocket();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Iniciar heartbeat
            this.startHeartbeat();
            
            // Configurar eventos de la ventana
            this.setupWindowEvents();
            
            console.log('✅ Sistema inicializado correctamente');
            this.showNotification('🔥 Forn Fire Panel iniciado', 'success');
            
        } catch (error) {
            console.error('❌ Error inicializando:', error);
            this.showNotification('❌ Error inicializando panel', 'error');
        }
    }
    
    // 📱 Cachear elementos DOM
    cacheElements() {
        this.statusDots = document.querySelectorAll('.status-dot');
        this.statusItems = document.querySelectorAll('.status-item');
    }
    
    // 🔌 Conexión WebSocket
    connectWebSocket() {
        try {
            console.log(`🔌 Conectando WebSocket: ${this.wsUrl}`);
            
            this.socket = new WebSocket(this.wsUrl);
            
            this.socket.onopen = () => {
                console.log('✅ WebSocket conectado');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus(true);
                this.showNotification('🔗 Conectado al servidor', 'success');
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ Error procesando mensaje:', error);
                }
            };
            
            this.socket.onclose = (event) => {
                console.log(`❌ WebSocket cerrado: ${event.code} - ${event.reason}`);
                this.isConnected = false;
                this.updateConnectionStatus(false);
                
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                } else {
                    console.log('🛑 Máximo de intentos de reconexión alcanzado');
                    this.showNotification('🔴 Conexión perdida', 'error');
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('🚨 Error WebSocket:', error);
                this.isConnected = false;
                this.updateConnectionStatus(false);
            };
            
        } catch (error) {
            console.error('🚨 Error creando WebSocket:', error);
            this.scheduleReconnect();
        }
    }
    
    // 🔄 Programar reconexión
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, 30000);
        
        console.log(`🔄 Reconectando en ${delay/1000}s (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connectWebSocket();
            }
        }, delay);
    }
    
    // 📡 Manejar mensajes WebSocket
    handleMessage(data) {
        console.log('📡 Mensaje recibido:', data.type);
        
        switch (data.type) {
            case 'initial':
                this.gameState = data.data;
                this.updateAllPanels();
                console.log('🎮 Estado inicial del juego cargado');
                break;
                
            case 'update':
                this.updateGameState(data.category, data.data);
                this.updateSpecificPanel(data.category);
                break;
                
            case 'server_update':
                if (this.gameState) {
                    this.gameState.server = data.data;
                    if (data.stats) {
                        this.gameState.stats = { ...this.gameState.stats, ...data.stats };
                    }
                    this.updateServerStatus();
                    this.updateStatusBar();
                }
                break;
                
            case 'command_executed':
                console.log('⚡ Comando ejecutado:', data.command.action);
                this.gameState = data.gameState;
                this.updateAllPanels();
                this.showNotification(`✅ ${data.command.action} ejecutado`, 'success');
                break;
                
            case 'pong':
                // Heartbeat response
                break;
                
            default:
                console.log('📋 Mensaje no reconocido:', data.type);
        }
    }
    
    // 📊 Cargar datos iniciales
    async loadInitialData() {
        try {
            console.log('📊 Cargando datos iniciales...');
            
            const response = await fetch(`${this.apiUrl}/gamestate`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.gameState = result.data;
                this.updateAllPanels();
                console.log('✅ Datos iniciales cargados');
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos iniciales:', error);
            
            // Usar datos de respaldo
            this.gameState = this.getDefaultGameState();
            this.updateAllPanels();
            
            this.showNotification('⚠️ Usando datos locales', 'warning');
        }
    }
    
    // 🎮 Estado por defecto
    getDefaultGameState() {
        return {
            server: { status: 'offline', uptime: Date.now(), cpu: 0, ram: 0 },
            players: [],
            matches: [],
            stats: { playersOnline: 0, activeMatches: 0, queuedPlayers: 0, totalKills: 0 },
            weapons: [
                { name: 'AR', damage: 35, range: 'Alto', active: false },
                { name: 'Rocket Launcher', damage: 100, range: 'Medio', active: false },
                { name: 'Bow Weapon', damage: 50, range: 'Medio', active: false }
            ],
            map: { name: 'Forn Fire Main', status: 'offline' }
        };
    }
    
    // 🔄 Actualizar estado del juego
    updateGameState(category, newData) {
        if (!this.gameState) return;
        
        switch (category) {
            case 'players':
                this.gameState.players = Array.isArray(newData) ? newData : [];
                this.gameState.stats.playersOnline = this.gameState.players.length;
                break;
            case 'matches':
                this.gameState.matches = Array.isArray(newData) ? newData : [];
                this.gameState.stats.activeMatches = this.gameState.matches.length;
                break;
            case 'stats':
                this.gameState.stats = { ...this.gameState.stats, ...newData };
                break;
            case 'server':
                this.gameState.server = { ...this.gameState.server, ...newData };
                break;
            case 'kill':
                // Kill individual registrado
                break;
        }
    }
    
    // 🎨 Actualizar todos los paneles
    updateAllPanels() {
        if (!this.gameState) return;
        
        try {
            this.updateDashboard();
            this.updatePlayersPanel();
            this.updateMatchesPanel();
            this.updateWeaponsPanel();
            this.updateServerStatus();
            this.updateStatusBar();
            
        } catch (error) {
            console.error('❌ Error actualizando paneles:', error);
        }
    }
    
    // 📊 Actualizar panel específico
    updateSpecificPanel(category) {
        try {
            switch (category) {
                case 'players':
                    this.updatePlayersPanel();
                    this.updateStatusBar();
                    break;
                case 'matches':
                    this.updateMatchesPanel();
                    this.updateStatusBar();
                    break;
                case 'stats':
                    this.updateDashboard();
                    this.updateStatusBar();
                    break;
                case 'server':
                    this.updateServerStatus();
                    this.updateStatusBar();
                    break;
            }
        } catch (error) {
            console.error(`❌ Error actualizando panel ${category}:`, error);
        }
    }
    
    // 🏠 Actualizar Dashboard
    updateDashboard() {
        if (!this.gameState) return;
        
        const { server, stats } = this.gameState;
        
        // Actualizar card del servidor
        const serverCard = document.querySelector('#dashboard .card:first-child');
        if (serverCard) {
            const isOnline = this.isConnected && server.status === 'online';
            const statusColor = isOnline ? '#00ff00' : '#ff6b35';
            const statusText = isOnline ? 'Online' : 'Offline';
            
            serverCard.innerHTML = `
                <h3>🎯 Estado del Servidor</h3>
                <p><strong>Estado:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
                <p><strong>Uptime:</strong> ${this.formatUptime(server.uptime)}</p>
                <p><strong>CPU:</strong> ${server.cpu || 0}%</p>
                <p><strong>RAM:</strong> ${server.ram || 0}%</p>
                <button class="btn" onclick="window.webPanel.restartServer()">Reiniciar Servidor</button>
            `;
        }
        
        // Actualizar card de estadísticas
        const statsCard = document.querySelector('#dashboard .card:nth-child(2)');
        if (statsCard) {
            statsCard.innerHTML = `
                <h3>📈 Estadísticas en Vivo</h3>
                <p><strong>Jugadores Conectados:</strong> ${stats.playersOnline || 0}</p>
                <p><strong>Partidas en Cola:</strong> ${stats.queuedPlayers || 0}</p>
                <p><strong>Partidas Activas:</strong> ${stats.activeMatches || 0}</p>
                <p><strong>Total Kills:</strong> ${stats.totalKills || 0}</p>
            `;
        }
        
        // Actualizar actividad reciente
        const activityCard = document.querySelector('#dashboard .card:nth-child(3)');
        if (activityCard) {
            const activities = [
                `• Panel web ${this.isConnected ? 'conectado' : 'desconectado'}`,
                `• ${stats.playersOnline || 0} jugadores online`,
                `• ${stats.totalKills || 0} kills registrados`,
                `• Sistema ${this.isConnected ? 'sincronizado' : 'local'}`
            ];
            
            activityCard.innerHTML = `
                <h3>🔥 Actividad Reciente</h3>
                ${activities.map(activity => `<p>${activity}</p>`).join('')}
            `;
        }
    }
    
    // 👥 Actualizar panel de jugadores
    updatePlayersPanel() {
        if (!this.gameState) return;
        
        const playersTable = document.querySelector('#players .data-table tbody');
        if (!playersTable) return;
        
        const { players } = this.gameState;
        
        if (!players || players.length === 0) {
            playersTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #999; padding: 2rem;">
                        ${this.isConnected ? 
                            '🔄 No hay jugadores conectados<br><small>Los jugadores aparecerán cuando se conecten a Roblox Studio</small>' : 
                            '❌ Sin conexión al servidor<br><small>Conectando al servidor de Roblox...</small>'
                        }
                    </td>
                </tr>
            `;
        } else {
            playersTable.innerHTML = players.map(player => `
                <tr>
                    <td>${this.escapeHtml(player.name || 'Desconocido')}</td>
                    <td><span style="color: #00ff00;">${player.status || 'Online'}</span></td>
                    <td>${player.kills || 0}</td>
                    <td>${player.joinTime ? this.formatTime(player.joinTime) : 'Reciente'}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="window.webPanel.kickPlayer('${this.escapeHtml(player.name)}')">
                            Kick
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    // 🎮 Actualizar panel de partidas
    updateMatchesPanel() {
        if (!this.gameState) return;
        
        const { matches, stats } = this.gameState;
        
        // Actualizar partidas activas
        const activeMatchesCard = document.querySelector('#matches .card:first-child');
        if (activeMatchesCard) {
            if (!matches || matches.length === 0) {
                activeMatchesCard.innerHTML = `
                    <h3>🎮 Partidas Activas</h3>
                    <p>🔄 ${this.isConnected ? 'No hay partidas activas' : 'Conectando al servidor...'}</p>
                    <p><strong>Estado:</strong> Standby</p>
                    <p><strong>Jugadores:</strong> 0/100</p>
                    <button class="btn" onclick="window.webPanel.createMatch()">Crear Nueva Partida</button>
                `;
            } else {
                const match = matches[0];
                activeMatchesCard.innerHTML = `
                    <h3>🎮 Partidas Activas</h3>
                    <p><strong>Mapa:</strong> ${match.mapName || 'Forn Fire Main'}</p>
                    <p><strong>Jugadores:</strong> ${match.playersCount || 0}/${match.maxPlayers || 100}</p>
                    <p><strong>Estado:</strong> ${match.status || 'Activa'}</p>
                    <p><strong>Tiempo:</strong> ${match.timeRemaining ? this.formatTime(match.timeRemaining) : '--'}</p>
                    <button class="btn" onclick="window.webPanel.endMatch('${match.id}')">Terminar Partida</button>
                `;
            }
        }
        
        // Actualizar cola
        const queueCard = document.querySelector('#matches .card:nth-child(2)');
        if (queueCard) {
            queueCard.innerHTML = `
                <h3>⏱️ Cola de Matchmaking</h3>
                <p><strong>Jugadores en Cola:</strong> ${stats.queuedPlayers || 0}</p>
                <p><strong>Tiempo Estimado:</strong> ${stats.queuedPlayers > 0 ? '30s' : '--'}</p>
                <p><strong>Estado:</strong> ${this.isConnected ? 'Activo' : 'Desconectado'}</p>
                <button class="btn btn-secondary" onclick="window.webPanel.viewQueue()">Ver Cola</button>
            `;
        }
    }
    
    // 🔫 Actualizar panel de armas
    updateWeaponsPanel() {
        if (!this.gameState || !this.gameState.weapons) return;
        
        const weaponsGrid = document.querySelector('#weapons .grid');
        if (!weaponsGrid) return;
        
        weaponsGrid.innerHTML = this.gameState.weapons.map(weapon => {
            const statusColor = weapon.active ? '#00ff00' : '#ff6b35';
            const statusText = weapon.active ? '✅ Activo' : '❌ Inactivo';
            
            return `
                <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,107,53,0.2);">
                    <h4 style="color: #ff8c42; margin-bottom: 0.5rem;">${this.getWeaponIcon(weapon.name)} ${weapon.name}</h4>
                    <p><strong>Daño:</strong> ${weapon.damage}</p>
                    <p><strong>Rango:</strong> ${weapon.range}</p>
                    <p><strong>Kills:</strong> ${weapon.kills || 0}</p>
                    <p><strong>Estado:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
                    <button class="btn btn-secondary" onclick="window.webPanel.toggleWeapon('${weapon.name}')" style="margin-top: 0.5rem;">
                        ${weapon.active ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // 📊 Actualizar estado del servidor
    updateServerStatus() {
        this.updateConnectionStatus(this.isConnected);
    }
    
    // 📈 Actualizar barra de estado
    updateStatusBar() {
        if (!this.gameState) return;
        
        const { stats } = this.gameState;
        
        if (this.statusItems.length >= 4) {
            // Estado del servidor
            if (this.statusItems[0]) {
                this.statusItems[0].innerHTML = `
                    <div class="status-dot"></div>
                    <span>Servidor: ${this.isConnected ? 'Online' : 'Offline'}</span>
                `;
            }
            
            // Jugadores
            if (this.statusItems[1]) {
                this.statusItems[1].innerHTML = `<span>👥 Jugadores: ${stats.playersOnline || 0}/100</span>`;
            }
            
            // Partidas
            if (this.statusItems[2]) {
                this.statusItems[2].innerHTML = `<span>🎮 Partidas: ${stats.activeMatches || 0}</span>`;
            }
            
            // Uptime
            if (this.statusItems[3]) {
                const uptime = this.gameState.server ? this.formatUptime(this.gameState.server.uptime) : '--';
                this.statusItems[3].innerHTML = `<span>⏱️ Uptime: ${uptime}</span>`;
            }
        }
    }
    
    // 🔄 Actualizar estado de conexión
    updateConnectionStatus(connected) {
        const color = connected ? '#00ff00' : '#ff6b35';
        
        if (this.statusDots) {
            this.statusDots.forEach(dot => {
                dot.style.backgroundColor = color;
            });
        }
    }
    
    // ⏱️ Heartbeat
    startHeartbeat() {
        setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            }
        }, 30000); // Cada 30 segundos
    }
    
    // 🪟 Eventos de ventana
    setupWindowEvents() {
        window.addEventListener('beforeunload', () => {
            if (this.socket) {
                this.socket.close();
            }
        });
        
        window.addEventListener('online', () => {
            console.log('🌐 Conexión a internet restaurada');
            if (!this.isConnected) {
                this.connectWebSocket();
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('❌ Conexión a internet perdida');
            this.isConnected = false;
            this.updateConnectionStatus(false);
        });
    }
    
    // 🎛️ FUNCIONES DE CONTROL
    
    async sendCommand(action, target = null, data = null) {
        try {
            console.log(`🎮 Enviando comando: ${action}`);
            
            const response = await fetch(`${this.apiUrl}/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, target, data })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ Comando ${action} ejecutado`);
                this.showNotification(`✅ ${action} ejecutado`, 'success');
                
                // Actualizar datos después del comando
                setTimeout(() => this.loadInitialData(), 1000);
                
            } else {
                console.error(`❌ Error en comando: ${result.error}`);
                this.showNotification(`❌ Error: ${result.error}`, 'error');
            }
            
        } catch (error) {
            console.error('🚨 Error enviando comando:', error);
            this.showNotification('🚨 Error de conexión', 'error');
        }
    }
    
    // 🎮 Funciones específicas del juego
    restartServer() { this.sendCommand('restart_server'); }
    kickPlayer(playerName) { this.sendCommand('kick_player', playerName); }
    createMatch() { this.sendCommand('create_match'); }
    endMatch(matchId) { this.sendCommand('end_match', matchId); }
    toggleWeapon(weaponName) { this.sendCommand('toggle_weapon', weaponName); }
    viewQueue() { this.sendCommand('view_queue'); }
    
    // 🔧 UTILIDADES
    
    formatUptime(timestamp) {
        if (!timestamp) return '--';
        
        const uptime = Date.now() - timestamp;
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    formatTime(seconds) {
        if (!seconds) return '--';
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getWeaponIcon(weaponName) {
        const icons = {
            'AR': '🔫',
            'Rocket Launcher': '🚀',
            'Bow Weapon': '🏹'
        };
        return icons[weaponName] || '⚔️';
    }
    
    showNotification(message, type = 'info') {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            background: ${colors[type] || colors.info};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 🎨 Animaciones CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 🚀 Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Inicializando Forn Fire Web Panel...');
    window.webPanel = new FornFireWebPanel();
});

// 🎮 Funciones globales para compatibilidad
window.restartServer = () => window.webPanel?.restartServer();
window.kickPlayer = (name) => window.webPanel?.kickPlayer(name);
window.createMatch = () => window.webPanel?.createMatch();
window.endMatch = (id) => window.webPanel?.endMatch(id);
window.toggleWeapon = (name) => window.webPanel?.toggleWeapon(name);
window.viewQueue = () => window.webPanel?.viewQueue();

console.log('📡 Forn Fire Real-time System cargado');
console.log('🔥 Desarrollado por MaxVixioHack con ChuyMine');
console.log('🎮 Proyecto: Forn Fire Battle Royale Panel v1.0.0');

// 🎮 GitHub Data Reader - Forn Fire
// Lee datos actualizados desde GitHub Actions

class GitHubDataReader {
    constructor() {
        this.repoUrl = 'https://raw.githubusercontent.com/MaxVicioHack/forn_fire_web/main/data/game-data.json';
        this.updateInterval = 15000; // 15 segundos
        this.lastUpdate = null;
        
        console.log('🔄 GitHub Data Reader iniciado');
        this.startReading();
    }
    
    async fetchGameData() {
        try {
            console.log('📡 Obteniendo datos desde GitHub...');
            
            // Añadir timestamp para evitar cache
            const url = this.repoUrl + '?t=' + Date.now();
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Verificar si los datos son más recientes
            if (this.lastUpdate !== data.server.lastUpdate) {
                this.lastUpdate = data.server.lastUpdate;
                this.updateWebPanel(data);
                console.log('✅ Datos actualizados desde GitHub:', new Date(data.server.lastUpdate));
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ Error obteniendo datos de GitHub:', error);
            return null;
        }
    }
    
    updateWebPanel(data) {
        if (!window.webPanel) {
            console.warn('⚠️ WebPanel no disponible aún');
            return;
        }
        
        // Actualizar estado del juego
        if (window.webPanel.gameState) {
            window.webPanel.gameState = {
                ...window.webPanel.gameState,
                players: data.players || [],
                stats: data.stats || {},
                server: {
                    ...window.webPanel.gameState.server,
                    ...data.server,
                    status: 'online'
                }
            };
            
            // Actualizar paneles
            window.webPanel.updateAllPanels();
            
            // Mostrar notificación de actualización
            const playersCount = data.players ? data.players.length : 0;
            const totalKills = data.stats ? data.stats.totalKills || 0 : 0;
            
            if (playersCount > 0 || totalKills > 0) {
                window.webPanel.showNotification(
                    `🎮 Datos actualizados: ${playersCount} jugadores, ${totalKills} kills`, 
                    'success'
                );
            }
        }
    }
    
    startReading() {
        // Primera lectura inmediata
        this.fetchGameData();
        
        // Lectura periódica
        setInterval(() => {
            this.fetchGameData();
        }, this.updateInterval);
        
        console.log(`🔄 Lectura automática cada ${this.updateInterval/1000} segundos`);
    }
    
    // Función para forzar actualización
    forceUpdate() {
        console.log('🔄 Forzando actualización...');
        return this.fetchGameData();
    }
}

// Inicializar lector cuando el WebPanel esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que WebPanel se inicialice
    setTimeout(() => {
        if (window.webPanel) {
            window.githubReader = new GitHubDataReader();
            
            // Añadir función global para forzar actualización
            window.forceGitHubUpdate = () => {
                if (window.githubReader) {
                    return window.githubReader.forceUpdate();
                }
            };
            
            console.log('🔗 GitHub Data Reader conectado al WebPanel');
        } else {
            console.warn('⚠️ WebPanel no encontrado, reintentando...');
            setTimeout(arguments.callee, 2000);
        }
    }, 3000);
});

// Añadir indicador visual de GitHub
setTimeout(() => {
    if (document.querySelector('.header-info')) {
        const githubIndicator = document.createElement('div');
        githubIndicator.className = 'info-item';
        githubIndicator.innerHTML = `
            <span class="info-icon">📡</span>
            <span>GitHub Live</span>
        `;
        document.querySelector('.header-info').appendChild(githubIndicator);
    }
}, 5000);
