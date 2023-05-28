module.exports = {
	name: 'Stickies',
	schema: {
		created: { type: Date, default: Date.now },
        channelId: String,
        messageId: String,
        content: String,
        title: String,
        creator: String,
	},
};