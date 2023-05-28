const { isEmpty } = require("lodash");
const database = require('../../../../utility/database')

module.exports = {
	async get(req, res) {
        try {
            if (!req.query || !req.query.targetRobloxId) {
                return res.status(400).json({
                    success: false,
                    data: 'targetRobloxId must be provided.',
                });
            } else {

                var targetRobloxId = Number(req.query.targetRobloxId)
                if (!targetRobloxId) {
                    return res.status(400).json({
                        success: false,
                        data: 'targetRobloxId must be a number.',
                    });
                }

                const ban = await req.utility.database.Schemas.Infractions_Bans.findOne({ userId: req.query.targetRobloxId });

                if (ban && (ban.expiry - new Date() > 0)) {
                    return res.status(200).json({
                        success: true,
                        isBanned: true,
                        activeBan: ban,
                    });
                }

                return res.status(200).json({
                    success: true,
                    isBanned: false,
                });
                
            }
        } catch (err) {
            return res.status(400).json({
                success: false,
                data: `ERROR: ${err}`,
            });
        }
	},

    async post(req, res) {
        try {

            const body = req.body

            const userid = body.userId
            const reason = body.reason
            const moderator = body.moderator
            const evidence = "N/A"
            const expiry = Date.new(Date.getDate()+30)

            const newBan = new database.Schemas.Infractions_Bans()
            newBan.userId = userid
            newBan.reason = reason
            newBan.bannedBy = moderator
            newBan.evidence = "N/A"
            newBan.expiry = Date(expiry)
            newBan.save()


		    return res.status(200).json({
		    	success: true,
		    	message: 'Successfully saved Ban',
		    });

        } catch(error) {
            return res.status(500).json({
                success: true,
                message: 'Error saving ban',
            });
        }
    }
};