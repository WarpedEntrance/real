const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const database = require('../../utility/database')
const { MessageEmbed } = require('discord.js');

module.exports = class extends InteractionHandler {
	constructor(ctx) {
		super(ctx, 
            { 
                interactionHandlerType: InteractionHandlerTypes.ModalSubmit 
            }
        );
	}

	async run(interaction, result) {
		await interaction.editReply({
			content: `The tag has been created!`,
		});
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('tag')) return this.none();

        await interaction.deferReply();
		
		const tagTitle = interaction.fields.getTextInputValue('tag-title');
	    const tagContent = interaction.fields.getTextInputValue('tag-content');

        const tagObject = new database.Schemas.Tags();
        tagObject.guildId = interaction.guild.id;
        tagObject.name = tagTitle;
        tagObject.content = tagContent;

        await tagObject.save();

        return this.some(true);
        
	}
};