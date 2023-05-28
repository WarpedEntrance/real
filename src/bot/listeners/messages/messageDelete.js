const { Listener } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');

class MessageDeleteEvent extends Listener {
	constructor(context, options) {
		super(context, {
			...options,
			once: false,
			event: 'messageDelete',
		});
	}

	async run(message) {
		if (message.partial || !message.guild || message.embeds.length > 0) return;

		let cleanMessage = message.cleanContent.replace(/`/g, '');
		if (cleanMessage.length >= 1024) { cleanMessage = `${cleanMessage.slice(0, 975)}...`;}

		const Embed = new MessageEmbed()
			.setColor(3553598)
			.setAuthor(`${message.author.tag} (${message.author.id})`, `${message.member.displayAvatarURL()}`)
			.setTimestamp(Date.now())
			.setDescription(`**Message sent by ${message.member} was** *deleted* **in ${message.channel}.**`)
			.addField('Message', `${cleanMessage}`, false)
		;

		// Catch ghost pings
		if ((message.mentions.members.size >= 1 || message.mentions.users.size >= 1 || message.mentions.roles.size >= 1)) {
			Embed.setColor(16740193);
		}

		// Try and fetch mod
		const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' }).then(audit => audit.entries.first());
		if (entry.target.id === message.author.id && entry.createdTimestamp > (Date.now() - 5000)) {
			const deleter = message.guild.members.cache.get(entry.executor.id);
			if (deleter && !deleter.user.bot) {
				Embed.setFooter(`Deleted By: ${deleter.user.tag}`, deleter.user.displayAvatarURL());
			}
		}

		return this.emitter.botFunctions.log(this.emitter, message.guild.id, 'messageLog', { embeds: [Embed] });
	}
}


exports.MessageDeleteEvent = MessageDeleteEvent;
