const { Listener } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const googleUtil = require('../../../utility/googlegrouputility');
class GuildMemberRemoveEvent extends Listener {
	constructor(context, options) {
		super(context, {
			...options,
			once: false,
			event: 'guildMemberRemove',
		});
	}

	async run(member) {
		if (member.user.bot) { return; }

		const Embed = new MessageEmbed()
			.setColor(3553598)
			.setDescription(`**Member Left [${member.guild.name}](https://discordapp.com/channels/${member.guild.id})** | ${member} (${member.user.tag}) [${member.user.id}]`)
			.setTimestamp(Date.now())
			.setFooter('\u200B', member.user.displayAvatarURL());

		await googleUtil.updateUserGroups(member.id);

		if(member.guild.id === '720339214641791006'){
			const ticketsfound = await this.emitter.database.Schemas.Tickets.find({ ownerId: member.id })
			for(ticket in ticketsfound){
				if(ticket.open == true){
					const RelayChannel = await this.emitter.channels.fetch(ticket.staffChannelId);
					RelayChannel.send('Terminal has detected that this user has left the server, therefore being unable to access the ticket further.')
				}
			}
		}
		this.emitter.botFunctions.log(this.emitter, member.guild.id, 'joinLog', { embeds: [Embed] });

	}
}


exports.GuildMemberRemoveEvent = GuildMemberRemoveEvent;
