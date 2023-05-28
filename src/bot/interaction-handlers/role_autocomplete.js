const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');

module.exports = class extends InteractionHandler {
	constructor(ctx) {
		super(ctx, 
            { 
                interactionHandlerType: InteractionHandlerTypes.Autocomplete 
            }
        );
	}

	async run(interaction, result) {
		return interaction.respond(result)
	}

	async parse(interaction) {
        if(interaction.commandName !== 'role') return this.none();

		const focusedValue = interaction.options.getFocused();

		const choices = ['Event Ping', 'Recruitment Ping'];

		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		const response = await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
		this.some(true)
	}
};