const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const database = require('../../utility/database')
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
		await interaction.editReply({
			content: `The sticky has been created!`,
		});
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('sticky')) return this.none();

        await interaction.deferReply();
		
		const stickyTitle = interaction.fields.getTextInputValue('sticky-title');
	    const stickyContent = interaction.fields.getTextInputValue('sticky-content');

        const stickyExists = await database.Schemas.Stickies.findOne({channelId: interaction.channel.id});            
        if (stickyExists) {
            // Update database entry with new values
            stickyExists.title = stickyTitle;
            stickyExists.content = stickyContent;

            const channel = await interaction.guild.channels.resolve(interaction.channel.id)
            const StickyMessage = await channel.messages.fetch(stickyExists.messageId).catch(err => console.log(err));
            if (StickyMessage) {
                StickyMessage.delete();
            }
            await stickyExists.save();

            const StickyEmbed = new MessageEmbed()
                .setColor(3553598)
                .setTitle(`⚠️ | ${stickyTitle}`)
                .setDescription(stickyContent);

            const sticky = await interaction.channel.send({embeds: [StickyEmbed]});

            stickyExists.messageId = sticky.id;
            await stickyExists.save();
            return this.some(true);
        } else {
            const StickyEmbed = new MessageEmbed()
                .setColor(3553598)
                .setTitle(`⚠️ | ${stickyTitle}`)
                .setDescription(stickyContent);

            const sticky = await interaction.channel.send({embeds: [StickyEmbed]});

            const stickyObject = new database.Schemas.Stickies();
            stickyObject.channelId = interaction.channel.id;
            stickyObject.messageId = sticky.id;
            stickyObject.title = stickyTitle;
            stickyObject.content = stickyContent;
            await stickyObject.save();

            return this.some(true);
        }
	}
};