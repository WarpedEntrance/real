const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const config = require('../../../utility/config')

class KickCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Kicks a user',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['KICK_MEMBERS'],
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

        const memberToKick = await interaction.guild.members.fetch(member.value)
        if (!memberToKick) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find the user.', true);
        }

       this.container.client.utility.moderation.NewKick({
            userid: memberToKick.id,
            reason: reason,
            evidence: evidence,
            moderatorid: interaction.member.id,
       })

       const LogEmbed = new MessageEmbed()
			.setColor(3553598)
            .setTitle(`Kick Issued`)
            .addField(`Issuer`, `${interaction.member} (${interaction.member.user.tag})`, true)
            .addField(`Issuee`, `<@${memberToKick.user.id}> (${memberToKick.user.tag})`, true)
            .addField(`Reason`, reason, true)
            .addField(`Evidence`, evidence, true)
			.setTimestamp(Date.now())
			.setFooter({text: '\u200B', icon: member.user.displayAvatarURL()});
        

        

        const dmEmbed = new MessageEmbed()
            .setColor(12890712)
            .setDescription(`**You have been kicked from [${interaction.guild.name}](https://discordapp.com/channels/${interaction.guild.id}):**\n\nReason: \`${reason}\`\n`)
            .setFooter({text: `Issued by ${interaction.member.displayName} (${interaction.member.user.id})`, iconURL: interaction.member.user.displayAvatarURL()});


        let CouldDM = true
        await memberToKick.user.send({embeds: [dmEmbed]}).catch(() => {CouldDM = false});

        let CouldKick = true
        await memberToKick.kick(`TERMINAL -> Kick issued by ${interaction.member.user.tag} (${interaction.member.id})`).catch(() => {CouldKick = false});

       if(!CouldDM && CouldKick) LogEmbed.addField(`Additional`, `User was not able to be messaged!`, true);
       if(!CouldKick && CouldDM) LogEmbed.addField(`Additional`, `User was not able to be kicked!`, true);
       if(!CouldKick && !CouldDM) LogEmbed.addField(`Additional`, `User was not able to be kicked or messaged!`, true);

        this.container.client.botFunctions.log(this.container.client, "1", 'kickLogs', { embeds: [LogEmbed] });
        return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Member Kicked', `Successfully kicked ${memberToKick.user.tag}`, true);
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
                    .addUserOption(option =>
						option.setName('member')
							.setDescription('Who would you like to kick?')
							.setRequired(true))
					.addStringOption(option =>
						option.setName('reason')
							.setDescription('Why is this user being kicked?')
							.setRequired(true))
                    .addStringOption(option =>
                        option.setName('evidence')
                            .setDescription('Evidence of the offence taking place')
                            .setRequired(true)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.KickCommand = KickCommand;
