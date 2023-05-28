const axios = require('axios');
const roblox = require('../../../../utility/roblox');


async function exchangeCode(code) {
    const { data } = await axios.post(`https://discordapp.com/api/oauth2/token`, {
        grant_type: 'authorization_code',
        code,
        redirect_uri: `https://feedback.${process.env.DISCORD_REDIRECT_URI}`,
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
    });
    return data;
}

async function getDiscordInfo(accessToken) {
    const { data } = await axios.get(`https://discordapp.com/api/users/@me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return data;
}

module.exports = {
	async get(req, res) {
		
        if (!req.queryStringParameters || !req.queryStringParameters.code) {
            return res.status(400).json({
                success: false,
                message: 'No code provided.',
            });
        }

        const auth = await exchangeCode(req.queryStringParameters.code);

        if (!auth.access_token) {
            return res.status(400).json({
                success: false,
                message: 'No access token provided.',
            });
        }

        const discord = await getDiscordInfo(auth.access_token);

        if (!discord.id) {
            return res.status(400).json({
                success: false,
                message: 'No user ID provided.',
            });
        }

        const robloxId = await roblox.getRobloxIdFromDiscord(discord.id);

        if (!robloxId) {
            return res.status(400).json({
                success: false,
                message: 'No Roblox ID provided.',
            });
        }

        const username = await roblox.getUsernameFromRobloxId(robloxId);
        let thumbnail = `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxId}&width=100&height=100&format=png`
        
        const webToken = await generateNoltToken({
            imageURL : thumbnail,
            userId: robloxId,
            username: username,
        });

        if (webToken) {
            // Redirect to the Nolt dashboard
            return res.status(302).redirect(`https://nolt.${process.env.DOMAIN}/dashboard?token=${webToken}`);
        } else {
            return res.status(500).json({
                success: false,
                message: 'An error occurred while generating the token.',
            });
        }
	},
};