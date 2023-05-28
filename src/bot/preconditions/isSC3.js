const { Precondition } = require('@sapphire/framework');

class IsSC3Precondition extends Precondition {
	chatInputRun(interaction) {
		return this.container.client.Roblox.hasPermissions(interaction.member.id, 'SC:3')
			? this.ok()
			: this.error({ message: 'This command is reserved to Security Class 3 and above.' });
	}
}

module.exports = {
	IsSC3Precondition,
};