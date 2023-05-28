const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');

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

		try {
			const channel = await this.container.client.channels.fetch('1001622855462694962')
			const clientname = channel.name

			const isstreaming = clientname.includes('https://twitch.tv')

			if(isstreaming){
				await this.container.client.user.setPresence({activities: [{ type: 'STREAMING', url: clientname, name: 'WE\'RE LIVE!'  }]})
			} else {
				await this.container.client.user.setPresence({activities: [{ name: clientname, type: 'PLAYING' }]})
			}
			
		} catch (err) {
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'AAAAAAA HELP', `Error..\n\n\`\`\`${err}\`\`\``, true);
		}


		return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Complete', `Successfully updated bot status. YAY!`, true);

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
