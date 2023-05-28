const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const config = require('../../../utility/config')
const database = require('../../../utility/database')
const noblox = require('noblox.js')

class GamebanCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Bans a user from Paragon',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: [],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
        if (!ModLevel.isMod || ModLevel.level < 2) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to gameban members.', true);
        }

        const subCommand = interaction.options.getSubcommand(true);

        if(subCommand == 'add') {

        const member = interaction.options.get('userid').value
        const reason = interaction.options.get('reason').value
        const evidence = interaction.options.get('evidence').value
        let expiry = interaction.options.get('expiry')
        
        if(expiry) expiry = expiry.value
        if(!expiry) expiry = '1000000d'

        const playerinfo = await noblox.getPlayerInfo({userId: Number(member)})

        if(!playerinfo) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'This user is not valid!', true);

        const staffId = await this.container.client.roblox.getRobloxIdFromDiscord(interaction.member.id)
        const robloxavatar = await noblox.getPlayerThumbnail(member, 100, 'png')

       await this.container.client.utility.moderation.NewGameban({
            userid: member,
            reason: reason,
            evidence: evidence,
            expiry: expiry,
            moderatorid: staffId,
       })

       const LogEmbed = new MessageEmbed()
			.setColor(3553598)
            .setTitle(`Game Ban Issued`)
            .addField(`Issuer`, `${interaction.member} (${interaction.member.user.tag})`, true)
            .addField(`Issuee`, `[${playerinfo.username} (${member})](https://roblox.com/users/${member}/profile)`, true)
            .addField(`Reason`, reason, true)
            .addField(`Evidence`, evidence, true)
            .addField(`Expiry`, expiry !== 'perm' ? expiry : 'Permanent')
			.setTimestamp(Date.now())
            .setThumbnail(robloxavatar[0].imageUrl);

        this.container.client.botFunctions.log(this.container.client, "1", 'gamebanLogs', { embeds: [LogEmbed] });
        return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Player gamebanned', `Successfully gamebanned ${member}`, true);
    } else if(subCommand == 'remove'){
        const member = interaction.options.get('userid').value

        const ban = await database.Schemas.Infractions_Bans.findOne({ userId: member })
        if(ban && (ban.expiry - new Date() > 0)){
            await database.Schemas.Infractions_Bans.deleteOne({ userId: member })
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Ban Removed', `Successfully removed ${member}'s gameban`, true);
        } else {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', `${member} has no active ban!`, true);
        }
    }
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
                    .addSubcommand(command => {
                        return command
                            .setName('add')
                            .setDescription('Add a gameban')
                            .addStringOption(option =>
                                option.setName('userid')
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
                                option.setName('expiry')
                                    .setDescription('Infraction Expiry | LEAVE EMPTY FOR PERMANENT! | 1s/1m/1d/1y etc')
                                    .setRequired(false))
                    })
                    .addSubcommand(command => {
                        return command
                        .setName('remove')
                        .setDescription('Remove a gameban')
                        .addStringOption(option =>
                            option.setName('userid')
                                .setDescription('Who do you want to unban?')
                                .setRequired(true))
                    }),   
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.GamebanCommand = GamebanCommand;
