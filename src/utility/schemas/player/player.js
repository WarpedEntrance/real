module.exports = {
	name: 'Player',
	schema: {
		userId: Number, // main anchor
		discordId: String,
		premiumDays: { type: Number, default: 0 },
		email: { type: String, default: "" },
		alts: [
			{
				robloxId: Number, 
				source: String, 
				date: {
					type: Date, 
					default: Date.now
				}
			}
		],
		date: { type: Date, default: Date.now },
	},
};