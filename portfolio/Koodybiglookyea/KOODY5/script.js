const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {};
let food = [];

// Initialize some food
for (let i = 0; i < 100; i++) {
    food.push({ x: Math.random() * 3000, y: Math.random() * 3000, id: i });
}

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Create new player
    players[socket.id] = {
        x: 1500, y: 1500,
        angle: 0,
        body: [],
        length: 20,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    };

    // Send initial data
    socket.emit('init', { id: socket.id, players, food });

    // Handle movement input
    socket.on('updateAngle', (angle) => {
        if (players[socket.id]) players[socket.id].angle = angle;
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});

// Game Loop (Server-side physics)
setInterval(() => {
    for (let id in players) {
        let p = players[id];
        p.x += Math.cos(p.angle) * 4;
        p.y += Math.sin(p.angle) * 4;
        
        p.body.unshift({x: p.x, y: p.y});
        if (p.body.length > p.length) p.body.pop();
    }
    io.emit('gameState', { players, food });
}, 1000 / 60);

http.listen(3000, () => console.log('Server running on port 3000'));
