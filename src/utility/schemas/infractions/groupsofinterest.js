module.exports = {
	name: 'Infractions_groupsofinterest',
	schema: {
		groupId: String,
        issuer: String,
		reason: String,
		evidence: String,
		date: { type: Date, default: Date.now },
		restrictions: {
			ranklock: { type: String, default: ''},
            banned: {type: Boolean, default: false},
            
		},
	},
};