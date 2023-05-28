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

	async run(interaction, res) {
        interaction.reply({content: 'User has been removed from POI list.', ephemeral: true})
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('removepoi')) return this.none();
            
        const userid = interaction.customId.split('_')[1]

        await database.Schemas.Infractions_peopleofinterest.deleteOne({userId: userid})

        
        return this.some(true)
        
        
	}
}; 
