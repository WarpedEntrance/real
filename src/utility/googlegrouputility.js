const robloxPermissions = require('./robloxPermissions');
const database = require('../utility/database')
const botFunctions = require('../utility/functions');

const { GoogleHandler } = require('./google');
const google = new GoogleHandler();

const isAuthorised = async (groupEmail, userEmail, robloxId, groups) => {
	if (!robloxId && !groups) {
		const player = await database.Schemas.Player.findOne({ email: userEmail });

		if (!player) {
			return false;
		}

		robloxId = player.userId;
	}

	if (!groups) {
		if (isNaN(robloxId)) {
			return false;
		}

		groups = await robloxPermissions.getGroupRanks(robloxId);
	}

	if (!Array.isArray(groups)) {
		return false;
	}

	const registeredGroup = await database.Schemas.GoogleGroup.find({ email: groupEmail }).limit(1);

	if (!registeredGroup) {
		return false;
	}
	const parsedPermissions = robloxPermissions.parseRankString(registeredGroup[0].Permissions);
	
	return robloxPermissions.meetsRequirements(groups, parsedPermissions);
}

const checkGroupMembers = async (groupEmail) => {
	const registeredGroup = await database.Schemas.GoogleGroup.find({ email: groupEmail }).limit(1);


	if (!registeredGroup) return 'The group email you have specified is invalid.';

	const members = await google.GetGroupMembers(registeredGroup.email);
	const removedMembers = [];

	for (const member of members) {
		if (member.role == "MEMBER" && member.email) {
			if (!(await isAuthorised(groupEmail, member.email))) {
				await google.RemoveUserFromGroup(groupEmail, member.email);

				removedMembers.push(member.email);
			}
		}
	}

	return removedMembers;
}

const checkAllGroups = async () => {
	const groups = await database.Schemas.GoogleGroup.find();

	for (const group of groups) {
		await checkGroupMembers(group.email);
	}

	return true;
}

const updateUserGroups = async (discordid) => {
	const added = [];
	const removed = [];
	const existing = [];
	const player = await database.Schemas.Player.findOne({ discordId: discordid });
	if (!player || player.email == '' || !player.email ) return {
		added, removed, existing
	};

	const robloxGroups = await robloxPermissions.getGroupRanks(player.userId);

	const groups = await database.Schemas.GoogleGroup.find();


	for (const group of groups) {
		const authorised = await isAuthorised(group.email, player.email, player.userId, robloxGroups);
		const groupMembers = await google.GetGroupMembers(group.email);

		for (let i=groupMembers.length-1; i>=0; i--) {
			if (groupMembers[i].role != 'MEMBER') {
				groupMembers.splice(groupMembers[i], 1);
			}
		}

		const groupEmailArray = groupMembers.map(x => x.email);
		const isInGroup = groupEmailArray.includes(player.email);

		if (authorised && isInGroup) {
			existing.push(group.email)
		}
		else if (authorised) {
			await google.AddUserToGroup(group.email, player.email);
			added.push(group.email);
		}
		else if (isInGroup) {
			await google.RemoveUserFromGroup(group.email, player.email);
			removed.push(group.email);
		}
	}

	return {
		added, removed, existing
	}
}

module.exports = { isAuthorised, checkGroupMembers, checkAllGroups, updateUserGroups }