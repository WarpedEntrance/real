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
			description: 'Manage ticketbans',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: [],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });	
        const ticketObject = await database.Schemas.Tickets.findOne({staffChannelId: interaction.channel.id})
        if(!ticketObject) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Unauthorized or command not rank in a ticket, aborting!', true);
            
        
        const subCommand = interaction.options.getSubcommand(true);

        if (subCommand == 'add') {
            const db_record = new database.Schemas.TicketBans();
            db_record.userId = interaction.options.get('userid').value
            db_record.issuer = interaction.member.user.id
            db_record.reason = interaction.options.get('reason').value
            if(interaction.options.get('evidence')) db_record.evidence = interaction.options.get('evidence').value;
            db_record.save();
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Ticketban Added', `Successfully added user \`${interaction.options.get('userid').value}\` to ticketbans.`, true);
        } else  if (subCommand == 'remove') {
            const db_entry = await database.Schemas.TicketBans.findOne({userId: interaction.options.get('userid').value})

            if(!db_entry) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find this user in the database!', true);

			await database.Schemas.TicketBans.deleteOne({ userId: interaction.options.get('userid').value })

            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Ticketban Removed', `Successfully removed user \`${interaction.options.get('userid').value}\` from ticketbans.`, true); 
		} else if (subCommand == 'view') {
            const db_entry = await database.Schemas.TicketBans.findOne({userId: interaction.options.get('userid').value})

            if(!db_entry) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find this user in the database!', true);


            const embed = new MessageEmbed()
            embed.setColor(0x2f3136)
            embed.setDescription(`Terminal | Ticketbanned user\n\n**User:** <@${db_entry.userId}>\n**Reason:** ${db_entry.reason}\n**Evidence:** ${db_entry.evidence || "None"}`)
            

            await interaction.editReply({ embeds: [embed] })
        } else if(subCommand == 'list'){
            let template = new MessageEmbed()
			.setColor('0x2f3136')

            const db_entry = await database.Schemas.TicketBans.find()

            const allPOIs = await db_entry.map(p => {
                return {gname: `**<@${p.userId}>**`, value: `**Reason:** ${p.reason}`}
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
                        .setDescription('Add a Ticket Ban')
                        .addStringOption(option => {
                            return option
                                .setName('userid')
                                .setRequired(true)
                                .setDescription('Discord UserId of user');
                        })
                        .addStringOption(option => {
                            return option
                                .setName('reason')
                                .setRequired(true)
                                .setDescription('Reason why this user is being ticket banned');
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
                        .setName('remove')
                        .setDescription('Remove a ticket ban')
                        .addStringOption(option => {
                            return option
                                .setName('userid')
                                .setRequired(true)
                                .setDescription('Discord UserId of user');
                        });
                })
                .addSubcommand(command => {
                    return command
                        .setName('view')
                        .setDescription('View a ticket ban')
                        .addStringOption(option => {
                            return option
                                .setName('userid')
                                .setRequired(true)
                                .setDescription('Discord UserId of user');
                        });
                })
                .addSubcommand(command => {
                    return command
                        .setName('list')
                        .setDescription('List all ticketbanned users');
                }),
        { behaviorWhenNotIdentical: 'OVERWRITE' },
    );
}
}

exports.POICommand = POICommand;
