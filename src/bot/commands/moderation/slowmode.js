const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const config = require('../../../utility/config')

class SlowmodeCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Set a channel\'s slowmode.',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_CHANNELS'],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });
		const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
        if (!ModLevel.isMod || ModLevel.level < 2) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to warn members.', true);
        }


        const duration = interaction.options.get('time').value

        if (!duration) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Please provide a duration.', true);
        };
        if(duration > 21600) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Duration cannot exceed 6 hours (21600 seconds).', true);
        }

        const LogEmbed = new MessageEmbed()
			.setColor(3553598)
            .setTitle(`Slowmode set`)
            .addField(`Issuer`, `${interaction.member} (${interaction.member.user.tag})`, true)
            .addField(`Channel`, `<#${interaction.channel.id}>`, true)
            .addField(`Slowmode Duration`, `${duration} seconds`, true)
			.setTimestamp(Date.now())
			.setFooter({text: '\u200B', icon: interaction.member.user.displayAvatarURL()});


        interaction.channel.setRateLimitPerUser(duration, `TERMINAL -> Slowmode by ${interaction.member.user.tag} (${interaction.member.id})`)

        this.container.client.botFunctions.log(this.container.client, "0", 'command', { embeds: [LogEmbed] });
        return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Slowmode set', `Successfully set the slowmode!`, true);
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption(option =>
						option.setName('time')
							.setDescription('Set slowmode duration (seconds)')
							.setRequired(true)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.SlowmodeCommand = SlowmodeCommand;
