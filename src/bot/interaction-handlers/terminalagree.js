const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const database = require('../../utility/database')
const { MessageActionRow, Modal, TextInputComponent, MessageButton } = require('discord.js');


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

        /*const mainguild = await this.container.client.guilds.fetch('720339214641791006')
        const membermain = await mainguild.members.fetch(interaction.member.user.id)
        const member = interaction.member
        const memberterminalroles = member.roles

        if(!member) return;
        */

        //if(membermain.roles.cache.has('955624811512594472'))  await memberterminalroles.add('974217266113683486');
        //if(membermain.roles.cache.has('984617237333815306'))  await memberterminalroles.add('974217266113683486');
        //if(membermain.roles.cache.has('955667607938277456'))  await memberterminalroles.add('974217266113683486');
        //if(membermain.roles.cache.has('958902257020199002'))  await memberterminalroles.add('974217266113683486');

        //if(membermain.roles.cache.has('955624608348905472'))  await memberterminalroles.add('974217347848077373');
        //if(membermain.roles.cache.has('955624660068859994'))  await memberterminalroles.add('974217295498985473').catch(console.warn);

        //if(membermain.roles.cache.has('720671862509535353'))  await memberterminalroles.add('974044668515979314');

        await this.container.client.botFunctions.updateMember(this.container.client, interaction.member);

        await interaction.editReply({
			content: `Updated roles!`,
            ephemeral: true
		});
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('terminalagree')) return this.none();
        return this.some(true)
    }
};
