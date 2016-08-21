// List of commands available
var cmds = {
  'volup': 'bin\\nircmd.exe changesysvolume 2000',
  'voldown': 'bin\\nircmd.exe changesysvolume -2000',
  'mute': 'bin\\nircmd.exe mutesysvolume 2',
  'opencd': 'bin\\nircmd.exe cdrom open',
  'closecd': 'bin\\nircmd.exe cdrom close',
  'monitoroff': 'bin\\nircmd.exe monitor off',
  'monitoron': 'bin\\nircmd.exe sendmouse move 0 0'/*'nircmd.exe monitor on'*/,
  'stop': 'taskkill /F /IM nircmd.exe',
  'hardstop': 'taskkill /F /IM node.exe',
  'screen': 'bin\\nircmd.exe savescreenshotfull img/screen.jpg',
  'explorer': 'bin\\nircmd.exe sendkeypress lwin+e',
  'desktop': 'bin\\nircmd.exe sendkeypress lwin+d',
  'lock': 'Rundll32.exe user32.dll,LockWorkStation',
  'mouseleftclick': 'bin\\nircmd.exe sendmouse left click',
  'mouserightclick': 'bin\\nircmd.exe sendmouse right click',
  'mousemove': 'bin\\nircmd.exe sendmouse move',
  'medianext': 'bin\\nircmd.exe sendkeypress 0xB0', //https://msdn.microsoft.com/en-us/library/dd375731(VS.85).aspx
  'mediaprev': 'bin\\nircmd.exe sendkeypress 0xB1',
  'mediastop': 'bin\\nircmd.exe sendkeypress 0xB2',
  'mediaplaypause': 'bin\\nircmd.exe sendkeypress 0xB3'
}

// We load the differents modules required for the app
var http     = require('http'),
    fs       = require('fs'),
    del      = require('delete'),
    request  = require('request'),
    exec     = require('child_process').exec,
    port     = 7412;


// We create a server
http.createServer(function (req, res) {

    // If it's a command
    if(req.url.startsWith('/cmd')) {
        for(var key in cmds) {
            if(!cmds.hasOwnProperty(key)) continue;
            if(req.url == '/cmd/' + key) {
                if(req.url == '/cmd/screen') {
                    exec(cmds['screen'], function () {
                        var img = fs.readFileSync('./img/screen.jpg');
                        res.writeHead(200, {
                            'Content-Type': 'image/jpg',
                            'Cache-Control': 'no-store'
                        });
                        res.end(img, 'binary');
                        del.sync('./img/screen.jpg', {force: true});
                    });
                } else if(req.url == '/cmd/mousemove') {
                    if(req.method == 'POST') {
                        var text = '',
                            mouseX = '',
                            mouseY = '';
                        req.on('data', function (data) {
                            text += data;
                        });
                        req.on('end', function () {
                            mouseX = parseInt(text.split('&')[0].split('=')[1]);
                            mouseY = parseInt(text.split('&')[1].split('=')[1]);
                            exec(cmds['mousemove'] + ' ' + mouseX + ' ' + mouseY);
                            res.end();
                        });
                    } else res.end();
                } else {
                    exec(cmds[key]);
                    res.end();
                }
                console.log(req.connection.remoteAddress + ' -- ACTION=' + key);
            }
        }
    }

    // If it's a static file
    else {

        if(req.url == '/') {
            console.log(req.connection.remoteAddress + ' -- HOMEPAGE');
            var page = fs.readFileSync('./views/index.html');
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(page);
        } else if(req.url == '/bg.jpg') {
            var img = fs.readFileSync('./img/bg.jpg');
            res.writeHead(200, {'Content-Type': 'image/jpg'});
            res.end(img);
        } else if(req.url == '/logo.png') {
            var img = fs.readFileSync('./img/logo.png');
            res.writeHead(200, {'Content-Type': 'image/png'});
            res.end(img);
        } else if(req.url == '/favicon.ico') {
            var img = fs.readFileSync('./img/favicon.ico');
            res.writeHead(200, {'Content-Type': 'image/x-icon'});
            res.end(img);
        } else if(req.url == '/manifest.json') {
            var file = fs.readFileSync('./manifest.json');
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(file);
        } else res.end();

    }

}).listen(port);
console.log('Server running at : http://localhost:' + port);