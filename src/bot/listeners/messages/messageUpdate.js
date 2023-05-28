const { Listener } = require('@sapphire/framework');
const { MessageEmbed, Permissions } = require('discord.js');

class MessageUpdateEvent extends Listener {
	constructor(context, options) {
		super(context, {
			...options,
			once: false,
			event: 'messageUpdate',
		});
	}

	async run(oldMessage, newMessage) {
		if (oldMessage.content == newMessage.content) return;
		if (newMessage.webhookId !== null) return;
		if (newMessage.system) return;

		if (!newMessage.guild || !newMessage.member || newMessage.author.bot) return;

		if (newMessage.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
			//this.emitter.botFunctions.moderation.testMessage(this.emitter, newMessage);
		}

		let oldClean = oldMessage.cleanContent.replace(/`/g, '');
		let newClean = newMessage.cleanContent.replace(/`/g, '');
		if (oldClean.length >= 1024) { oldClean = `${oldClean.slice(0, 975)}...`;}
		if (newClean.length >= 1024) { newClean = `${newClean.slice(0, 975)}...`;}

		const Embed = new MessageEmbed()
			.setColor(3553598)
			.setAuthor(`${newMessage.author.tag} (${newMessage.author.id})`, `${newMessage.member.displayAvatarURL()}`)
			.setTimestamp(Date.now())
			.setDescription(`**Message sent by ${newMessage.member} was** *edited* **in ${newMessage.channel}.**`)
			.addField('Old Message', `${oldClean}`, false)
			.addField('New Message', `${newClean}`, false)
		;

		// Catch ghost pings
		if ((oldMessage.mentions.members.size >= 1 || oldMessage.mentions.users.size >= 1 || oldMessage.mentions.roles.size >= 1) && (newMessage.mentions.members.size <= 0 || newMessage.mentions.users.size <= 0 || newMessage.mentions.roles.size <= 0)) {
			Embed.setColor(16740193);
		}

		return this.emitter.botFunctions.log(this.emitter, newMessage.guild.id, 'messageLog', { embeds: [Embed] });
	}
}


exports.MessageUpdateEvent = MessageUpdateEvent;
