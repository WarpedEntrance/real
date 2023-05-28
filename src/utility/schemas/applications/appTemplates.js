module.exports = {
	name: 'appTemplates',
	schema: {
		department: String,
        title: String,
        description: String,
        submitRequirements: String,
        claimRequirements: {
            group: [{
                rank: String,
                label: String,
                mustHave: Boolean
            }],
            requireAll: Boolean
        }, // claim
        questions: [
            {
                query: String,
                questionType: String,
                choices: [
                    {
                        text: String,
                        correct: Boolean,
                    }
                ],
                answer: { type: String, default: "none" }
            }
        ],
        discord: {
            log: {
                guildId: String,
                channelId: String,
            },
            submit: {
                guildId: String,
                channelId: String,
            }
        },
        acceptReasons: [ String ],
        declineReasons: [ String ],
        automatic: Boolean,
        openStatus: Boolean,
        passRank: {
            group: Number,
            rank: Number
        },
        passDiscordInvite: String,
	},
};