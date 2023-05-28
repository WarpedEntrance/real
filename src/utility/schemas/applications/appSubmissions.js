module.exports = {
	name: 'appSubmissions',
	schema: {
        applicationId: String,
		templateId: { type: 'ObjectId', ref: 'appTemplate' },
        submittingUser: String,
        reviewingUser: String,
        status: String, // Unread/Flagged/Accepted/Denied
        submittedData: {
            messageId: String,
            channelId: String,
            guildId: String,
        },
        log: {
            channelId: String,
            guildId: String,
        },
        responseMessage: String,
        submitDate: Date,
        reviewDate: Date,
        questions: [{query: String, response: String}]
	},
};