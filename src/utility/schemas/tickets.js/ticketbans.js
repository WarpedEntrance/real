module.exports = {
	name: 'TicketBans',
	schema: {
        userId: String,
		reason: String,
        moderator: Boolean,
        evidence: String,
        date: { type: Date, default: Date.now }
	},
};