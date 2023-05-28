module.exports = {
	async get(req, res) {
        try {
            if (!req.queryStringParameters || !req.queryStringParameters.id) {
                const Applications = await req.utility.database.Schemas.appTemplates.find({});

                if (Applications) {
                    return res.status(200).json({
                        success: true,
                        data: Applications,
                    });
                }
            } else {
                const Applications = await req.utility.database.Schemas.appTemplates.findById(ObjectId(req.queryStringParameters.id)).exec();

                if (Applications) {
                    return res.status(200).json({
                        success: true,
                        data: Applications,
                    });
                }
            }
        } catch (err) {
			return res.status(500).json({
				success: false,
				message: 'An error occurred while retrieving application data.',
			});
		}
        return res.status(500).json({
            success: false,
            message: 'An error occurred while retrieving application data.',
        });
	},

	async post(req, res) {
		
	},

	async delete(req, res) {
		
	},
};