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
        interaction.reply({content: 'User has been removed from GOI list.', ephemeral: true})
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('removegoi')) return this.none();
            
        const groupid = interaction.customId.split('_')[1]

        await database.Schemas.Infractions_groupsofinterest.deleteOne({groupId: groupId})

        
        return this.some(true)
        
        
	}
}; 
