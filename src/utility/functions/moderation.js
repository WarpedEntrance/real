// Houses all moderation functions
const database = require('../database');
const ms = require('ms')

module.exports = {
    async GetModeratorLevel(client, member) {
        const MainGuild = await client.guilds.fetch('720339214641791006')
        //if (!MainGuild) return { IsMod:false, Level:0 }

        const MemberInMainGuild = await MainGuild.members.fetch(member.id)

        const TerminalGuild = await client.guilds.fetch('958533142099140609')
        //const MemberInTerminalGuild = await TerminalGuild.members.fetch(member.id) ? await TerminalGuild.members.fetch(member.id) : undefined
        // Levels; 0 = Normal User | 1 = Probationary | 2 = Moderator | 3 = Senior Moderator | 4 = Lead Moderator | 5 = Council | 6 = Founder
        if (MemberInMainGuild.roles.cache.has('955619374423760937')) {
            return {isMod: true, level: 6}
        } else if (MemberInMainGuild.roles.cache.has('720671862509535353')) {
            return {isMod: true, level: 5}
        } else if (MemberInMainGuild.roles.cache.has('997244401749344307')) {
             return {isMod: true, level: 5}
        } else if (MemberInMainGuild.roles.cache.has('955667607938277456')) {
            return {isMod: true, level: 4}
        } else if (MemberInMainGuild.roles.cache.has('958902257020199002')) {
            return {isMod: true, level: 3}
        } else if (MemberInMainGuild.roles.cache.has('955624811512594472')) {
            return {isMod: true, level: 2}
        } else if (MemberInMainGuild.roles.cache.has('984617237333815306')) {
            return {isMod: true, level: 1}
        } else {
            return {isMod: false, level: 0}
        }
    }, 

    async NewWarning(data) {
        // Create a new warn
        const Warn = new database.Schemas.Warns();
        Warn.userId = data.userid;
        Warn.reason = data.reason;
        Warn.evidence = data.evidence;
        Warn.moderatorId = data.moderatorid;
        Warn.date = new Date();
        Warn.expiry = new Date(Date.now() + ms(data.length !== null ? data.length : '90000d'));
        Warn.save();
        return Warn;
    },

    async NewMute(data) {
        // Create a new mute
        const Mute = new database.Schemas.Mutes();
        Mute.userId = data.userid;
        Mute.reason = data.reason;
        Mute.evidence = data.evidence;
        Mute.moderatorId = data.moderatorid;
        Mute.date = new Date();
        Mute.expiry = new Date(Date.now() + ms(data.length !== null ? data.length : '90000d'));
        Mute.save();
        return Mute;
    },

    async NewKick(data) {
        // Create a new kick
        const Kick = new database.Schemas.Kicks();
        Kick.userId = data.userid;
        Kick.reason = data.reason;
        Kick.evidence = data.evidence;
        Kick.moderatorId = data.moderatorid;
        Kick.date = new Date();
        Kick.save();
        return Kick;
    },

    async NewBan(data) {
        // Create a new kick
        const Ban = new database.Schemas.Bans();
        Ban.userId = data.userid;
        Ban.reason = data.reason;
        Ban.evidence = data.evidence;
        Ban.moderatorId = data.moderatorid;
        Ban.expiry = new Date(Date.now() + ms(data.length !== null ? data.length : '90000d'));
        Ban.date = new Date();
        Ban.save();
        return Ban;
    },

    async NewGameban(data) {
        // Create a new kick
        const Ban = new database.Schemas.Infractions_Bans();
        Ban.userId = data.userid;
        Ban.reason = data.reason;
        Ban.evidence = data.evidence;
        Ban.bannedBy = data.moderatorid;
        Ban.expiry = new Date(Date.now() + ms(data.expiry));
        Ban.date = new Date();
        Ban.save();
        return Ban;
    },
}