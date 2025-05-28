# 🔥 Forn Fire - Panel de Administración Web

<div align="center">

![Forn Fire Logo](https://img.shields.io/badge/🔥_Forn_Fire-Battle_Royale-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Roblox_Studio-red?style=for-the-badge)

**Panel de administración web profesional en tiempo real para el juego Battle Royale cooperativo Forn Fire desarrollado en Roblox Studio.**

[🌐 **Ver Demo en Vivo**](https://maxviciohack.github.io/forn_fire_web/) • [📖 **Documentación**](#-documentación) • [🚀 **Instalación**](#-instalación-rápida)

![Web Panel Preview](https://via.placeholder.com/800x400/1a1a2e/ff6b35?text=Forn+Fire+Web+Panel)

</div>

---

## 🎯 **Descripción del Proyecto**

**Forn Fire** es un sistema completo de administración web que permite gestionar en tiempo real un juego Battle Royale cooperativo desarrollado en Roblox Studio. El panel ofrece una interfaz moderna con efectos visuales avanzados y comunicación bidireccional con el servidor de juego.

### ✨ **Características Principales**

- 🔥 **Diseño Post-Apocalíptico** - Interfaz temática con efectos de fuego y partículas animadas
- ⚡ **Tiempo Real** - Conexión WebSocket para actualizaciones instantáneas
- 👥 **Gestión de Jugadores** - Monitoreo y control de usuarios conectados
- 🎮 **Control de Partidas** - Administración completa de matches y cola de jugadores
- 🔫 **Sistema de Armas** - Configuración y estadísticas de armamento
- 🗺️ **Gestión de Mapas** - Control de elementos del mundo de juego
- 📊 **Dashboard Avanzado** - Estadísticas del servidor y actividad en vivo
- 📱 **Diseño Responsive** - Funciona perfectamente en cualquier dispositivo

---

## 🛠️ **Stack Tecnológico**

### **Frontend**
- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) **HTML5** - Estructura del panel
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) **CSS3** - Estilos avanzados y animaciones
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) **JavaScript ES6+** - Lógica del cliente y tiempo real

### **Backend**
- ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) **Node.js** - Servidor de aplicaciones
- ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white) **Express.js** - Framework web
- ![WebSocket](https://img.shields.io/badge/WebSocket-4F4F4F?style=flat&logo=websocket&logoColor=white) **WebSocket** - Comunicación en tiempo real

### **Integración**
- ![Roblox](https://img.shields.io/badge/Roblox-00A2FF?style=flat&logo=roblox&logoColor=white) **Roblox Studio** - Motor de juego
- ![Lua](https://img.shields.io/badge/Lua-2C2D72?style=flat&logo=lua&logoColor=white) **Lua** - Scripts del servidor de juego

### **Deployment**
- ![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat&logo=github&logoColor=white) **GitHub Pages** - Hosting del frontend
- ![Heroku](https://img.shields.io/badge/Heroku-430098?style=flat&logo=heroku&logoColor=white) **Heroku** - Servidor backend (opcional)

---

## 🚀 **Instalación Rápida**

### **📋 Prerrequisitos**

- ![Node.js](https://img.shields.io/badge/Node.js-v14+-43853D?style=flat&logo=node.js&logoColor=white) **Node.js 14+**
- ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) **Git**
- ![Roblox Studio](https://img.shields.io/badge/Roblox%20Studio-00A2FF?style=flat&logo=roblox&logoColor=white) **Roblox Studio**

### **⚡ Instalación en 3 pasos**

```bash
# 1️⃣ Clonar el repositorio
git clone https://github.com/MaxVicioHack/forn_fire_web.git
cd forn_fire_web

# 2️⃣ Instalar dependencias
npm install

# 3️⃣ Iniciar el servidor
npm start
```

**🌐 Abrir en navegador:** http://localhost:3000

---

## 🎮 **Configuración en Roblox Studio**

### **1️⃣ Habilitar HTTP Requests**
```
Home → Settings → Security → Allow HTTP Requests ✅
```

### **2️⃣ Instalar WebConnector**
El script `WebConnector.lua` ya está incluido en el proyecto y debe colocarse en `ServerScriptService`.

### **3️⃣ Configurar URL del servidor**
```lua
-- En WebConnector.lua, línea 8
local WEB_SERVER_URL = "http://localhost:3000/api/update" -- Local
-- o
local WEB_SERVER_URL = "https://tu-servidor.herokuapp.com/api/update" -- Producción
```

---

## 📊 **Arquitectura del Sistema**

```mermaid
graph TB
    A[Roblox Studio] -->|HTTP POST| B[Node.js API Server]
    B -->|WebSocket| C[Web Panel]
    C -->|Commands| B
    B -->|HTTP Response| A
    
    D[GitHub Pages] -->|Static Files| C
    E[Heroku/Server] -->|API Hosting| B
    
    subgraph "Roblox Game"
        A
        F[WebConnector Script]
        G[Game Events]
    end
    
    subgraph "Web Panel"
        C
        H[Dashboard]
        I[Player Management]
        J[Match Control]
    end
```

---

## 🔥 **Capturas de Pantalla**

<div align="center">

### **🏠 Dashboard Principal**
![Dashboard](https://via.placeholder.com/600x300/1a1a2e/ff6b35?text=Dashboard+Principal)

### **👥 Gestión de Jugadores**
![Players](https://via.placeholder.com/600x300/1a1a2e/ff8c42?text=Gestion+de+Jugadores)

### **🎮 Control de Partidas**
![Matches](https://via.placeholder.com/600x300/1a1a2e/ff6b35?text=Control+de+Partidas)

</div>

---

## 📡 **API Documentation**

### **Endpoints Principales**

#### **🔍 GET `/api/gamestate`**
Obtiene el estado completo del juego.

```json
{
  "success": true,
  "data": {
    "server": { "status": "online", "uptime": 1640995200000 },
    "players": [{ "name": "MaxVixioHack", "kills": 5, "status": "online" }],
    "stats": { "playersOnline": 1, "totalKills": 15 }
  }
}
```

#### **📤 POST `/api/update`**
Actualiza datos desde Roblox Studio.

```json
{
  "type": "players",
  "data": [
    { "name": "Player1", "kills": 3, "status": "online" }
  ]
}
```

#### **🎮 POST `/api/command`**
Envía comandos al servidor de Roblox.

```json
{
  "action": "kick_player",
  "target": "PlayerName",
  "data": null
}
```

---

## 🔧 **Configuración Avanzada**

### **🌐 Variables de Entorno**

```env
PORT=3000
WS_PORT=8080
ROBLOX_API_KEY=your_api_key_here
NODE_ENV=production
```

### **⚙️ Configuración del Juego**

```javascript
// config/game.js
module.exports = {
  maxPlayers: 100,
  matchDuration: 1200, // 20 minutos
  weaponDamage: {
    AR: 35,
    RocketLauncher: 100,
    BowWeapon: 50
  }
};
```

---

## 🎯 **Casos de Uso**

### **👨‍💼 Para Administradores**
- ✅ Monitorear jugadores en tiempo real
- ✅ Gestionar partidas activas
- ✅ Controlar configuración del servidor
- ✅ Ver estadísticas detalladas

### **👨‍💻 Para Desarrolladores**
- ✅ Debugging de mecánicas de juego
- ✅ Testing de balanceo de armas
- ✅ Análisis de rendimiento del servidor
- ✅ Monitoreo de errores

### **🎮 Para Comunidades**
- ✅ Torneos organizados
- ✅ Eventos especiales
- ✅ Moderar comportamiento tóxico
- ✅ Estadísticas públicas

---

## 🤝 **Contribución**

¡Las contribuciones son bienvenidas! Para contribuir:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### **📋 Áreas de Contribución**
- 🎨 **UI/UX** - Mejoras en el diseño
- ⚡ **Performance** - Optimizaciones
- 🔧 **Features** - Nuevas funcionalidades
- 🐛 **Bug Fixes** - Corrección de errores
- 📖 **Documentation** - Mejoras en docs

---

## 📈 **Roadmap**

### **🔄 Versión Actual (2.0.0)**
- ✅ Panel web completo
- ✅ Comunicación tiempo real
- ✅ Gestión de jugadores
- ✅ Control de partidas

### **🚀 Próximas Versiones**

#### **v2.1.0 - Mejoras de UI**
- 🎨 Temas personalizables
- 📱 App móvil nativa
- 🔔 Notificaciones push
- 📊 Gráficos avanzados

#### **v2.2.0 - Analytics**
- 📈 Dashboard de analytics
- 🎯 Métricas de jugadores
- 📊 Reportes automáticos
- 🔍 Sistema de logs

#### **v3.0.0 - Escalabilidad**
- 🏗️ Arquitectura de microservicios
- 🗄️ Base de datos distribuida
- ☁️ Deploy en la nube
- 🔐 Autenticación avanzada

---

## 🐛 **Resolución de Problemas**

### **❌ Error: "HTTP Requests not enabled"**
**Solución:**
```
1. Abrir Roblox Studio
2. Home → Settings → Security
3. Activar "Allow HTTP Requests"
4. Reiniciar Roblox Studio
```

### **❌ Error: "Connection refused"**
**Solución:**
```bash
# Verificar que el servidor esté ejecutándose
npm start

# Verificar puerto disponible
netstat -an | grep 3000
```

### **❌ Error: "WebSocket connection failed"**
**Solución:**
```javascript
// Verificar configuración en realtime.js
this.wsUrl = 'ws://localhost:8080'; // Local
// o
this.wsUrl = 'wss://tu-servidor.com'; // Producción
```

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 MaxVixioHack

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

---

## 👨‍💻 **Autor**

<div align="center">

**MaxVixioHack**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MaxVicioHack)
[![Roblox](https://img.shields.io/badge/Roblox-00A2FF?style=for-the-badge&logo=roblox&logoColor=white)](https://www.roblox.com/users/6163489980/profile)

*Desarrollador de juegos apasionado por crear experiencias únicas en Roblox*

**Con la asistencia de ChuyMine (Claude AI)**

</div>

---

## 🙏 **Agradecimientos**

- 🎮 **Roblox Corporation** - Por la plataforma de desarrollo
- 🌐 **GitHub** - Por el hosting gratuito
- 💻 **Node.js Community** - Por las herramientas increíbles
- 🎨 **CSS Grid & Flexbox** - Por hacer posible el diseño responsive
- 🔥 **Toda la comunidad** - Por el feedback y sugerencias

---

## 📊 **Estadísticas del Proyecto**

![GitHub stars](https://img.shields.io/github/stars/MaxVicioHack/forn_fire_web?style=social)
![GitHub forks](https://img.shields.io/github/forks/MaxVicioHack/forn_fire_web?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/MaxVicioHack/forn_fire_web?style=social)

![Lines of Code](https://img.shields.io/tokei/lines/github/MaxVicioHack/forn_fire_web)
![Code Size](https://img.shields.io/github/languages/code-size/MaxVicioHack/forn_fire_web)
![Repo Size](https://img.shields.io/github/repo-size/MaxVicioHack/forn_fire_web)

---

<div align="center">

**🔥 ¡Hecho con ❤️ para la comunidad de Roblox! 🔥**

*Si este proyecto te ayudó, ¡no olvides darle una ⭐!*

</div>
