const http2 = require('http2');
const { SERVER_URL } = require('../constants');

// 创建HTTP/2客户端
const client = http2.connect(SERVER_URL);
// const client = http2.connect('http://127.0.0.1:9090');


// 发起GET请求
const reqGet = client.request({ 
  ':path': '/mdbservice/cluster' ,
  ':method': 'GET'
});

reqGet.on('data', (data) => {
  console.log('get receive:', data.toString());
})
reqGet.on('end', (data) => {
  console.log('get end:', data);
})

reqGet.end();


// 发起POST请求
const req = client.request({ 
  ':path': '/mdbservice/cluster' ,
  ':method': 'POST',
  'content-type': 'application/x-www-form-urlencoded'
});

req.on('data', (chunk) => {
  console.log('Received data:', chunk.toString());
});

req.on('end', () => {
  console.log('Request ended');
  client.close();
});
  

req.write(JSON.stringify({
  "operation": "process"
}));

req.end();


// 为'stream'事件设置监听器
let count = 0;
client.on('stream',(pushedStream, requestHeaders) => {
  pushedStream.on('push',(responseHeaders) => {
    console.log('Received a push stream with headers:', responseHeaders);
  });
  let data = '';
  pushedStream.on('data', (chunk) => {
    data += chunk;
    count += 1;
  });
  pushedStream.on('end', () => {
    console.log('Received pushed data:', data);
    console.log('Number Counting:', count);
  })
  pushedStream.on('close', (enddata) => {
    console.log('push end',enddata)
  })
});


