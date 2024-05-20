const { ThreadChannel } = require('discord.js');
const database = require('../../../../utility/database')
const botFunctions = require('../../../../utility/functions');
const noblox = require('noblox.js')
const player = require('./player');
module.exports = {
	async post(req, res) {
        const body = req.body;
        try {
            const Player = await botFunctions.GetPlayerFromDatabase({userId: body.UserId});
            if (!Player) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.',
                });
            }

            if (Player.userId != body.UserId) {
                return res.status(404).json({
                    success: false,
                    message: 'UserId Mismatch.',
                });
            }
            const premDays = Player.premiumDays > 0 ? Player.premiumDays : 0;
            const newTotal = premDays + body.amount;

            const update = await database.Schemas.Player.updateOne({userId: body.UserId}, {premiumDays: newTotal});

            const client = req.client;
            const channel = client.guilds.cache.get('720339214641791006').channels.cache.get('970332616735744050')
            if (channel) {
                //channel.send(`${Player.discordId ? `<@${Player.discordId}>` : Player.username} Just bought ${body.amount} days of supporter!`)
                channel.send(`${Player.discordId ? `<@${Player.discordId}>` : Player.username} has just donated to the foundation for ${body.amount} days! Thank you from command and -1` )
            }

            // Find the member in this discord server and give them the premium role
            const member = await client.guilds.cache.get('720339214641791006').members.fetch(Player.discordId);
            if (member) {
                const role = await client.guilds.cache.get('720339214641791006').roles.fetch('974054078457970699');
                if (role) {
                    if (!member.roles.cache.has(role.id)) {
                        member.roles.add(role).catch(err => {
                            console.log(err);
                        });
                    }
                }
            }

            /*const rank = await noblox.getRankInGroup(6650179, body.UserId);
            if (rank < 25) {
                noblox.setRank(6650179, body.UserId, 25)
            }*/

            return res.status(200).json({
                success: true,
                message: `Added ${body.amount} days`,
            });
        } catch (err) {
			return res.status(500).json({
				success: false,
				message: `${err}`,
			});
		}
	},

	async delete(req, res) {
		
	},
};
