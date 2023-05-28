const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { ApplicationCommandType } = require('discord-api-types/v9');
const config = require('../../../utility/config')
const database = require('../../../utility/database')

class UpdateCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Bind a role to group rank',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply({ ephemeral: true });	
		if (!interaction.member.permissions.has('MANAGE_GUILD')) {
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Insufficient permissions', 'You have insufficient permissions to run this command.', true);
		}

        const role = interaction.options.getRole('role');
		
		const existingRole = await database.Schemas.Binds.findOne({ role: role.id });
		if (existingRole) {
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Role already bound', `The <@&${role.id}> role is already bound.\nYou must use \`/unbind\` before binding it again.`, true);
		}

		const groups = interaction.options.getString('groups');
		const splitGroups = groups.split(' ');

		const BindGroups = [];
		const BindCerts = [];

		for (const groupString of splitGroups) {
			const [permType, groupId, ranksString] = groupString.split(':');

			if (permType.toLowerCase() == 'group') {
				if (groupId.match(/[^\d]/)) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Invalid argument', `You have attempted to bind an invalid group: \`${groupId}\``, true);

				const bind = {
					group: Number(groupId),
				};

				if (ranksString != null) {
					const ranks = [];
					const unparsedRanks = ranksString.split(',');
					for (const rank of unparsedRanks) {
						const rangeMatch = rank.match(/(\d+)-(\d+)/);
						const rankNumber = parseInt(rank, 10);

						if (rangeMatch) {
							const start = parseInt(rangeMatch[1], 10);
							const stop = parseInt(rangeMatch[2], 10);

							if (start && stop) {
								for (let i = start; i <= stop; i++) {
									ranks.push(i);
								}
							}
						}
						else if (rankNumber != null) {
							ranks.push(rankNumber);
						}
					}
					bind.ranks = ranks;
				}
				else if (!groupId.match(/[a-z]/i)) {
					bind.ranks = [];
					for (let i = 1; i <= 255; i++) {
						bind.ranks.push(i);
					}
				}
				else {
					bind.ranks = [];
				}
				BindGroups.push(bind);
			}
			else if (permType.toLowerCase() == 'cert') {
				if (!groupId.match(/^([A-Z0-9]{8})$/)) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Invalid argument', `You have attempted to bind an invalid certification: \`${groupId}\``, true);

				BindCerts.push(groupId);
			}
		}

		const newBind = new database.Schemas.Binds();
		newBind.guild = interaction.guild.id;
		newBind.role = role.id;
		newBind.groups = BindGroups;
		newBind.certs = BindCerts;

		await newBind.save();

		return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Success', `Successfully bound <@&${role.id}> to \`${groups}\`.`, true);

	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
                    .addRoleOption(option => option.setName('role').setDescription('The role you would like to bind').setRequired(true))
                    .addStringOption(option => option.setName('groups').setDescription('Options: Group:GROUPID:MIN-MAX Group:GROUPID:RANK Group:GROUPID:RANK,RANK Cert:CERTID').setRequired(true)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.UpdateCommand = UpdateCommand;
