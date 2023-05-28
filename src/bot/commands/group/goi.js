const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { PaginatedFieldMessageEmbed } = require('@sapphire/discord.js-utilities');
const noblox = require('noblox.js');
const database = require('../../../utility/database')
const config = require('../../../utility/config')

class GOICommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Manage groups of interest',
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
            const db_record = new database.Schemas.Infractions_groupsofinterest();
            db_record.groupId = interaction.options.get('groupid').value
            db_record.issuer = interaction.member.user.id
            db_record.reason = interaction.options.get('reason').value
            if(interaction.options.get('evidence')) db_record.evidence = interaction.options.get('evidence').value;
            db_record.save();

            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'GOI Added', `Successfully added group \`${interaction.options.get('groupid').value}\` as a group of interest. Use the view command to edit this entry and apply restrictions.`, true);
        } else if (subCommand == 'view') {
            const db_entry = await database.Schemas.Infractions_groupsofinterest.findOne({groupId: interaction.options.get('groupid').value})

            if(!db_entry) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find this GOI in the database!', true);

            const robloxinfoobj = await noblox.getGroup(interaction.options.get('groupid').value)
            const groupId = interaction.options.get('groupid').value
            const groupowner = robloxinfoobj.owner.username
            const groupownerid = robloxinfoobj.owner.userId
            const groupname = robloxinfoobj.name
            //const membercount = await noblox.getPlayers(groupId, 0).length
            const groupicon = await noblox.getLogo(groupId, 100, false, "Png")


            const goiembed = new MessageEmbed()
            goiembed.setColor(0x2f3136)
            goiembed.setDescription('Terminal | Group of Interest')
            goiembed.addField(`Roblox Info`, `**Group:** [${groupname}](https://roblox.com/groups/${groupId}/a)\n**GroupId:** ${groupId}\n**Group Owner:** [${groupowner}](https://roblox.com/users/${groupownerid}/profile)`, true) //\n**Member Count:** ${membercount}`, true);
            goiembed.addField(`GOI Info`, `**Issuer:** <@${db_entry.issuer}>\n**Reason:** ${db_entry.reason}\n**Evidence:** ${db_entry.evidence}\n**Date Added:** <t:${Math.floor(db_entry.date.getTime()/1000)}:D>`, true)
            goiembed.setThumbnail(groupicon[0].imageUrl)

            const restrictions = [];

            if(db_entry.restrictions.ranklock.length > 0) restrictions.push(`**Ranklock:** ${db_entry.restrictions.ranklock}`);
            if(db_entry.restrictions.banned == true) restrictions.push(`**Ban:** \\❗ACTIVE\\❗`)

            if(restrictions.length > 0){
                goiembed.addField(`Active Restrictions`, `${restrictions.join(',\n')}`, false)
            }

            const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Edit Entry')
                    .setStyle('PRIMARY')
                    .setCustomId(`editgoi_${groupId}`),
                    new MessageButton()
                    .setLabel('Edit Restrictions')
                    .setStyle('SUCCESS')
                    .setCustomId(`goirestrictions_${groupId}`),
                    new MessageButton()
                    .setLabel('Remove GOI')
                    .setStyle('DANGER')
                    .setCustomId(`removegoi_${groupId}`)
                );

            await interaction.editReply({ embeds: [goiembed], components: [buttons]})
        } else if(subCommand == 'list'){
            let template = new MessageEmbed()
			.setColor('0x2f3136')

            const db_entry = await database.Schemas.Infractions_groupsofinterest.find()

            const allGOIs = await db_entry.map(p => {
                return {gname: `**[${p.groupId}](https://roblox.com/groups/${p.groupId}/)**`, value: `**Reason:** ${p.reason}`}
            })

            new PaginatedFieldMessageEmbed()
            .setTitleField(`Paragon People of Interest List`)
            .setItems(allGOIs)
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
                        .setDescription('Add a GOI')
                        .addStringOption(option => {
                            return option
                                .setName('groupid')
                                .setRequired(true)
                                .setDescription('ROBLOX groupId of group');
                        })
                        .addStringOption(option => {
                            return option
                                .setName('reason')
                                .setRequired(true)
                                .setDescription('Reason why this user is a GOI');
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
                        .setDescription('View a GOI\'s record')
                        .addStringOption(option => {
                            return option
                                .setName('groupid')
                                .setRequired(true)
                                .setDescription('ROBLOX groupId of user');
                        });
                })
                .addSubcommand(command => {
                    return command
                        .setName('list')
                        .setDescription('List all GOIs');
                }),
        { behaviorWhenNotIdentical: 'OVERWRITE' },
    );
}
}

exports.GOICommand = GOICommand;
