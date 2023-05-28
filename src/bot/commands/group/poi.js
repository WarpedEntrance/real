const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { PaginatedFieldMessageEmbed } = require('@sapphire/discord.js-utilities');
const noblox = require('noblox.js');
const database = require('../../../utility/database')
const config = require('../../../utility/config')

class POICommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Manage people of interest',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: [],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });	
        const executordb = await database.Schemas.Player.findOne({ discordId: interaction.user.id })
        if(executordb){
            const rank = await noblox.getRankInGroup(6650179, executordb.userId);
            if(rank < 75) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Unauthorized, aborting!', true);
        }
        const subCommand = interaction.options.getSubcommand(true);

        if (subCommand == 'add') {
            const db_record = new database.Schemas.Infractions_peopleofinterest();
            db_record.userId = interaction.options.get('userid').value
            db_record.issuer = interaction.member.user.id
            db_record.reason = interaction.options.get('reason').value
            if(interaction.options.get('evidence')) db_record.evidence = interaction.options.get('evidence').value;
            db_record.save();
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'POI Added', `Successfully added user \`${interaction.options.get('userid').value}\` as a person of interest. Use the view command to edit this entry and apply restrictions.`, true);
        } else if (subCommand == 'view') {
            const db_entry = await database.Schemas.Infractions_peopleofinterest.findOne({userId: interaction.options.get('userid').value})

            if(!db_entry) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find this POI in the database!', true);

            const robloxinfoobj = await noblox.getPlayerInfo(interaction.options.get('userid').value)
            const robloxuserid = interaction.options.get('userid').value
            const robloxusername = robloxinfoobj.username
            const robloxdisplay = robloxinfoobj.displayName
            const robloxcreated = Math.floor(robloxinfoobj.joinDate.getTime()/1000)
            const robloxfriends = robloxinfoobj.friendCount
            const robloxfollowers = robloxinfoobj.followerCount
            const robloxavatar = await noblox.getPlayerThumbnail(robloxuserid, 100, 'png')


            const poiembed = new MessageEmbed()
            poiembed.setColor(0x2f3136)
            poiembed.setDescription('Terminal | Person of Interest')
            poiembed.addField(`Roblox Info`, `**UserId:** ${robloxuserid}\n**Username:** ${robloxusername}\n**DisplayName:** ${robloxdisplay}\n**Created:** <t:${robloxcreated}:D>\n**Friends:** [${robloxfriends}](https://roblox.com/users/${robloxuserid}/friends#!/friends)\n**Followers:** [${robloxfollowers}](https://roblox.com/users/${robloxuserid}/friends#!/followers)`, true);
            poiembed.addField(`POI Info`, `**Issuer:** <@${db_entry.issuer}>\n**Reason:** ${db_entry.reason}\n**Evidence:** ${db_entry.evidence}\n**Date Added:** <t:${Math.floor(db_entry.date.getTime()/1000)}:D>`, true)
            poiembed.setThumbnail(robloxavatar[0].imageUrl)

            const restrictions = [];

            if(db_entry.restrictions.ranklock.length > 0) restrictions.push(`**Ranklock:** ${db_entry.restrictions.ranklock}`);
            if(db_entry.restrictions.burned == true) restrictions.push(`**Burn Notice:** \\🔥ACTIVE\\🔥`)

            if(restrictions.length > 0){
                poiembed.addField(`Active Restrictions`, `${restrictions.join(',\n')}`, false)
            }

            const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Edit Entry')
                    .setStyle('PRIMARY')
                    .setCustomId(`editpoi_${robloxuserid}`),
                    new MessageButton()
                    .setLabel('Edit Restrictions')
                    .setStyle('SUCCESS')
                    .setCustomId(`poirestrictions_${robloxuserid}`),
                    new MessageButton()
                    .setLabel('Remove POI')
                    .setStyle('DANGER')
                    .setCustomId(`removepoi_${robloxuserid}`)
                );

            await interaction.editReply({ embeds: [poiembed], components: [buttons]})
        } else if(subCommand == 'list'){
            let template = new MessageEmbed()
			.setColor('0x2f3136')

            const db_entry = await database.Schemas.Infractions_peopleofinterest.find()

            const allPOIs = await db_entry.map(p => {
                return {gname: `**[${p.userId}](https://roblox.com/users/${p.userId}/profile/)**`, value: `**Reason:** ${p.reason}`}
            })

            new PaginatedFieldMessageEmbed()
            .setTitleField(`Paragon People of Interest List`)
            .setItems(allPOIs)
            .formatItems((item) => `\n${item.gname}\n${item.value}`)
            .setItemsPerPage(4)
            .setTemplate(template)
            .make()
            .run(interaction)
		    
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
                        .setDescription('Add a POI')
                        .addStringOption(option => {
                            return option
                                .setName('userid')
                                .setRequired(true)
                                .setDescription('ROBLOX UserId of user');
                        })
                        .addStringOption(option => {
                            return option
                                .setName('reason')
                                .setRequired(true)
                                .setDescription('Reason why this user is a POI');
                        })
                        .addStringOption(option => {
                            return option
                                .setName('evidence')
                                .setRequired(false)
                                .setDescription('Documented evidence (if applicable)');
                        });
                })
                .addSubcommand(command => {
                    return command
                        .setName('view')
                        .setDescription('View a POI\'s record')
                        .addStringOption(option => {
                            return option
                                .setName('userid')
                                .setRequired(true)
                                .setDescription('ROBLOX UserId of user');
                        });
                })
                .addSubcommand(command => {
                    return command
                        .setName('list')
                        .setDescription('List all POIs');
                }),
        { behaviorWhenNotIdentical: 'OVERWRITE' },
    );
}
}

exports.POICommand = POICommand;
