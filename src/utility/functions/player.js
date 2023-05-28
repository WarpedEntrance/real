// For functions involving the player/member database
const database = require('../database');

module.exports = {
    async CreatePlayer(data) {
        // Create a new player
        // data = {discordId, robloxId, email}
        const Player = new database.Schemas.Player();
        Player.discordId = data.discordId ? data.discordId : null;
        Player.robloxId = data.robloxId ? data.robloxId : null;
        Player.email = data.email ? data.email : null;
        dbDocument.premiumDays = 0;
        dbDocument.date = new Date();
        await Player.save();
        return Player;
    },

    async GetPlayerFromDiscordId(discordId) {
        // Get a player from a discord id
        const PlayerObject = await database.Schemas.Player.findOne({discordId: discordId});
        if (!PlayerObject) {
            return null;
        }
        return PlayerObject;
    },

    async GetPlayerFromRobloxId(robloxId) {
        // Get a player from a roblox id
        const PlayerObject = await database.Schemas.Player.findOne({robloxId: robloxId});
        if (!PlayerObject) {
            return null;
        }
        return PlayerObject;
    },

    async GetPlayerFromEmail(email) {
        // Get a player from an email
        const PlayerObject = await database.Schemas.Player.findOne({email: email});
        if (!PlayerObject) {
            return null;
        }
        return PlayerObject;
    },

    async UpdateRoles(client, member) {
        // Updates the members roles based on the guilds binds and the players permissions
        const Player = await this.GetPlayerFromDiscordId(member.id);
        if (!Player) {
            return {success: false, data: { message: 'Player not found' }};
        }

        const GuildConfig = await client.utility.guild.GetGuildConfig(member.guild.id);
        if (!GuildConfig) {
            return {success: false, data: { message: 'Guild not configured' }};
        }

        const memberGroups = await client.utility.roblox.GetPlayerGroups(Player.userId);

        const meetsBindRequirements = (bind) => {
			for (let i = 0; i < bind.groups.length; i++) {
				const groupBind = bind.groups[i];
				const rank = client.utility.roblox.getRankInGroup(memberGroups, groupBind.group);

				if (groupBind.ranks.includes(rank)) {
					return true;
				}

				if (groupBind.ranks.includes(0) && rank == 0) {
					return true;
				}

				if (i == (bind.groups.length - 1)) {
					return false;
				}
			}
		};

        const rolesAdded = [];
        const rolesRemoved = [];

        for (let i = 0; i < GuildConfig.binds.length; i++) {
            const bind = GuildConfig.binds[i];
			const role = await member.guild.roles.fetch(bind.role);

            if (role && role.id) {
                const hasRole = member.roles.cache.has(role.id);
				const hasPermissions = meetsBindRequirements(bind);

                if (!hasRole && hasPermissions) {
					rolesAdded.push(role.id);
					await targetMember.roles.add(role.id, `Group ranks (\`Bind ${bind._id}\`)`).catch(console.warn);
				} else if (hasRole && !hasPermissions) {
					rolesRemoved.push(role.id);
					await targetMember.roles.remove(role.id, `Group ranks (\`Bind ${bind._id}\`)`).catch(console.warn);
				}
            }
        }

        const addedRoles = added.map(id => `<@&${id}>`);
		const removedRoles = removed.map(id => `<@&${id}>`);
        return {success: true, data: { rolesAdded: addedRoles, rolesRemoved: removedRoles }};
    },

    async UpdateGoogleGroups(client, member) {
        // Updates the members google groups based on their group permissions
    },

    async UpdatePremiumStatus(client, member) {

    }
}