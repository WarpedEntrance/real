
const axios = require('axios');
const __class = require('../../../../bot/interaction-handlers/rank');

module.exports = {
	async post(req, res) {
        const body = req.body;
        if (!body.channelId) {
            return res.status(400).json({
                success: false,
                data: 'ChannelID required',
            });
        }
        
        const client = req.client;
        const channel = client.guilds.cache.get(req.body.guildId).channels.cache.get(req.body.channelId)
        if (!channel) {
            return res.status(400).json({
                success: false,
                data: 'Channel not found',
            });
        }
        await channel.send(req.body.data);

        return res.status(200).json({
            success: true,
            data: 'Message sent',
        });
	},
};
