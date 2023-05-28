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

	async run(interaction, {type, groupid, db_entry}) {
        if(type == 'buttons'){
        const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Remove Ranklock')
                    .setStyle('PRIMARY')
                    .setCustomId(`grestrict_remove_${groupid}`),
                    new MessageButton()
                    .setLabel('Class-D')
                    .setStyle('PRIMARY')
                    .setCustomId(`grestrict_classd_${groupid}`),
                    new MessageButton()
                    .setLabel('SC-1')
                    .setStyle('PRIMARY')
                    .setCustomId(`grestrict_sc1_${groupid}`),
                    new MessageButton()
                    .setLabel('SC-2')
                    .setStyle('PRIMARY')
                    .setCustomId(`grestrict_sc2_${groupid}`),
                    new MessageButton()
                    .setLabel('SC-3')
                    .setStyle('PRIMARY')
                    .setCustomId(`grestrict_sc3_${groupid}`),
                );
        const buttons2 = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setLabel('Ban')
                        .setStyle('DANGER')
                        .setCustomId(`grestrict_ban_${groupid}`),
                        new MessageButton()
                        .setLabel('Remove Ban')
                        .setStyle('DANGER')
                        .setCustomId(`grestrict_unban_${groupid}`),
                    );
        
        interaction.update({components: [buttons, buttons2], ephemeral: true})

        } else if(type == 'update'){
            interaction.reply({content: 'Updated GOI.', ephemeral: true})
        }
	}

	async parse(interaction) {
		if (interaction.customId.startsWith('goirestrictions')){
            const groupid = interaction.customId.split('_')[1]
            const db_entry = await database.Schemas.Infractions_peopleofinterest.findOne({groupId: groupid})
            const type = 'buttons'

            
            return this.some({type, groupid, db_entry})
            
        } else if (interaction.customId.startsWith('grestrict')){
            const groupid = interaction.customId.split('_')[2]
            const grestriction = interaction.customId.split('_')[1]
            const db_entry = await database.Schemas.Infractions_groupsofinterest.findOne({groupId: groupid})
            const type = 'update'

            if(grestriction == 'remove') db_entry.restrictions.ranklock = '';
            if(grestriction == 'classd') db_entry.restrictions.ranklock = 'CD';
            if(grestriction == 'sc1') db_entry.restrictions.ranklock = 'SC-1';
            if(grestriction == 'sc2') db_entry.restrictions.ranklock = 'SC-2';
            if(grestriction == 'sc3') db_entry.restrictions.ranklock = 'SC-3';
            if(grestriction == 'ban') db_entry.restrictions.banned = true;
            if(grestriction == 'unban') db_entry.restrictions.banned = false;

            db_entry.save();
            
            return this.some({type, groupid, db_entry})
        } else {
            return this.none();
        }
	}
}; 
