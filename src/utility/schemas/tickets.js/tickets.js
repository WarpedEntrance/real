module.exports = {
	name: 'Tickets',
	schema: {
        ticketId: String,
		ownerId: String,
        open: Boolean,
        category: String,
        anon: Boolean,
        userChannelId: String,
        staffChannelId: String,
        logChannel: String,
        creation: { type: Date, default: Date.now },
        claimedData: {
            userId: String,
            date: Date,
        },
        closeData: {
            closedBy: String,
            closedAt: Date,
            closeReason: String,
        }
	},
};