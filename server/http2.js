const http2 = require('http2')

const { HTTP2_HEADER_PATH } = http2.constants;

const server = http2.createServer({})


// 监听请求事件
server.on('request', (req, res) => {

  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });
    
  req.on('end',() => {
    if (req.url === '/mdbservice/cluster') {
      const requestData = JSON.parse(data)
      if (requestData.operation === 'all') {
        res.end('{"cluster":[{"nodeid":"1","ip:port":"10.10.192.56:7701","master":1,"state":2,"replica":[1,2 ]},{"nodeid":"2","ip:port":"10.10.176.64:7702","master":0,"state":3,"replica":[1,2 ]},{"nodeid":"3","ip:port":"10.10.192.56:7703","master":1,"state":2,"replica":[3,4 ]},{"nodeid":"4","ip:port":"10.10.176.64:7704","master":0,"state":3,"replica":[3,4 ]},{"nodeid":"5","ip:port":"10.10.192.56:7705","master":0,"state":1,"replica":[5,6 ]},{"nodeid":"6","ip:port":"10.10.176.64:7706","master":0,"state":1,"replica":[5,6 ]}],"pendingnode":"5,6","runningnode":"1,2,3,4","slotlist":[       {          "NodeId" : 1,          "Slot" : [ 0, 8190 ]       },       {          "NodeId" : 3,          "Slot" : [ 8191, 16383 ]       }    ]}')
      } else if (requestData.operation === 'expand') {
        res.end('{"Replica" : [ 1, 2, 3, 4, 5, 6 ],"SlotList" : [{"NodeId" : 1,"Slot" : [ 0, 5460 ]},{"NodeId" : 3,"Slot" : [ 8191, 13652 ]},{"NodeId" : 5,"Slot" : [ 5461, 8190, 13653, 16383 ]}]}')
      } else if (requestData.operation === 'process') {
        // res.end('Process end');
      }
    }
    else if (req.url === '/test') {
      res.end('test')
    }
  })
});

server.on("stream", (stream, headers) => {
  // 当有新的流(stream)被创建时，服务器会执行一个异步函数
  (async () => {
      let disconnected = false;
      stream.on("close", () => {
          disconnected = true;
      });
      for (let i = 1; i <= 1000; i++) {
          if (disconnected || !stream.pushAllowed) {
              break;
          }
          stream.pushStream(
              { [HTTP2_HEADER_PATH]: "/random" + i },
              (err, pushStream) => {
              console.log(`push ${i}`);
              pushStream.respond({ ":status": 200 });
              const randomInt = Math.floor(Math.random() * 100) + 1;
              const pushedData = randomInt.toString();
              pushStream.end(`push ${pushedData}`);
              }
          );
          // 在每次推送之后，服务器会等待一个随机的时间间隔
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));  // await!
      }
      if (!disconnected) stream.end("end stream");
  })();
});

server.listen(9090, (err) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(`Server listening on: 9090`)
})
