const { MessageEmbed } = require('discord.js');

module.exports = {
    emojis: {
        success: '<:CheckmarkGreen:1003757213036331008>',
        error: '<:XMarkRed:1003757215670349885>',
        warning: '<:warning:1003757405462593536>',
        info: '<:info:1003757465713778779>',
    },
    colors: {
        success: 0x00ff00,
        error: 0xff0000,
        warning: 0xffff00,
        info: 0x0000ff,
        blank: 0x2f3136
    },
    success: (title, msg) =>
        new MessageEmbed()
            .setDescription(`Terminal | ${title}\n${exports.emojis.success} ${msg}`)
            .setTimestamp()
            .setColor(success),
    failure: (title, msg) =>
        new MessageEmbed()
            .setDescription(`Terminal | ${title}\n${exports.emojis.error} ${msg}`)
            .setTimestamp()
            .setColor(error),
    warning: (title, msg) =>
        new MessageEmbed()
            .setDescription(`Terminal | ${title}\n${exports.emojis.warning} ${msg}`)
            .setTimestamp()
            .setColor(warning),
    info1: (title, msg) =>
        new MessageEmbed()
            .setDescription(`Terminal | ${title}\n${exports.emojis.info} ${msg}`)
            .setTimestamp()
            .setColor(info),
    info2: (title, msg) =>
        new MessageEmbed()
            .setDescription(`Terminal | ${title}\n${msg}`)
            .setTimestamp()
            .setColor(blank),

    templates: {
        success: (msg) =>
            new MessageEmbed()
                .setColor(success),
        failure: (msg) =>
            new MessageEmbed()
                .setColor(error),
        warning: (msg) =>
            new MessageEmbed()
                .setColor(warning),
        info1: (msg) =>
            new MessageEmbed()
                .setColor(info),
        info2: (msg) =>
            new MessageEmbed()
                .setColor(blank),
    }
    
}
