module.exports = {
	name: 'GuildConfiguration',
	schema: {
		guildId: String,
		type: String, // department (use abbreivation, e.g. sd) or foundation
		guildName: String,
		group: { // optional if foundation
			id: Number,
			minRankToRank: String,
		}
	},
};