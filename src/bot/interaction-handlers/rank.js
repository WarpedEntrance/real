const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const database = require('../../utility/database')
const { MessageEmbed } = require('discord.js');
const noblox = require('noblox.js')

module.exports = class extends InteractionHandler {
	constructor(ctx) {
		super(ctx, 
            { 
                interactionHandlerType: InteractionHandlerTypes.SelectMenu 
            }
        );
	}

	async run(interaction, result) {
		return
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('rank')) return this.none();

        await interaction.deferUpdate();
		
        const args = interaction.customId.split('_');

        const RankInfo = interaction.values[0].split('_')[0]


        await noblox.setRank(Number(args[2]), Number(args[1]), Number(RankInfo[0])).then(() => {
            interaction.editReply({
                content: `Successfully set ${args[1]}'s rank to ${RankInfo[1]}!`,
            });
            return this.some(true);
        }).catch(err => {
            console.log(err);
            interaction.editReply({
                content: `Error setting ${args[1]}'s rank to ${RankInfo[1]}!`,
            });
        });
        return this.some()
	}
};