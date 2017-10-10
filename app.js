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
        session.beginDialog('reservation', session.dialogData.reservation);
    },
    function (session, results) {
        session.dialogData.reservation = results.response;
        session.send(`Reservation enregistrée. <br/> Voici les détails: <br/>Date/Heure: ${session.dialogData.reservation.date} <br/>Nombre de personnes: ${session.dialogData.reservation.size} <br/>Nom: ${session.dialogData.reservation.name}`);
    }
]);

bot.dialog('reservation', [

    function (session, args, next) {
        session.dialogData.reservation = args || {};
        if (!session.dialogData.reservation.date) {
            botbuilder.Prompts.text(session, "Veuillez renseigner la date de votre réservation (ex: 6 octobre à 18h)");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.reservation.date = results.response;
        }
        if (!session.dialogData.reservation.size) {
            botbuilder.Prompts.text(session, "Combien de personne y aura t il ?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.reservation.size = results.response;
        }
        if (!session.dialogData.reservation.name) {
            botbuilder.Prompts.text(session, "A quel nom est la réservation ?");
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.reservation.name = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.reservation });
    }
]);