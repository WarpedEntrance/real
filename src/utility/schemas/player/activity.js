module.exports = {
	name: 'Activity',
	schema: {
		userId: String, // main anchor
		date: { type: Date, default: Date.now },
		type: String,
		team: String,
		startTime: Date,
		endTime: Date,
	},
};