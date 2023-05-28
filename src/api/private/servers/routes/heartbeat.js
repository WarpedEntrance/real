const cache = require('../../../../utility/cache')

const placeIds = {
	"live": 9896535629,
	"staging": 9896549458
};
module.exports = {
	async post(req, res) {
		if (!req.body.stage || !placeIds[req.body.stage]) {
			return res.status(400).json({
				success: false,
				error: 'Invalid stage',
			});
		}

		if (!req.body.jobId) {
			return res.status(400).json({
				success: false,
				error: 'Invalid jobId',
			});
		}

		if (!req.body.privateId) {
			return res.status(400).json({
				success: false,
				error: 'Invalid privateId',
			});
		}

		if (!req.body.playerCount) {
			return res.status(400).json({
				success: false,
				error: 'Invalid playerCount',
			});
		}

		if (!req.body.maxPlayers) {
			return res.status(400).json({
				success: false,
				error: 'Invalid maxPlayers',
			});
		}

		if (!req.body.players) {
			return res.status(400).json({
				success: false,
				error: 'Invalid players',
			});
		}


		const placeId = placeIds[req.body.stage];
		const key = `gameinstance:${placeId}:${req.body.jobId}`;

		try {
			await cache.set(key, JSON.stringify(req.body), { EX: 35 }).catch(console.warn);
		} catch(err) {
			console.log(`REDIS ERR: ${err}`)
		}
		return res.status(200).json({
			success: true,
			data: {},
		});
	},
};