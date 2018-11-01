const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.write('<html>');
        res.write('<head>');
        res.write('<title>Enter message</title>');
        res.write('</head>');
        res.write('<body>');
        res.write('<form action="/message" method="POST">');
        res.write('<input type="text" name="message"><button type="submit">Send</button>');
        res.write('</form>');
        res.write('</body>');
        res.write('</html>');
        return res.end();
    }

    if (url === '/message' && method === 'POST') {
        // get request data
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        });

        // bail out after setting this handler.
        // The handler will send a response when finished parsing the body.
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split("=")[1]; // message=xxxxxxxxx
            fs.writeFile("message.txt", message, (err) => {
                if (err) {
                    // TODO handle this
                } else {
                    res.writeHead(302, { 'Location': '/' });
                    res.end();
                }
            });
        });
    }

    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 200;
    res.write('<html>');
    res.write('<head>');
    res.write('<title>First Page</title>');
    res.write('</head>');
    res.write('<body>');
    res.write('<h1>hi there</h1>');
    res.write('</body>');
    res.write('</html>');
    return res.end();
};

module.exports = requestHandler;