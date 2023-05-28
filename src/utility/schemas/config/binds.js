module.exports = {
	name: 'Binds',
	schema: {
		created: { type: Date, default: Date.now },
        guild: String,
        role: String,
        groups: [
            {
                group: Number,
                ranks: [Number],
            },
        ],
	},
};