const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { ApplicationCommandType } = require('discord-api-types/v9');
const { MessageEmbed } = require('discord.js');
const config = require('../../../utility/config')
class AlertModCmd extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Alert moderators to major rule violations',
			cooldownDelay: Time.Second * 60,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async contextMenuRun(interaction) {
		await interaction.deferReply({ ephemeral: true });

		if(interaction.guild.id !== '720339214641791006') return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x2f3136, 'Error', `This can only be used in the main server, contact department high command if it violates the rules!`, true);

		const channel = await this.container.client.channels.fetch(interaction.channelId);
		if(!channel) return;

		const message = await channel.messages.fetch(interaction.targetId);

        let Embed = new MessageEmbed()
            .setColor(0x2f3136)
            .setDescription(`**Moderator Alert** | [${interaction.guild.name}](https://discord.com/channels/${interaction.guildId}) | <@${interaction.user.id}>`)
			.addField(`Reported Message Content`, `\`\`\`${message.content}\`\`\`\n[Jump to message](https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${interaction.targetId})`, false)
			.addField(`Reported User`, `<@${message.author.id}>`)
            .setTimestamp(Date.now())
			.setFooter(`${interaction.user.id} \u200B`, interaction.user.displayAvatarURL());
            

        this.container.client.botFunctions.log(this.container.client, "1", 'callLogs', { embeds: [Embed], content: `<@&974217266113683486>` });
        return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x2f3136, 'Moderators Notified', `Moderation staff have been notified!`, true);
	}

	registerApplicationCommands(registry) {
		registry.registerContextMenuCommand(
		(builder) =>
			builder
				.setName('Flag Message')
				.setType(ApplicationCommandType.Message),
		{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	};
}

exports.AlertModCmd = AlertModCmd;
