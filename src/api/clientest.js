// Creating and initializing client 
// by using http2.connect() method 
const http2 = require('http2'); 
const client = http2.connect( 
    'http://localhost:8000'); 
  
const req = client.request({  
  ':method':'GET', ':path':'/' }); 
  
req.on('response', (responseHeaders) => { 
  console.log("status:" 
  + responseHeaders[":status"]); 
}); 
  
req.on('data', (data) => { 
  console.log('Received: ', 
  data.toString().replace(/(\n)/gm,"")); 
}); 
  
req.on('end', () => { 
  client.close(() => { 
    console.log("client closed"); 
  }) 
});