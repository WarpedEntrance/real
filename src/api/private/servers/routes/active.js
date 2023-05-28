module.exports = {
	async get(req, res) {
		req.utility.roblox.getServers(req.query.stage ?? 'live')
			.then(servers => {
				res.status(200).json({
					success: true,
					data: servers,
				});
			})
			.catch((err) => {
				console.warn(err);
				res.status(500).json({
					success: false,
					message: 'An error occurred while retrieving the servers.',
				});
			});
	},
};