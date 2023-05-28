const database = require('../../../../utility/database')
const botFunctions = require('../../../../utility/functions');
const noblox = require('noblox.js')

module.exports = {
	async post(req, res) {
		/* 
        API will send through userId, serverType, team, start time and end time
        */
        try{
            const body = req.body;
            const Player = await botFunctions.GetPlayerFromDatabase({userId: body.userId});
                if (!Player) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found.',
                    });
                }

                if (Player.userId != body.userId) {
                    return res.status(404).json({
                        success: false,
                        message: 'UserId Mismatch.',
                    });
                }


            const document = new database.Schemas.Activity()
            document.userId = body.userId;
            document.type = body.serverType;
            document.team = body.team;
            document.startTime = body.start;
            document.endTime = body.end;
            document.save()


		    /* Return response data */
		    return res.status(200).json({
		    	success: true,
		    	message: 'Successfully saved activity',
		    });

        } catch (err) {
            return res.status(500).json({
                success: true,
                message: 'Error whilst saving activity',
            });
        }
	},
};