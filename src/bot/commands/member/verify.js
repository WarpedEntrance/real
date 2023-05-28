const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { ApplicationCommandType } = require('discord-api-types/v9');
const { MessageEmbed } = require('discord.js')
const config = require('../../../utility/config')

class UpdateCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: ['getroles'],
			description: 'Updates your roles, access, and permissions',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply({ ephemeral: true });	
		const Update = await this.container.client.botFunctions.updateMember(this.container.client, interaction.member);
		
		if (!Update) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'An error occured.', true);

		if (Update.success == false) {
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'User is not linked with bloxlink. Please go to https://blox.link/ to link your account.', true);
		}
		
		const Embed = new MessageEmbed()
			.setColor(0x30ed56)
			.setDescription('You have been verified successfully.')
			.setTimestamp(Date.now());

		if (Update.Added.length > 0 && Update.Added !== 'None') {
			Embed.addField('Roles Added', Update.Added, true)
		}
		if (Update.Removed.length > 0 && Update.Removed !== 'None') {
			Embed.addField('Roles Removed', Update.Removed, true)
		}
		return interaction.editReply({
			embeds: [Embed], ephemeral: true
		}, );
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.UpdateCommand = UpdateCommand;
