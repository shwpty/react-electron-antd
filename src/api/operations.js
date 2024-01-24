const { ipcMain } = require('electron');
const http2 = require('http2');
const { SERVER_URL } = require('../constants');
const client = http2.connect(SERVER_URL);

// clear
ipcMain.on('clear-request', (event, data) => {
    const req = client.request({
        ':path': '/mdbservice/cluster',
        ':method': 'POST',
        'content-type': 'application/x-www-form-urlencoded'
    });

    // req.on('response', (headers) => {});

    // let response = '';

    // req.on('data', (chunk) => {
    //     response += chunk;
    // });

    // req.on('end', () => {
    //     event.reply('clear-response', response);
    //     // client.close();
    // });

    req.write(JSON.stringify({
        "operation": "clear"
    }));

    req.end();
});

// all
ipcMain.on('getall-request', (event, data) => {
    // get
    const reqGet = client.request({
        ':path': '/mdbservice/cluster',
        ':method': 'GET'
    });

    reqGet.on('data', (data) => {    
        event.reply('getdata', data);  
    });

    reqGet.on('end', (data) => {
        event.reply('getend',data);
    });

    // all
    const req = client.request({
        ':path': '/mdbservice/cluster',   
        ':method': 'POST',
        'content-type': 'application/x-www-form-urlencoded'
    });

    req.on('response', (headers) => {});

    let response = '';

    req.on('data', (chunk) => {
        response += chunk;
    });

    req.on('end', () => {
        event.reply('getall-response', response);
        // client.close();
    });

    req.write(JSON.stringify({
        "operation": "all"
    }));

    req.end();
});

// expand
ipcMain.on('expand-request', (event, nodeIds) => {
    const req = client.request({
        ':path': '/mdbservice/cluster',
        ':method': 'POST',
        'content-type': 'application/x-www-form-urlencoded'
    });

    req.on('response', (headers) => {});

    let response = '';

    req.on('data', (chunk) => {
        response += chunk;
    });

    req.on('end', () => {
        event.reply('expand-response', response);
        // client.close();
    });

    req.write(JSON.stringify({
        "operation": "expand",
        "nodelist": nodeIds.join(',')
    }));

    req.end();
});

// remove
ipcMain.on('remove-request', (event, nodeIds) => {
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
            event.reply('remove-response', response);
            // client.close();
        });
    });
  
    req.write(JSON.stringify({
        "operation": "remove",
        "nodelist": nodeIds.join(',')
    }));
  
    req.end();
});

//get
// ipcMain.on('get', (event, data) => {
//     const reqGet = client.request({
//         ':path': '/mdbservice/cluster',
//         ':method': 'GET'
//     });

//     reqGet.on('response', (headers) => {    
//         let responseGet = '';

//         reqGet.on('data', (chunk) => {
//             responseGet += chunk;
//         });

//         reqGet.on('end', () => {
//             event.reply('get-push', responseGet);
//         });
//     });

//     reqGet.end();
// });

// process
ipcMain.on('process-request', (event, data) => {
    let count = 0;
    
    client.on('stream', (pushedStream, headers) => {
        pushedStream.on('push', (responseHeaders) => {
            console.log('Received a push stream with headers:', responseHeaders);
            event.reply('stream_push', responseHeaders);
        });
        let data = '';
        pushedStream.on('data', (chunk) => {
            data += chunk;
            event.reply('pushedData', data);
            count += 1;
            event.reply('Counting Number', count);
        });
        pushedStream.on("end", () => {
            
        });
    });

    const req = client.request({
        ':path': '/mdbservice/cluster',
        ':method': 'POST',
        'content-type': 'application/x-www-form-urlencoded'
    });
    req.on('push', (data) => {
        event.reply('post_push',data);
    });

    let responseData = '';
    req.on('data', (data) => {
        responseData += data;
        event.reply('postdata', data);  
    });

    req.on('end', () => {
        event.reply('process-response',responseData);
        // client.close();
    });

    
    req.write(JSON.stringify({
        "operation": "process"
    }));

    req.end();


    // // post
    // const req = client.request({
    //     ':path': '/mdbservice/cluster',
    //     ':method': 'POST',
    //     'content-type': 'application/x-www-form-urlencoded'
    // });

    // req.on('response', (headers, flags) => {    
    //     req.on('push', (headers, pushStream, flags) => {
    //         // 获取推送的路径
    //         const pushedPath = headers[':path'];
        
    //         // 处理服务器推送的数据
    //         let pushedData = '';
    //         pushStream.on('data', (chunk) => {
    //           pushedData += chunk.toString();
    //         });
        
    //         pushStream.on('end', () => {
    //             event.reply('postpushdata', pushedData);
    //         });
    //     });

    //     let response = '';

    //     req.on('data', (chunk) => {
    //         response += chunk;
    //     });

    //     req.on('end', () => {
    //         event.reply('process-response', response);
    //         // client.close();
    //     });
    // });

    // req.write(JSON.stringify({
    //     "operation": "process"
    // }));

    // req.end();

});

