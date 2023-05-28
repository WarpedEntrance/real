const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const database = require('../../../utility/database')
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
		await interaction.reply({ content: `The entry has been edited!`, ephemeral: true});
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('modaleditgoi')) return this.none();
		
		const goiReason = interaction.fields.getTextInputValue('goi-reason');
	    const goiEvidence = interaction.fields.getTextInputValue('goi-evidence');

        const groupid = interaction.customId.split('_')[1]
        const db_entry = await database.Schemas.Infractions_groupsofinterest.findOne({groupId: groupid})        

        if (db_entry) {
            // Update database entry with new values
            db_entry.reason = goiReason;
            db_entry.evidence = goiEvidence;

            await db_entry.save();
            return this.some(true);
        }
	}
};