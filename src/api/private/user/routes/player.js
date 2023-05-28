const botFunctions = require('../../../../utility/functions')
module.exports = {
	async get(req, res) {
        try {
            if (!req.query || !req.query.userId) {
                return res.status(400).json({
                    success: false,
                    data: 'UserId must be provided.',
                });
            } else {
                const Player = await botFunctions.GetPlayerFromDatabase({userId: req.query.userId});
                if (!Player) {
                    return res.status(400).json({
                        success: false,
                        data: 'User not found.',
                    });
                }
                
                return res.status(200).json({
                    success: true,
                    data: Player,
                });
            }
        } catch (err) {
            return res.status(400).json({
                success: false,
                data: `ERROR: ${err}`,
            });
        }
	},

};