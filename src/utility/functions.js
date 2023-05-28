const { MessageEmbed } = require('discord.js')
const database = require('../utility/database')
const LoggingConfig = require('../utility/static/logChannels.json');
const googleUtil = require('../utility/googlegrouputility');
const { add } = require('lodash');
const classifiedChannels = [958123185948205086]
const noblox = require('noblox.js')

module.exports = {
	async log(client, guildId, Type, Log) {
		if (LoggingConfig[guildId]) {
			const LogConfig = LoggingConfig[guildId];
			if (LogConfig[Type]) {
				const ChannelId = LogConfig[Type];
				const Channel = await client.channels.fetch(ChannelId);
				if (Channel && !classifiedChannels.includes(Channel.id)) {
					return Channel.send(Log).catch(console.error);
				}
			}
		}
		else {
			console.log(`Could not log action given params: ${guildId}, ${Type}, ${Log}`);
		}
	},

	async GetPlayerFromDatabase(Query) {
		const Player = await database.Schemas.Player.findOne(Query);
		if (!Player) {
			return null;
		}
		return Player;
	},

	async IsModerator(client, member) {
		const guild = client.guilds.cache.get(720339214641791006);
		if (guild) {
			const role = guild.roles.cache.get(955624811512594472);
			if (role) {
				return member.roles.cache.has(role.id);
			}
		}
	},

    InteractionRespond(client, interaction, color, title, msg, ephemeral) {
		const Embed = new MessageEmbed()
			.setColor(color)
			.setDescription(`**${title}** | ${msg}`)
			.setTimestamp(Date.now())
			.setFooter({text: '\u200B', iconURL: interaction.user.displayAvatarURL()});
		return interaction.editReply({
			embeds: [Embed], ephemeral: ephemeral
		})
	},

	async updateMember(client, targetMember) {
		var robloxId;
		const Player = await database.Schemas.Player.findOne({discordId: targetMember.id});
		if (!Player) {
			robloxId = await client.roblox.getRobloxIdFromDiscord(targetMember.id);
		} else {
			robloxId = Player.userId
		}
		if (!robloxId) { return {success: false, msg: 'User is not linked with bloxlink'}; }
		const rank = await noblox.getRankInGroup(6650179, robloxId);
		/*if (Player && Player.premiumDays > 0) {
            if (rank < 25) {
				console.log(`${robloxId} needs ranking.. Attempting to rank.`)
                await noblox.setRank(6650179, robloxId, "Security Class 1")
        	}
		}*/

		const pendinginvite = await database.Schemas.PendingInvites.findOne({ userId: targetMember.id })
		if(pendinginvite && pendinginvite.guildId === targetMember.guild.id){
			try {
				const mainguild = client.guilds.cache.get('720339214641791006')
				const pendinginvitechannel = await mainguild.channels.fetch(pendinginvite.channelId)

				if(pendinginvitechannel){
					pendinginvitechannel.delete().catch(console.warn)
					await database.Schemas.PendingInvites.deleteOne({ userId: targetMember.id, guildId: targetMember.guild.id})
				}
		} catch (error) {
			console.log(error)
		}
		}
		try {
			if(await client.roblox.hasPermissions(targetMember.id, "SD:2-24 ScD:2-24 MTF:2-24 AA:2-24 EC:2-24 E&TS:2-24 DEA:2-24") && rank < 25){
				await noblox.setRank(6650179, robloxId, "Security Class 1")
			} else if(await client.roblox.hasPermissions(targetMember.id, "SD:25-99 ScD:25-99 MTF:25-99 AA:25-99 EC:25-99 E&TS:25-99 DEA:25-99") && rank < 50){
				await noblox.setRank(6650179, robloxId, "Security Class 2")
			}
			const username = await client.roblox.getUsernameFromRobloxId(robloxId);

			await targetMember.setNickname(username).catch(console.warn);

			const groups = await client.roblox.getGroups(robloxId);
			const binds = await database.Schemas.Binds.find({ guild: targetMember.guild.id });
			const GroupsUpdated = await googleUtil.updateUserGroups(targetMember.id);

			if (!groups || !binds || binds.length < 1) { return {Added: 'None', Removed: 'None', Username: username, Groups: GroupsUpdated}; }

			const added = [];
			const removed = [];

			const SupRole = client.guilds.cache.get('720339214641791006').roles.cache.get('974054078457970699');

			if (Player && targetMember.guild.id === '720339214641791006') {
				if (Player.premiumDays > 0 && !targetMember.roles.cache.has(SupRole.id)) {
					targetMember.roles.add(SupRole).catch(err => {
						console.log(err);
					});
					added.push(SupRole.id)
				}
			}

			const ServerInvestorRole = await targetMember.guild.roles.cache.find(role => role.name === "Investor")
			const MainServerMember = client.guilds.cache.get("720339214641791006").members.cache.get(targetMember.id);
			if (MainServerMember && MainServerMember.roles.cache.has('987505724500373524') && !targetMember.roles.cache.has(ServerInvestorRole.id)) {
				targetMember.roles.add(ServerInvestorRole)
				added.push(ServerInvestorRole.id)
			}
			const meetsBindRequirements = (bind) => {
				for (let i = 0; i < bind.groups.length; i++) {
					const groupBind = bind.groups[i];
					const rank = client.roblox.getRankInGroup(groups, groupBind.group);

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
		
			for (let i = 0; i < binds.length; i++) {
				const role = await targetMember.guild.roles.fetch(binds[i].role);
			
				if (role && role.id) {
					const hasRole = targetMember.roles.cache.has(role.id);
					const hasPermissions = meetsBindRequirements(binds[i]);
				
					if (!hasRole && hasPermissions) {
						added.push(role.id);
						await targetMember.roles.add(role.id, `Group ranks (\`Bind ${binds[i]._id}\`)`).catch(console.warn);
					}
					else if (hasRole && !hasPermissions) {
						removed.push(role.id);
						await targetMember.roles.remove(role.id, `Group ranks (\`Bind ${binds[i]._id}\`)`).catch(console.warn);
					}
				}
			
				if (i == (binds.length - 1)) {
					const addedRoles = added.map(id => `<@&${id}>`);
					const removedRoles = removed.map(id => `<@&${id}>`);
				
					return {Added: addedRoles.length > 0 ? addedRoles.join('\n') : 'None', Removed: removedRoles.length > 0 ? removedRoles.join('\n') : 'None', Username: username,Groups: GroupsUpdated}
				}
			}
	} catch(error){
		console.warn(error)
	}
	}
}