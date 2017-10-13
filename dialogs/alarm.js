var botbuilder = require('botbuilder');

const library = new botbuilder.Library('alarm');

library.dialog('dialog', [

    function(session, args, next) {
        if (!session.userData.alarms) {
            session.userData.alarms = [];
        }
        botbuilder.Prompts.choice(session, "Bienvenue ! Que voulez vous faire ?", "Créer une nouvelle alarme|Voir toutes les alarmes|Voir les alarmes à venir", { listStyle: botbuilder.ListStyle.button });
        next();
    },
    function (session, results, next) {
        if (results.response.index == 0) {
            session.dialogData.currentAlarm = {};
            if (!session.dialogData.currentAlarm.name) {
                botbuilder.Prompts.text(session, "Veuillez renseigner le nom de votre alarme.");
            } else {
                next();
            }
        } else if (results.response.index == 1) {
            if (session.userData.alarms.length == 0) {
                session.send('Vous n\'avez aucune alarme');
            } else {
                var msg = new botbuilder.Message(session);
                msg.attachmentLayout(botbuilder.AttachmentLayout.carousel);
                var richcards = [];
                for (var i = 0; i<session.userData.alarms.length; i++) {
                    var alarm_number = i+1;
                    var date = session.userData.alarms[i].date.replace(/T/, ' ').replace(/\..+/, '');
                    var richcard =  new botbuilder.HeroCard(session)
                                    .title("Alarme n°" + alarm_number)
                                    .subtitle("Nom : " + session.userData.alarms[i].name)
                                    .text("Date/heure : " + date + "\n \r" +
                                        "Date de création : " + session.userData.alarms[i].creationDate)
                    richcards.push(richcard)
                }
                msg.attachments(richcards);
                session.send(msg).endDialog();
                session.beginDialog('alarm:dialog', session.dialogData = {});
            }
        } else {
            if (session.userData.alarms.length == 0) {
                session.send('Vous n\'avez aucune alarme');
            } else {
                var msg = new botbuilder.Message(session);
                msg.attachmentLayout(botbuilder.AttachmentLayout.carousel);
                var richcards = [];
                for (var i = 0; i<session.userData.alarms.length; i++) {
                    if (new Date(session.userData.alarms[i].date).getTime() > new Date().getTime()) {
                        var alarm_number = i+1;
                        var date = session.userData.alarms[i].date.replace(/T/, ' ').replace(/\..+/, '');
                        var richcard =  new botbuilder.HeroCard(session)
                            .title("Alarme n°" + alarm_number)
                            .subtitle("Nom : " + session.userData.alarms[i].name)
                            .text("Date/heure : " + date + "\n \r" +
                                "Date de création : " + session.userData.alarms[i].creationDate)
                        richcards.push(richcard)
                    }
                }
                if (richcards.length > 0) {
                    msg.attachments(richcards);
                } else{
                    session.send('Vous n\'avez pas d\'alarme ');
                }
                session.send(msg).endDialog();
                session.beginDialog('alarm:dialog', session.dialogData = {});
            }
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.currentAlarm.name = results.response;
        }
        if (!session.dialogData.currentAlarm.date) {
            botbuilder.Prompts.time(session, "Renseignez la date de début de votre séjour (ex: 10/05/2018 10:54).");
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.currentAlarm.date = botbuilder.EntityRecognizer.resolveTime([results.response]);
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1;

            var yyyy = today.getFullYear();
            if(dd<10){
                dd='0'+dd;
            }
            if(mm<10){
                mm='0'+mm;
            }
            session.dialogData.currentAlarm.creationDate = yyyy+'-'+mm+'-'+dd;
            session.userData.alarms.push(session.dialogData.currentAlarm);
        }
        session.endDialogWithResult({ response: session.dialogData });
    },
    function (session, results) {
        session.dialogData = results.response;
        session.replaceDialog('dialog', { reprompt: true });
    }
]).endConversationAction('cancelAction', 'Votre alarme est annulée.', {
    matches: /^annuler/i
});

module.exports = library;