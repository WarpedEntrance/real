const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const config = require('../../../utility/config')
const database = require('../../../utility/database')

class TagCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Manage or calls for a tag',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
        //await interaction.deferReply({ ephemeral: true });	
        // Get subcommand
        const subCommand = interaction.options.getSubcommand(true);

        if (subCommand == 'create') {
            const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
            if (!ModLevel.isMod || ModLevel.level < 2) {
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to edit tags.', true);
            }

            const modal = new Modal()
			.setCustomId('tag-modal')
			.setTitle('Create a tag');
            const titleInput = new TextInputComponent()
                .setCustomId('tag-title')
                .setLabel("Name")
                .setStyle('SHORT');
            const contentInput = new TextInputComponent()
                .setCustomId('tag-content')
                .setLabel("Tag Content")
                .setStyle('PARAGRAPH');
            const firstActionRow = new MessageActionRow().addComponents(titleInput);
            const secondActionRow = new MessageActionRow().addComponents(contentInput);
            modal.addComponents(firstActionRow, secondActionRow);
            return await interaction.showModal(modal);
        } else if (subCommand == 'delete') {
            const name = interaction.options.get('name');


            const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
            if (!ModLevel.isMod || ModLevel.level < 2) {
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to create tags.', true);
            }
            if (!name) {
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Argument Error', 'You need to provide a name for the tag.', true);
            }

            const tagExists = await database.Schemas.Tags.findOne({$or: [
				{	
					name: message.content.substring(1),
					guildId: message.guild.id
				},
				{
					aliases: message.content.substring(1),
					guildId: message.guild.id
				}
			]});            
            if (!tagExists) {
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Not Found', 'A tag with that name does not exist.', true);
            }

            tagExists.delete();

            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Tag Deleted', `The tag ${name.value} was deleted.`, true);
        } else if (subCommand == 'list') {
            const tags = await database.Schemas.Tags.find({ guildId: interaction.guild.id });
            let tagList = '';
            for (const tag of tags) {
                tagList += `\`${tag.name}\`\n`;
            }

            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Tag List', tagList, true);
        } else if (subCommand == 'call') {
            const name = interaction.options.get('name');

            if (!name) {
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Argument Error', 'You need to provide a name for the tag.', true);
            }

            const tagExists = await database.Schemas.Tags.findOne({$or: [
				{	
					name: message.content.substring(1),
					guildId: message.guild.id
				},
				{
					aliases: message.content.substring(1),
					guildId: message.guild.id
				}
			]});
            if (!tagExists) {
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Not Found', 'A tag with that name does not exist.', true);
            }

            this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Tag Called', `${tagExists.name}`, true);
            return interaction.channel.send(tagExists.content);
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
                        .setName('create')
                        .setDescription('Create a tag');

                })
                .addSubcommand(command => {
                    return command
                        .setName('delete')
                        .setDescription('Delete a tag')
                        .addStringOption(option => {
                            return option
                                .setName('name')
                                .setRequired(true)
                                .setDescription('The name of the tag');
                        });
                })
                .addSubcommand(command => {
                    return command
                        .setName('list')
                        .setDescription('List all tags');
                })
                .addSubcommand(command => {
                    return command
                        .setName('call')
                        .setDescription('Call a tag')
                        .addStringOption(option => {
                            return option
                                .setName('name')
                                .setRequired(true)
                                .setDescription('The name of the tag');
                        });
                }),
        { behaviorWhenNotIdentical: 'OVERWRITE' },
    );
}
}

exports.TagCommand = TagCommand;
