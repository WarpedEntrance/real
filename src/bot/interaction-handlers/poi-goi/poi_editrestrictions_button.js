const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const database = require('../../../utility/database')
const { MessageActionRow, Modal, TextInputComponent, MessageButton } = require('discord.js');


module.exports = class extends InteractionHandler {
	constructor(ctx) {
		super(ctx, 
            { 
                interactionHandlerType: InteractionHandlerTypes.Button 
            }
        );
	}

	async run(interaction, {type, robloxuserid, db_entry}) {
        if(type == 'buttons'){
        const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Remove Ranklock')
                    .setStyle('PRIMARY')
                    .setCustomId(`restrict_remove_${robloxuserid}`),
                    new MessageButton()
                    .setLabel('Class-D')
                    .setStyle('PRIMARY')
                    .setCustomId(`restrict_classd_${robloxuserid}`),
                    new MessageButton()
                    .setLabel('SC-1')
                    .setStyle('PRIMARY')
                    .setCustomId(`restrict_sc1_${robloxuserid}`),
                    new MessageButton()
                    .setLabel('SC-2')
                    .setStyle('PRIMARY')
                    .setCustomId(`restrict_sc2_${robloxuserid}`),
                    new MessageButton()
                    .setLabel('SC-3')
                    .setStyle('PRIMARY')
                    .setCustomId(`restrict_sc3_${robloxuserid}`),
                );
        const buttons2 = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Burn')
                        .setStyle('DANGER')
                        .setCustomId(`restrict_burn_${robloxuserid}`),
                        new MessageButton()
                        .setLabel('Remove Burn')
                        .setStyle('DANGER')
                        .setCustomId(`restrict_unburn_${robloxuserid}`),
                    );
        
        interaction.update({components: [buttons, buttons2], ephemeral: true})

        } else if(type == 'update'){
            interaction.reply({content: 'Updated POI.', ephemeral: true})
        }
	}

	async parse(interaction) {
		if (interaction.customId.startsWith('poirestrictions')){
            const robloxuserid = interaction.customId.split('_')[1]
            const db_entry = await database.Schemas.Infractions_peopleofinterest.findOne({userId: robloxuserid})
            const type = 'buttons'

            
            return this.some({type, robloxuserid, db_entry})
            
        } else if (interaction.customId.startsWith('restrict')){
            const robloxuserid = interaction.customId.split('_')[2]
            const restriction = interaction.customId.split('_')[1]
            const db_entry = await database.Schemas.Infractions_peopleofinterest.findOne({userId: robloxuserid})
            const type = 'update'

            if(restriction == 'remove') db_entry.restrictions.ranklock = '';
            if(restriction == 'classd') db_entry.restrictions.ranklock = 'CD';
            if(restriction == 'sc1') db_entry.restrictions.ranklock = 'SC-1';
            if(restriction == 'sc2') db_entry.restrictions.ranklock = 'SC-2';
            if(restriction == 'sc3') db_entry.restrictions.ranklock = 'SC-3';
            if(restriction == 'burn') db_entry.restrictions.burned = true;
            if(restriction == 'unburn') db_entry.restrictions.burned = false;

            db_entry.save();
            
            return this.some({type, robloxuserid, db_entry})
        } else {
            return this.none();
        }
	}
}; 
