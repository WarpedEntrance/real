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
		if (!interaction.customId.startsWith('modaleditpoi')) return this.none();
		
		const poiReason = interaction.fields.getTextInputValue('poi-reason');
	    const poiEvidence = interaction.fields.getTextInputValue('poi-evidence');

        const userid = interaction.customId.split('_')[1]
        const db_entry = await database.Schemas.Infractions_peopleofinterest.findOne({userId: userid})        

        if (db_entry) {
            // Update database entry with new values
            db_entry.reason = poiReason;
            db_entry.evidence = poiEvidence;

            await db_entry.save();
            return this.some(true);
        }
	}
};