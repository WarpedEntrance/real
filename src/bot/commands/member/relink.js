const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const database = require('../../../utility/database')
const config = require('../../../utility/config')

class UpdateCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: ['relink'],
			description: 'Checks if your linked ROBLOX account is correct according to Bloxlink.',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
		
		await interaction.deferReply({ ephemeral: true });	
		const memb = await database.Schemas.Player.findOne({ discordId: interaction.member.user.id });
		const bloxlinkid = await this.container.client.roblox.getRobloxIdFromBloxlink(interaction.member.user.id);

		if(memb.userId == bloxlinkid){
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Your account is properly linked, according to Bloxlink! If this is the wrong account, please reverify at https://blox.link/', true);
		} else {
			await database.Schemas.Player.updateOne({discordId: interaction.member.user.id}, {userId: bloxlinkid});
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Success', `Successfully relinked your account!`, true);
		}
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
