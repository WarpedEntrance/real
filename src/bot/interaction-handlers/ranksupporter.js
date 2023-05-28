const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const database = require('../../utility/database')
const noblox = require('noblox.js')

module.exports = class extends InteractionHandler {
	constructor(ctx) {
		super(ctx, 
            { 
                interactionHandlerType: InteractionHandlerTypes.Button 
            }
        );
	}

	async run(interaction, result) {
        interaction.deferReply({ephemeral: true});

        const args = interaction.customId.split('_')

        const plr = await database.Schemas.Player.findOne({ discordId: args[1] })

        if(!plr) return;

        const rank = await noblox.getRankInGroup(6650179, plr.userId);
        if (rank < 25) {
            await noblox.setRank(6650179, plr.userId, "Security Class 1")
        }

        await this.container.client.botFunctions.updateMember(this.container.client, interaction.member);

        await interaction.editReply({
			content: `Ranked, enjoy!`,
            ephemeral: true
		});
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('supportersc1')) return this.none();
        return this.some(true)
    }
};
