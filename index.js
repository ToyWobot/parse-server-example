// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');

var eduDatabaseUri = process.env.EDU_MONGODB_URI;
var alyDatabaseUri = process.env.MONGOLAB_COPPER_URI;

if (!eduDatabaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}


var eduApi = new ParseServer({
  databaseURI: eduDatabaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/edu/main.js',
  appId: process.env.EDU_APP_ID,
  masterKey: process.env.EDU_MASTER_KEY, //Add your master key here. Keep it secret!
  restAPIKey: process.env.EDU_REST_API_KEY,
  clientKey: process.env.EDU_CLIENT_KEY,
  serverURL: (process.env.SERVER_URL + '/edu'),  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  push :{
        android : {
            senderId: '316172193173',
            apiKey: 'AIzaSyB3SuPcXiEUvZCT284ctWJWG3pIQQyT9JE'
        },
        ios:[
            {
                pfx: __dirname + '/certs/eddy/Certificates_Eddy_APNS_Development.p12',
                bundleId: 'com.eddy.app',
                production: false
            },
            {
                pfx: __dirname + '/certs/eddy/Certificates_Eddy_APNS_Production.p12',
                bundleId: 'com.eddy.app',
                production: true
            }
        ]
    }
});


var alyApi = new ParseServer({
    databaseURI: alyDatabaseUri || 'mongodb://localhost:27017/dev',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: '3763213300',
    masterKey: 'BStgFP6PCX3MCTGYljUsHn7EUCeRu74u', //Add your master key here. Keep it secret!
    restAPIKey: 'REsA64SL5FIBIeZthgBDYWwY7daQpAm1',
    clientKey: 'RN2hNqvuelw4NyRNxrN3ELPPyAnD5cdk',
    serverURL: (process.env.SERVER_URL + '/aly'),  // Don't forget to change to https if needed
    liveQuery: {
        classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
    }
});

var app = express();
// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/parse/edu', eduApi);
app.use('/parse/aly', alyApi);

//var dashboardConfig ={
//    "allowInsecureHTTP": process.env.DASHBOARD_INSECURE_HTTP,
//    "apps": [
//        {
//            "serverURL": "https://tw-parse-server.herokuapp.com/parse/edu",
//            "appId": "3763213299",
//            "masterKey": "9jwczspNPUAbasjGSs0TcUklsxnbLzeG",
//            "appName": "EduApp",
//            "production": false
//        },
//        {
//            "serverURL": "https://tw-parse-server.herokuapp.com/parse/aly",
//            "appId": "3763213300",
//            "masterKey": "BStgFP6PCX3MCTGYljUsHn7EUCeRu74u",
//            "appName": "AlyApp",
//            "production": false
//        }
//    ],
//    "users":[
//        {
//            "user":"admin",
//            "pass":"pass"
//        }
//
//    ]
//};

var serverConfig = require('./server-config.json');
//var appServers = serverConfig.servers;
//Object.keys(appServers).forEach(function(appId) {
//    console.log(appId);
//    var appOptions = appServers[appId];
//    console.log(appOptions);
//    var appObject = new ParseServer(appOptions);
//    app.use('/parse/'+appId, appObject);
//});

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
