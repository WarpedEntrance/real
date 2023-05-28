const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { Time } = require('@sapphire/time-utilities');
const { getGroupRoles, getGroupRanks, getGroupRank, parseRankString, meetsRequirements } = require('../../../utility/robloxPermissions');
const database = require('../../../utility/database')
const config = require('../../../utility/config')

// const { ApplicationCommandType } = require('discord-api-types/v9');

class RankCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Sets the rank of a specified member',
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

		const messageOptions = {
            embeds: [{
                color: 0x308AED,
            }],
        };
		
		messageOptions.components = [
			{
				type: 1,
				components: [
					{
						type: 3,
						custom_id: `rank_${targetId}_${guildConfig.group.id}_${interaction.user.id}_${username}`,
						options: [],
					},
				],
			},
			{
				type: 1,
				components: [
					{
						type: 2,
						style: 4,
						label: 'Cancel',
						custom_id: `cancel_${interaction.user.id}`,
						emoji: {
							name: '🚫',
						},
					},
				],
			},
		];

		for (let i = roles.length - 1; i >= 0; i--) {
			const role = roles[i];
			if (role.rank < staffRank) {
				const option = {
					label: role.name,
					description: `Click to rank the user to ${role.name}`,
					value: `${role.rank}_${role.name}`,
					default: false,
				};

				if (role.rank == targetRank) {
					option.description = undefined;
					option.default = true;
				}

				messageOptions.components[0].components[0].options.push(option);
			}
		}

		messageOptions.embeds[0].fields = [
			{
				inline: false,
				name: '🧑‍💼 Target User',
				value: `${username} (${targetId})`,
			},
			{
				inline: false,
				name: '📋 Message',
				value: 'Select a rank below or cancel',
			},
		];

		return interaction.editReply(messageOptions);
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption(option =>
						option.setName('username')
							.setDescription('Who would you like to rank?')
							.setRequired(true))
					.addStringOption(option =>
						option.setName('reason')
							.setDescription('Why is this user being ranked?')
							.setRequired(true)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}


exports.RankCommand = RankCommand;
