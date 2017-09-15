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

var bot = new botbuilder.UniversalBot(connector, function(session){

    // Setup bot response when message sent
    session.send('you have tapped: %s | [length %s]', session.message.text, session.message.text.length);
    session.send('Type : %s', session.message.type);

    bot.on('typing', function(message) {
        bot.send(new botbuilder.Message().address(message.address).text('Aller michel, tu peux le faire !!'))
    });

    // Setup event listener for conversationUpdate event
    bot.on('conversationUpdate', function (message) {

        // Check if new member is added
        if (message.membersAdded && message.membersAdded.length > 0) {
            var membersAdded = message.membersAdded
                .map(function (m) {
                    var isSelf = m.id === message.address.bot.id;
                    return (isSelf ? message.address.bot.name : m.name) || '' + ' (Id: ' + m.id + ')';
                })
                .join(', ');
    
            bot.send(new botbuilder.Message()
                .address(message.address)
                .text('Bienvenue à toi ' + membersAdded));
        }
    
        // Check if member is removed
        if (message.membersRemoved && message.membersRemoved.length > 0) {
            var membersRemoved = message.membersRemoved
                .map(function (m) {
                    var isSelf = m.id === message.address.bot.id;
                    return (isSelf ? message.address.bot.name : m.name) || '' + ' (Id: ' + m.id + ')';
                })
                .join(', ');
    
            bot.send(new botbuilder.Message()
                .address(message.address)
                .text(membersRemoved + ' nous a quitté :('));
        }
    });

    //session.send(JSON.stringify(session.dialogData));
    //session.send(JSON.stringify(session.sessionState));    
    //session.send(JSON.stringify(session.conversationData));
    //session.send(JSON.stringify(session.userData));    
})