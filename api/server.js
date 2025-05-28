// 🔥 api/server.js - Servidor Forn Fire para MaxVixioHack
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

console.log('🔥 Iniciando servidor Forn Fire...');

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://maxviciohack.github.io'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

// 🎮 Estado del juego en memoria
let gameState = {
    server: {
        status: 'online',
        uptime: Date.now(),
        cpu: Math.floor(Math.random() * 30) + 30,
        ram: Math.floor(Math.random() * 40) + 40,
        lastUpdate: Date.now()
    },
    players: [],
    matches: [],
    stats: {
        playersOnline: 0,
        activeMatches: 0,
        queuedPlayers: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalMatches: 0
    },
    weapons: [
        { name: 'AR', damage: 35, range: 'Alto', active: true, kills: 0 },
        { name: 'Rocket Launcher', damage: 100, range: 'Medio', active: true, kills: 0 },
        { name: 'Bow Weapon', damage: 50, range: 'Medio', active: true, kills: 0 }
    ],
    map: {
        name: 'Forn Fire Main',
        vehicles: ['Jeep'],
        props: ['Multiple Crates', 'Trees', 'Buildings'],
        environment: ['Post-Apocalyptic', 'Battle Arena'],
        status: 'active'
    },
    config: {
        maxPlayers: 100,
        matchDuration: 1200, // 20 minutos
        cooperativeMode: true,
        friendlyFire: false,
        respawnEnabled: true,
        shrinkingBarrier: true
    }
};

// 🔌 WebSocket Server
let wss;
try {
    wss = new WebSocket.Server({ port 8080 });
    console.log('🔌 WebSocket server iniciado en puerto 8080');
} catch (err) {
    console.log('⚠️ WebSocket usando puerto alternativo');
    wss = new WebSocket.Server({ port: 8081 });
}

// Broadcast a todos los clientes conectados
function broadcast(data) {
    if (!wss) return;
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(JSON.stringify(data));
            } catch (error) {
                console.error('Error enviando WebSocket:', error);
            }
        }
    });
}

// 🌐 RUTAS DE LA API

// GET - Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        server: 'Forn Fire Panel',
        version: '1.0.0',
        developer: 'MaxVixioHack',
        timestamp: Date.now()
    });
});

// GET - Estado completo del juego
app.get('/api/gamestate', (req, res) => {
    res.json({
        success: true,
        data: gameState,
        timestamp: Date.now()
    });
});

// GET - Solo estadísticas
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        data: gameState.stats,
        server: gameState.server,
        timestamp: Date.now()
    });
});

// GET - Solo jugadores
app.get('/api/players', (req, res) => {
    res.json({
        success: true,
        data: gameState.players,
        count: gameState.players.length,
        maxPlayers: gameState.config.maxPlayers,
        timestamp: Date.now()
    });
});

// POST - Actualizar desde Roblox Studio
app.post('/api/update', (req, res) => {
    try {
        const { type, data, gameId } = req.body;
        
        console.log(`📡 [${new Date().toLocaleTimeString()}] Datos de Roblox:`, type, data);
        
        switch(type) {
            case 'players':
                gameState.players = Array.isArray(data) ? data : [];
                gameState.stats.playersOnline = gameState.players.length;
                console.log(`👥 Jugadores actualizados: ${gameState.players.length}`);
                break;
                
            case 'matches':
                gameState.matches = Array.isArray(data) ? data : [];
                gameState.stats.activeMatches = gameState.matches.length;
                break;
                
            case 'stats':
                gameState.stats = { ...gameState.stats, ...data };
                if (data.totalKills) {
                    console.log(`💀 Total kills: ${data.totalKills}`);
                }
                break;
                
            case 'server':
                gameState.server = { ...gameState.server, ...data };
                gameState.server.lastUpdate = Date.now();
                break;
                
            case 'kill':
                // Registrar kill individual
                gameState.stats.totalKills = (gameState.stats.totalKills || 0) + 1;
                if (data.weapon && gameState.weapons.find(w => w.name === data.weapon)) {
                    const weapon = gameState.weapons.find(w => w.name === data.weapon);
                    weapon.kills = (weapon.kills || 0) + 1;
                }
                console.log(`🎯 Kill registrado: ${data.killer} → ${data.victim}`);
                break;
                
            default:
                console.log(`⚠️ Tipo de actualización desconocido: ${type}`);
                return res.status(400).json({
                    success: false,
                    error: 'Tipo de actualización no válido'
                });
        }
        
        // Broadcast a clientes WebSocket
        broadcast({
            type: 'update',
            category: type,
            data: type === 'kill' ? gameState.stats : data,
            timestamp: Date.now()
        });
        
        res.json({
            success: true,
            message: `${type} actualizado correctamente`,
            playersOnline: gameState.stats.playersOnline,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error('❌ Error procesando actualización:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST - Comandos desde Web a Roblox
app.post('/api/command', (req, res) => {
    try {
        const { action, target, data } = req.body;
        
        const command = {
            action,
            target,
            data,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        };
        
        console.log(`🎮 Comando enviado a Roblox:`, command);
        
        // Simular respuesta del comando
        switch(action) {
            case 'restart_server':
                gameState.server.uptime = Date.now();
                break;
            case 'kick_player':
                gameState.players = gameState.players.filter(p => p.name !== target);
                gameState.stats.playersOnline = gameState.players.length;
                break;
            case 'create_match':
                gameState.matches.push({
                    id: command.id,
                    players: 0,
                    status: 'waiting',
                    created: Date.now()
                });
                gameState.stats.activeMatches = gameState.matches.length;
                break;
        }
        
        // Broadcast cambios
        broadcast({
            type: 'command_executed',
            command: command,
            gameState: gameState,
            timestamp: Date.now()
        });
        
        res.json({
            success: true,
            message: `Comando ${action} enviado correctamente`,
            commandId: command.id,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error('❌ Error procesando comando:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 🔄 WebSocket connections
if (wss) {
    wss.on('connection', (ws, req) => {
        const clientIP = req.connection.remoteAddress;
        console.log(`🔗 Cliente conectado desde: ${clientIP}`);
        
        // Enviar estado inicial
        ws.send(JSON.stringify({
            type: 'initial',
            data: gameState,
            message: 'Conectado al servidor Forn Fire',
            timestamp: Date.now()
        }));
        
        // Manejar mensajes del cliente
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                }
            } catch (error) {
                console.error('Error procesando mensaje WebSocket:', error);
            }
        });
        
        ws.on('close', () => {
            console.log(`❌ Cliente desconectado: ${clientIP}`);
        });
        
        ws.on('error', (error) => {
            console.error('🚨 Error WebSocket:', error);
        });
    });
}

// 📊 Ruta principal - servir la web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 🚀 Iniciar servidor
app.listen(port, () => {
    console.log(`🔥 Servidor Forn Fire iniciado exitosamente`);
    console.log(`🌐 Panel Web: http://localhost:${port}`);
    console.log(`📡 API Base: http://localhost:${port}/api`);
    console.log(`🔌 WebSocket: ws://localhost:${wss ? (wss.options.port || 8080) : 'N/A'}`);
    console.log(`👨‍💻 Desarrollado por: MaxVixioHack`);
    console.log(`🎮 Proyecto: Forn Fire Battle Royale`);
});

// 📊 Simulación de datos en tiempo real
let simulationInterval = setInterval(() => {
    // Actualizar uptime y recursos del servidor
    gameState.server.uptime = Date.now();
    gameState.server.cpu = Math.floor(Math.random() * 30) + 30; // 30-60%
    gameState.server.ram = Math.floor(Math.random() * 40) + 40; // 40-80%
    
    // Simular actividad de jugadores ocasional
    if (Math.random() < 0.1 && gameState.players.length > 0) { // 10% probabilidad
        const randomPlayer = gameState.players[Math.floor(Math.random() * gameState.players.length)];
        if (randomPlayer) {
            randomPlayer.kills = (randomPlayer.kills || 0) + Math.floor(Math.random() * 2);
            gameState.stats.totalKills = (gameState.stats.totalKills || 0) + 1;
        }
    }
    
    // Broadcast actualizaciones del servidor
    broadcast({
        type: 'server_update',
        data: gameState.server,
        stats: gameState.stats,
        timestamp: Date.now()
    });
    
}, 10000); // Cada 10 segundos

// Manejo de cierre del servidor
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor Forn Fire...');
    clearInterval(simulationInterval);
    if (wss) {
        wss.close();
    }
    process.exit(0);
});

module.exports = app;
