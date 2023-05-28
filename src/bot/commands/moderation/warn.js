const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const ms = require('ms');
const config = require('../../../utility/config')

class WarnCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Warns a user',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });
		const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
        if (!ModLevel.isMod) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to warn members.', true);
        }


        const member = interaction.options.get('member')
        const reason = interaction.options.get('reason').value
        let length = interaction.options.get('length')
        const evidence = interaction.options.get('evidence').value

        if (!member) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Please provide a target user.', true);
        }

        if (!reason) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Please provide a reason.', true);
        }
        if (!evidence) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Please provide evidence.', true);
        }

        if (length){
            length = length.value
        }

        const memberToWarn = await interaction.guild.members.fetch(member.value)

        if (!memberToWarn) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find the user.', true);
        }

       this.container.client.utility.moderation.NewWarning({
            userid: memberToWarn.id,
            reason: reason,
            evidence: evidence,
            moderatorid: interaction.member.id,
            length: length,
       })

        const LogEmbed = new MessageEmbed()
			.setColor(3553598)
            .setTitle(`Warning Issued`)
            .addField(`Issuer`, `${interaction.member} (${interaction.member.user.tag})`, true)
            .addField(`Issuee`, `<@${memberToWarn.user.id}> (${memberToWarn.user.tag})`, true)
            .addField(`Reason`, reason, true)
            .addField(`Evidence`, evidence, true)
			.setTimestamp(Date.now())
			.setFooter({text: '\u200B', icon: member.user.displayAvatarURL()});

        const dmEmbed = new MessageEmbed()
            .setColor(12890712)
            .setDescription(`**You have received a warning in [${interaction.guild.name}](https://discordapp.com/channels/${interaction.guild.id}):**\n\nReason: \`${reason}\`\n${length !== null ? `\n*This warning will fall off <t:${Math.floor( Date.now()/1000 ) + (ms(length)/1000)}:R> (<t:${Math.floor( Date.now()/1000 ) + (ms(length)/1000)}>)*` : ``}`)
            .setFooter({text: `Issued by ${interaction.member.displayName} (${interaction.member.user.id})`, iconURL: interaction.member.user.displayAvatarURL()});


        let CouldDM = true
        memberToWarn.user.send({embeds: [dmEmbed]}).catch(() => {CouldDM = false});

        if(!CouldDM) LogEmbed.addField(`Additional`, `User was not able to be messaged!`, true);

        this.container.client.botFunctions.log(this.container.client, "1", 'warnLogs', { embeds: [LogEmbed] });
        return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Member Warned', `Successfully warned ${memberToWarn.user.tag}`, true);
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
                    .addUserOption(option =>
						option.setName('member')
							.setDescription('Who would you like to warned?')
							.setRequired(true))
					.addStringOption(option =>
						option.setName('reason')
							.setDescription('Why is this user being warned?')
							.setRequired(true))
                    .addStringOption(option =>
                        option.setName('evidence')
                            .setDescription('Evidence of the offence taking place')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('length')
                            .setDescription('How long should the user be warned for? (Ex: 10m, 30m, 1d)')
                            .setRequired(false)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.WarnCommand = WarnCommand;
