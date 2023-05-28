module.exports = {
	name: 'Infractions_Bans',
	schema: {
		userId: String,
		reason: String,
		evidence: String,
		date: { type: Date, default: Date.now },
		expiry: Date,
		bannedBy: String, // User who issued the mute
		revoked: {
			revokedby: String, // User that revoked the mute
			date: Date, // Date mute was revoked
			reason: String, // Reason for unmute
		},
	},
};