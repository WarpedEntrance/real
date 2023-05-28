// For functions involving roblox

module.exports = {
    async GetPlayerGroups(robloxId) {
        try {
			const response = await axios.get(`https://groups.roblox.com/v1/users/${robloxId}/groups/roles`);
			if (response && response.data) {
				const groups = [];
				for (const group of response.data['data']) {
					if (group.role) {
						groups.push({ 'group': group.group.id, 'rank': group.role.rank, 'role': group.role.name, 'uniqueid': group.role.id });
					}
				}

				return groups;
			}
		}
		catch (error) {
            // Set up Proper Error Handling soon
			console.warn(error);
		}
    },

    async GetPlayerRankInGroup(groups, groupId) {
        if (groups.length == 0) return 0;

		for (let i = 0; i < groups.length; i++) {
			if (groups[i].group === groupId) return groups[i].rank;

			if (i == (groups.length - 1)) {
				return 0;
			}
		}
    },
}