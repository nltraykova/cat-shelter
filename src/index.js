import http from 'http';

//request listener
const server = http.createServer((req, res) => {
    res.write('Hello World!');
    res.end();
});

server.listen(5000, () => console.log('Server running on htttp://localhost:5000...'));