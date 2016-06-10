// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');

var eduDatabaseUri = process.env.EDU_MONGODB_URI;
var pmDatabaseUri = process.env.PM_MONGODB_URI;

if (!eduDatabaseUri || !pmDatabaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var eduApi = new ParseServer({
  databaseURI: eduDatabaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/edu/main.js',
  appId: process.env.EDU_APP_ID,
  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});


var pmApi = new ParseServer({
    databaseURI: pmDatabaseUri || 'mongodb://localhost:27017/dev',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/pm/main.js',
    appId: process.env.PM_APP_ID,
    masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
    serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
    liveQuery: {
        classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
    }
});

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

app.use('/parse/edu', eduApi);
app.use('/parse/pm', pmApi);



var dashboardConfig ={
    "allowInsecureHTTP": true,
    "apps": [
        {
            "serverURL": (process.env.SERVER_URL + '/edu') || 'http://localhost:1337/parse',
            "appId": process.env.EDU_APP_ID,
            "masterKey": "myMasterKey",
            "appName": "EduApp"
        },
        {
            "serverURL": (process.env.SERVER_URL + '/pm') || 'http://localhost:1337/parse',
            "appId": process.env.PM_APP_ID,
            "masterKey": "myMasterKey",
            "appName": "PmApp"
        }
    ],
    "users":[
        {
            "user":"admin",
            "pass":"pass"
        }

    ]
};

var dashboard = new ParseDashboard(dashboardConfig, dashboardConfig.allowInsecureHTTP);


app.use('/dashboard', dashboard);


// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
