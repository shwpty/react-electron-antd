const http2 = require('http2');

const { HTTP2_HEADER_PATH } = http2.constants;

const server = http2.createServer();

server.on("stream", (stream, headers) => {
  let data = '';
  stream.on('data', (chunk) => {
    data += chunk;
  });

  stream.on('end', async () => {
    if (headers[":method"] === 'GET') {
      stream.write('get method data')
      stream.end('get method end')
    }
    else if (headers[":path"] === '/mdbservice/cluster' && headers[":method"] === 'POST') {
      const requestData = JSON.parse(data);
      if (requestData.operation === 'clear') {
        stream.respond({ ":status": 200 });
        stream.end('clear success');
      } else if (requestData.operation === 'all') {
        stream.respond({ ":status": 200 });
        stream.end('{"cluster":[{"nodeid":"1","ip:port":"10.10.192.56:7701","master":1,"state":2,"replica":[1,2 ]},{"nodeid":"2","ip:port":"10.10.176.64:7702","master":0,"state":3,"replica":[1,2 ]},{"nodeid":"3","ip:port":"10.10.192.56:7703","master":1,"state":2,"replica":[3,4 ]},{"nodeid":"4","ip:port":"10.10.176.64:7704","master":0,"state":3,"replica":[3,4 ]},{"nodeid":"5","ip:port":"10.10.192.56:7705","master":1,"state":2,"replica":[5,6 ]},{"nodeid":"6","ip:port":"10.10.176.64:7706","master":0,"state":3,"replica":[5,6 ]}],"pendingnode":"","runningnode":"1,2,3,4,5,6","slotlist":[       {          "NodeId" : 1,          "Slot" : [ 0, 66 ]       },       {          "NodeId" : 3,          "Slot" : [ 100, 166 ]       } ,{"NodeId" : 5,"Slot" : [ 67, 99, 167, 200 ]}   ]}');
      } else if (requestData.operation === 'expand') {
        stream.respond({ ":status": 200 });
        stream.end('{"Replica" : [ 1, 2, 3, 4, 5, 6 ],"SlotList" : [{"NodeId" : 1,"Slot" : [ 0, 66 ]},{"NodeId" : 3,"Slot" : [ 100, 166 ]},{"NodeId" : 5,"Slot" : [ 67, 99, 167, 200 ]}]}');
      } else if (requestData.operation === 'remove')  {
        stream.respond({ ":status": 200 });
        stream.end('{"Replica" : [ 1, 2, 3, 4 ],"SlotList" : [{"NodeId" : 1,"Slot" : [ 0, 99 ]},{"NodeId" : 3,"Slot" : [ 100, 200 ]}]}');
      } else if (requestData.operation === 'process') {
        for (let i = 1; i <= 67; i++) {
          stream.pushStream(
              { [HTTP2_HEADER_PATH]: "/random" + i},
              (err, pushStream) => {
              console.log(`push ${i}`);
              pushStream.respond({ ":status": 200 });
              const randomInt = Math.floor(Math.random() * 100) + 1;
              const pushedData = randomInt.toString();
              pushStream.end(`push ${pushedData}`);
              }
          );
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
        }
        stream.end('post method end');
      }
    }
    else if (headers[":path"] === '/test') {
      stream.respond({ ":status": 200 });
      stream.end('test');
    }
  });
});


server.listen(9090, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`Server listening on: 9090`);
});