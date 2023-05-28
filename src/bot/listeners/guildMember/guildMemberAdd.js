const { Listener } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const database = require('../../../utility/database');
class GuildMemberAddEvent extends Listener {
	constructor(context, options) {
		super(context, {
			...options,
			once: false,
			event: 'guildMemberAdd',
		});
	}

	async run(member) {
		if (member.user.bot) { return; }

		const Embed = new MessageEmbed()
			.setColor(3553598)
			.setDescription(`**Member Joined [${member.guild.name}](https://discordapp.com/channels/${member.guild.id})** | ${member} (${member.user.tag}) [${member.user.id}]`)
			.setTimestamp(Date.now())
			.setFooter('\u200B', member.user.displayAvatarURL());

		this.emitter.botFunctions.log(this.emitter, member.guild.id, 'joinLog', { embeds: [Embed] });

		this.emitter.botFunctions.updateMember(this.emitter, member);

		const pendinginvite = await database.Schemas.PendingInvites.findOne({ userId: member.id })
		if(pendinginvite && pendinginvite.guildId === member.guild.id){
			const mainguild = this.emitter.guilds.cache.get('720339214641791006')
			const pendinginvitechannel = await mainguild.channels.fetch(pendinginvite.channelId)

			if(pendinginvitechannel){
				pendinginvitechannel.delete().then(async () =>{
					await database.Schemas.PendingInvites.deleteOne({ userId: member.id, guildId: member.guild.id})
				})
			}
		}
	}
}


exports.GuildMemberAddEvent = GuildMemberAddEvent;
