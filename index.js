// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');

var app = express();
// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

var serverConfig = require('./server-config.json');
var appServers = serverConfig.servers;

appServers.forEach(function(options) {
    var appObject = new ParseServer(options);
    var s = options.serverURL.split('/parse');
    var endPoint = '/parse'+ s[1];
    app.use(endPoint, appObject);
});

var dashboard = new ParseDashboard(serverConfig.dashboard, serverConfig.dashboard.allowInsecureHTTP);
app.use('/dashboard', dashboard);


// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
//app.get('/test', function(req, res) {
//  res.sendFile(path.join(__dirname, '/public/test.html'));
//});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
