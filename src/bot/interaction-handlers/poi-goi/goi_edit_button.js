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

	async run(interaction, {groupid, db_entry}) {
        const modal = new Modal()
			.setCustomId(`modaleditgoi_${groupid}`)
			.setTitle('Edit Group of Interest');
            const reasonInput = new TextInputComponent()
                .setCustomId('goi-reason')
                .setLabel("Reason")
                .setValue(db_entry.reason)
                .setStyle('SHORT');
            const evidenceInput = new TextInputComponent()
                .setCustomId('goi-evidence')
                .setLabel("Evidence")
                .setValue(db_entry.evidence)
                .setStyle('PARAGRAPH');
            const firstActionRow = new MessageActionRow().addComponents(reasonInput);
            const secondActionRow = new MessageActionRow().addComponents(evidenceInput);
            modal.addComponents(firstActionRow, secondActionRow);
		await interaction.showModal(modal);
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('editgoi')) return this.none();
            
        const groupid = interaction.customId.split('_')[1]
        const db_entry = await database.Schemas.Infractions_peopleofinterest.findOne({groupId: groupid})

        
        return this.some({groupid, db_entry})
        
        
	}
}; 
