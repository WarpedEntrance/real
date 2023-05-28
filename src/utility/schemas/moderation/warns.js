module.exports = {
	name: 'Warns',
	schema: {
		userId: String,
		reason: String,
		evidence: String,
		date: { type: Date, default: Date.now },
		expiry: Date,
		moderatorId: String, // User who issued the mute
		revoked: {
			moderatorId: String, // User that revoked the mute
			date: Date, // Date mute was revoked
			reason: String, // Reason for unmute
		},
	},
};