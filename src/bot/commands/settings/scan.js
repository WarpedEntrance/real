const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { ApplicationCommandType } = require('discord-api-types/v9');
const config = require('../../../utility/config')
const database = require('../../../utility/database')

class ScanCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Scans for custom shit idk',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply({ ephemeral: true });	
		if (interaction.member.id !== '788346335085592607' && interaction.member.id !== '153638972013281282') {
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Insufficient permissions', 'You have insufficient permissions to run this command.', true);
		}

		// SCAN FOR UNAUTHORIZED SERVERS & INVESTOR ROLE \\
		const Servers = await this.container.client.guilds.fetch()
		Servers.forEach(x => {
			this.container.client.utility.utility.IsServerAuthorized(this.container.client, x.id)
			this.container.client.utility.utility.CheckForRole(this.container.client, x.id, "Investor")
		})
		///////////////////////////////////

		


		return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Complete', `Successfully completed scan.`, true);

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

exports.ScanCommand = ScanCommand;
