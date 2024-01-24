const { ipcMain } = require('electron');
const http2 = require('http2');
const { SERVER_URL } = require('../constants');


ipcMain.on('process-request', (event, data) => {
    const client = http2.connect(SERVER_URL);  

    let count = 0;
    client.on('stream', (pushedStream, headers) => {
        pushedStream.on('push', (responseHeaders) => {
            console.log('Received a push stream with headers:', responseHeaders);
          });
          let data = '';
          pushedStream.on('data', (chunk) => {
            data += chunk;
            count += 1;
          });
          pushedStream.on("end", () => {
            event.reply('pushedData', data);
            event.reply('Counting Number', count);
          });
    });

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
            event.reply('process-response', response);
            client.close();
        });
    });

    req.write(JSON.stringify({
        "operation": "process"
    }));

    req.end();
});
