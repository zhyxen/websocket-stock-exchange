const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let assets = [
    { id: 1, name: 'Bitcoin (BTC)', price: 65000 },
    { id: 2, name: 'Ethereum (ETH)', price: 3500 },
    { id: 3, name: 'Apple Inc. (AAPL)', price: 230 }
];

wss.on('connection', (ws) => {
    console.log('Клієнт підключився до біржі');

    ws.send(JSON.stringify({ type: 'GET_ASSETS', payload: assets }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'ADD_ASSET') {
            const newAsset = {
                id: Date.now(),
                name: data.payload.name,
                price: Number(data.payload.price)
            };
            assets.push(newAsset);
        } else if (data.type === 'UPDATE_PRICE') {
            assets = assets.map(a => 
                a.id === Number(data.payload.id) ? { ...a, price: Number(data.payload.price) } : a
            );
        }

        const response = JSON.stringify({ type: 'UPDATE_ASSETS', payload: assets });
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(response);
            }
        });
    });

    ws.on('close', () => console.log('Клієнт відключився'));
});

console.log('WebSocket сервер біржі запущено на ws://localhost:8080');