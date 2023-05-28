module.exports = {
	name: 'Tags',
	schema: {
		created: { type: Date, default: Date.now },
        guildId: String,
        name: String,
        content: String,
        aliases: [String],
        creator: String,
	},
};