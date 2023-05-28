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

	async run(interaction, content) {
		console.log(content)
		await interaction.editReply({
			content: content,
		});
	}

	async parse(interaction) {
		if (!interaction.customId.startsWith('eval')) return this.none();

        await interaction.deferReply({ephemeral: false});

		const evalContent = interaction.fields.getTextInputValue('eval-code');

		const clean = async (text) => {
			// If our input is a promise, await it before continuing
			if (text && text.constructor.name == "Promise")
			  text = await text;
			
			// If the response isn't a string, `util.inspect()`
			// is used to 'stringify' the code in a safe way that
			// won't error out on objects with circular references
			// (like Collections, for example)
			if (typeof text !== "string")
			  text = require("util").inspect(text, { depth: 1 });
			
			// Replace symbols with character code alternatives
			text = text
			  .replace(/`/g, "`" + String.fromCharCode(8203))
			  .replace(/@/g, "@" + String.fromCharCode(8203));
			
			// Send off the cleaned up result
			return text;
			}


		const evaluation = await eval(evalContent)

		const response2send = await clean(evaluation)

        return this.some(response2send);
        
	}
};