module.exports = function (router) {
    router.get('/audiences/torrents/:cookie/:passkey/:promotion?', require('./audiences'));
    router.get('/hhclub/torrents/:cookie/:passkey/:promotion?', require('./hhclub'));
    router.get('/hddolby/torrents/:cookie/:passkey/:promotion?', require('./hddolby'));
    router.get('/mteam/torrents/:cookie/:passkey/:promotion?', require('./m-team'));
    router.get('/mteam/adult/:cookie/:passkey/:promotion?', require('./m-team-adult'));
};
