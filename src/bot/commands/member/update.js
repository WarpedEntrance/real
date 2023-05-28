const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { ApplicationCommandType } = require('discord-api-types/v9');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const config = require('../../../utility/config')
const database = require('../../../utility/database')

class UpdateCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Updates a users roles, access, and permissions',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const ModLevel = this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
       	const member = interaction.options.get('member');
		var guildMember;
		if (member && member.value !== interaction.member) {
			const hasPerm = await this.container.client.roblox.hasPermissions(interaction.member.id, '6650179:100-255')
			if (!hasPerm && (!ModLevel.isMod || ModLevel.level < 3)) {
				return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to update other members.', true);
			}
			guildMember = await interaction.guild.members.fetch(member.value);

			if (!guildMember) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'That target user could not be fetched.', true);
		} else {
			guildMember = interaction.member;
		}

		const Update = await this.container.client.botFunctions.updateMember(this.container.client, guildMember);
		
		if (!Update) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'An error occured.', true);
		if (Update.success === false) {
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', Update.msg, true);
		}
		const Embed = new MessageEmbed()
			.setColor(0x30ed56)
			.setDescription(`${guildMember} updated successfully.`)
			.setFooter(`Wrong account? Use the /relink command!`)
			.setTimestamp(Date.now());

		if (Update.Added.length > 0 && Update.Added !== 'None') {
			Embed.addField('Roles Added', Update.Added, true)
		}
		if (Update.Removed.length > 0 && Update.Removed !== 'None') {
			Embed.addField('Roles Removed', Update.Removed, true)
		}
		if (Update.Groups.added.length > 0) { 
			Embed.addField('Groups Added', '`' + Update.Groups.added.join('`\n`') + '`', true)
		}
		if (Update.Groups.removed.length > 0) { 
			Embed.addField('Groups Removed', '`' + Update.Groups.removed.join('`\n`') + '`', true)
		}

		const plr = await database.Schemas.Player.findOne({ discordId: interaction.member.id })

		if(plr && plr.premiumDays > 1){
			Embed.addField('Supporter', 'You have supporter! Press the button below if you wish to be ranked to SC-1. This is not mandatory, and you can stay as Class-D.')

			const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Apply SC-1')
                    .setStyle('PRIMARY')
                    .setCustomId(`supportersc1_${interaction.member.id}`),
				)

			return interaction.editReply({
				embeds: [Embed], components: [buttons], ephemeral: true
			}, );
		}

		return interaction.editReply({
			embeds: [Embed], ephemeral: true
		}, );
	}

	async contextMenuRun(interaction) {
		await interaction.deferReply({ ephemeral: true });
		var Target = await interaction.guild.members.fetch(interaction.targetId);

		const Update = await this.container.client.botFunctions.updateMember(this.container.client, Target);
		if (!Update) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'An error occured.', true);
		if (Update.success === false) {
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', Update.msg, true);
		}
		const Embed = new MessageEmbed()
			.setColor(0x30ed56)
			.setDescription(`${Target} updated successfully.`)
			.setTimestamp(Date.now());

		if (Update.Added.length > 0 && Update.Added !== 'None') {
			Embed.addField('Roles Added', Update.Added, true)
		}
		if (Update.Removed.length > 0 && Update.Removed !== 'None') {
			Embed.addField('Roles Removed', Update.Removed, true)
		}
		if (Update.Groups.added.length > 0) { 
			Embed.addField('Groups Added', '`' + Update.Groups.added.join('`\n`') + '`', true)
		}
		if (Update.Groups.removed.length > 0) { 
			Embed.addField('Groups Removed', '`' + Update.Groups.removed.join('`\n`') + '`', true)
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
					.setDescription(this.description)
					.addUserOption(option =>
						option.setName('member')
							.setDescription('Who would you like to update?')
							.setRequired(false)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);

		registry.registerContextMenuCommand(
		(builder) =>
			builder
				.setName(this.name)
				.setType(ApplicationCommandType.User),
		{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	};
}

exports.UpdateCommand = UpdateCommand;
