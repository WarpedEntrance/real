module.exports = {
	async get(req, res) {
		const responseData = {
			blacklists: null,
		};

		try {
			/* Fetch active ban (if any) */
			const bans = await req.utility.database.Schemas.AccessoryBlacklist.find();

			responseData.blacklists = bans

		} catch(error){
			console.log(error)
		}

		/* Return response data */
		return res.status(200).json({
			success: true,
			data: responseData.blacklists,
		});
	},
};