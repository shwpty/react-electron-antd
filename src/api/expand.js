const { ipcMain } = require('electron');
const http2 = require('http2');
const { SERVER_URL } = require('../constants');

// ipcMain.on('expand-request', (event, nodeIds) => {
    const client = http2.connect(SERVER_URL);    

    const req = client.request({
        ':path': '/mdbservice/cluster',
        ':method': 'POST',
        'content-type': 'application/x-www-form-urlencoded'
    });

    req.on('response', (headers) => {
        let response = '';

        req.on('data', (chunk) => {
            response += chunk;
        });

        req.on('end', () => {
            // event.reply('expand-response', response);
            console.log('expand-response', response);
            client.close();
        });
    });

    req.write(JSON.stringify({
        "operation": "expand",
        "nodelist": "5,6"
    }));

    req.end();
// });
