module.exports = {
	name: 'Infractions_peopleofinterest',
	schema: {
		userId: String,
        issuer: String,
		reason: String,
		evidence: String,
		date: { type: Date, default: Date.now },
		restrictions: {
			ranklock: { type: String, default: ''},
            burned: {type: Boolean, default: false},
            
		},
	},
};