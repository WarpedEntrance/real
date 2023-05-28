const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const noblox = require('noblox.js');
const { Time } = require('@sapphire/time-utilities');
const { getGroupRoles, getGroupRanks, getGroupRank, parseRankString, meetsRequirements } = require('../../../utility/robloxPermissions');
const database = require('../../../utility/database')
const config = require('../../../utility/config')

class DischargeCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Discharge a member from a department',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const guildConfig = await database.Schemas.GuildConfiguration.findOne({ guildId: interaction.guild.id});
		if (!guildConfig) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'This server is not configured.', true);

		const username = interaction.options.get('username').value;
		const reason = interaction.options.get('reason').value;

		const roles = await getGroupRoles(guildConfig.group.id)
		if (!roles) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Error getting group roles.', true);

		const targetId = await this.container.client.roblox.getUserIdFromUsername(username);

		if (!targetId) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Target user does not exist.', true);
		const targetRank = await getGroupRank(guildConfig.group.id, targetId);

		const staffId = await this.container.client.roblox.getRobloxIdFromDiscord(interaction.member.id)
		const staffGroups = await getGroupRanks(staffId)
		const staffRank = await getGroupRank(staffGroups, guildConfig.group.id)
		if (!staffRank) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not linked with Terminal.', true);

		const minimumranktorank = guildConfig.group.minRankToRank

		const parsedPermission = parseRankString(minimumranktorank)

		const staffCanRank = parsedPermission && meetsRequirements(staffGroups, parsedPermission)

		if (!staffCanRank) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You do not have permission to rank users.', true);

		if (staffRank <= targetRank) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You cannot rank users with a rank higher than or equal to your own.', true);
		if (targetRank == 0) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'That user is not in the group.', true);

		const errors = []

		try {
			await noblox.exile(guildConfig.group.id, Number(targetId))
		} catch (error) {
			errors.push('Error exiling user - they may not be in the group')
		}

		try {
			const dbuser = await database.Schemas.Player.findOne({ userId: targetId })
			if(dbuser){
				await this.container.client.botFunctions.updateMember(this.container.client, dbuser.discordId);
			}
		} catch (error) {
			errors.push('Error updating user - they may not be in the server.')
		}

		const Embed = new MessageEmbed()
			.setTimestamp()
			.setTitle('USER DISCHARGE')
			.setColor(0x00FF00);

		if(errors.length > 0){
			Embed.addField(`Errors`, errors.join(',\n'))
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
					.addStringOption(option =>
						option.setName('username')
							.setDescription('Who would you like to discharge?')
							.setRequired(true))
					.addStringOption(option =>
						option.setName('reason')
							.setDescription('Why is this user being discharged?')
							.setRequired(true)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}


exports.DischargeCommand = DischargeCommand;
