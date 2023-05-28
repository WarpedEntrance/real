const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const database = require('../../../utility/database')
const config = require('../../../utility/config')

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

        const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
        if (!ModLevel.isMod || ModLevel.level < 3) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to warn members.', true);
        }
        
        if (subCommand == 'create') {           
            const modal = new Modal()
			.setCustomId('sticky-modal')
			.setTitle('Create a sticky message');
            const titleInput = new TextInputComponent()
                .setCustomId('sticky-title')
                .setLabel("Title")
                .setStyle('SHORT');
            const contentInput = new TextInputComponent()
                .setCustomId('sticky-content')
                .setLabel("Sticky Content")
                .setStyle('PARAGRAPH');
            const firstActionRow = new MessageActionRow().addComponents(titleInput);
            const secondActionRow = new MessageActionRow().addComponents(contentInput);
            modal.addComponents(firstActionRow, secondActionRow);
            return await interaction.showModal(modal);
        } else if (subCommand == 'delete') {
            const stickyExists = await database.Schemas.Stickies.findOne({channelId: interaction.channel.id});
            if (!stickyExists) {
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'There is no sticky for this channel.', true);
            }

            await stickyExists.delete();

            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Sticky Deleted', `The sticky was deleted.`, true);
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
                        .setDescription('Create a sticky message');
                })
                .addSubcommand(command => {
                    return command
                        .setName('delete')
                        .setDescription('Delete the current sitcky message in the channel')
                }),
        { behaviorWhenNotIdentical: 'OVERWRITE' },
    );
}
}

exports.TagCommand = TagCommand;
