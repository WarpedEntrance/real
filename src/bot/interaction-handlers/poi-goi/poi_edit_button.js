const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const database = require('../../../utility/database')
const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');

module.exports = class extends InteractionHandler {
	constructor(ctx) {
		super(ctx, 
            { 
                interactionHandlerType: InteractionHandlerTypes.Button 
            }
        );
	}

	async run(interaction, {userid, db_entry}) {
        const modal = new Modal()
			.setCustomId(`modaleditpoi_${userid}`)
			.setTitle('Edit Person of Interest');
            const reasonInput = new TextInputComponent()
                .setCustomId('poi-reason')
                .setLabel("Reason")
                .setValue(db_entry.reason)
                .setStyle('SHORT');
            const evidenceInput = new TextInputComponent()
                .setCustomId('poi-evidence')
                .setLabel("Evidence")
                .setValue(db_entry.evidence)
                .setStyle('PARAGRAPH');
            const firstActionRow = new MessageActionRow().addComponents(reasonInput);
            const secondActionRow = new MessageActionRow().addComponents(evidenceInput);
            modal.addComponents(firstActionRow, secondActionRow);
		await interaction.showModal(modal);
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('editpoi')) return this.none();
            
        const userid = interaction.customId.split('_')[1]
        const db_entry = await database.Schemas.Infractions_peopleofinterest.findOne({userId: userid})

        
        return this.some({userid, db_entry})
        
        
	}
}; 
