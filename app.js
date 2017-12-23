var restify = require('restify');
var botbuilder = require('botbuilder');

// Setup restify

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function(){
    console.log('%s bot started at %s', server.name, server.url);
});

// Setup connector
var connector = new botbuilder.ChatConnector({
   appId: process.env.APP_ID,
   appPassword: process.env.APP_PASSWORD
});

server.post('/api/messages', connector.listen());

var bot = new botbuilder.UniversalBot(connector, [

    function (session) {
        session.beginDialog('rh:offers', session.dialogData);
    },
]);

bot.library(require('./dialogs/rh'));