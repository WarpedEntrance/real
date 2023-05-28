const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const config = require('../../../utility/config')

class BanCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Bans a user',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['BAN_MEMBERS'],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });
		const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
        if (!ModLevel.isMod || ModLevel.level < 2) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to warn members.', true);
        }


        const member = interaction.options.get('member')
        const reason = interaction.options.get('reason').value
        const evidence = interaction.options.get('evidence').value
        const anonymous = interaction.options.get('anonymous')
        let length = interaction.options.get('length')
        

        

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

        let inguild = true

        const memberToKick = await interaction.guild.members.fetch(member.value)
        if (!memberToKick) inguild = false;

       this.container.client.utility.moderation.NewBan({
            userid: Number(member.value),
            reason: reason,
            evidence: evidence,
            moderatorid: interaction.member.id,
            length: length,
       })

       const LogEmbed = new MessageEmbed()
			.setColor(3553598)
            .setTitle(`Ban Issued`)
            .addField(`Issuer`, `${interaction.member} (${interaction.member.user.tag})`, true)
            .addField(`Issuee`, `<@${member.value}> (${member.value})`, true)
            .addField(`Reason`, reason, true)
            .addField(`Evidence`, evidence, true)
			.setTimestamp(Date.now());
        

        let CouldDM;
        if(inguild == true){
            const dmEmbed = new MessageEmbed()
                .setColor(12890712)
                .setDescription(`**You have been banned from [${interaction.guild.name}](https://discordapp.com/channels/${interaction.guild.id}):**\n\nReason: \`${reason}\`\n${length !== null ? `\n *This ban will exire <t:${Math.floor( Date.now()/1000 ) + (ms(length)/1000)}:R> (<t:${Math.floor( Date.now()/1000 ) + (ms(length)/1000)}>)*` : ``}`);
                
            if(!anonymous){    
                dmEmbed.setFooter({text: `Issued by ${interaction.member.displayName} (${interaction.member.user.id})`, iconURL: interaction.member.user.displayAvatarURL()});
            }


            let CouldDM = true
            await memberToKick.user.send({embeds: [dmEmbed]}).catch(() => {CouldDM = false});
    
       } else {
           CouldDM = false
       }
       let CouldKick = true
       await interaction.guild.members.ban(member.value, { reason: `TERMINAL -> Ban issued by ${interaction.member.user.tag} (${interaction.member.id})`, days: 1}).catch(() => {CouldKick = false});
    
        this.container.client.botFunctions.log(this.container.client, "1", 'banLogs', { embeds: [LogEmbed] });
        return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Member Banned', `Successfully banned <@${member.value}>`, true);
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
                    .addUserOption(option =>
						option.setName('member')
							.setDescription('Who would you like to ban?')
							.setRequired(true))
					.addStringOption(option =>
						option.setName('reason')
							.setDescription('Why is this user being banned?')
							.setRequired(true))
                    .addStringOption(option =>
                        option.setName('evidence')
                            .setDescription('Evidence of the offence taking place')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('anonymous')
                            .setDescription('Should the moderator be anonymous to the user? Do not enter a value in this field if not anonymous.')
                            .setRequired(false))
                    .addStringOption(option =>
                        option.setName('length')
                            .setDescription('How long should the user be banned for? (Ex: 10m, 30m, 1d)')
                            .setRequired(false)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.BanCommand = BanCommand;
