const axios = require("axios")
		//const Departments = ["MD","SD", "MTF", "MP", "LD", "EC", "E&TS", "AA", "DEA", "ISD", "Delta","Lambda","ETA"];

var groupAbbreviations = {
    //--/ Main Group /--
    "SCPF": 6650179,
    "FP": 6650179,

    //--/ Combatives /--
    "SD":  6650222,
    "MP":  14435116,
    "SRU":  14938531,

    "MTF":  6650407,
    "Lambda":  14891143,
    "Delta":  14891152,
    "ETA":  14966173,
    "GOC":  14692337,

    //--/ Non-Combatives /--
    "AD":  6650198,
    "ScD":  6650221,
    "MaD":  6650216,
    "LD":  6650214,
    "ITD":  9882890,
    "ISD":  6650210,
    "EC":  6650206,
    "E&TS": 6650203,
    "DEA": 6650200,
    "MD": 6650217,

    //--/ Hostiles /--

    //--/Special /--
    "AA": 14397690,
    "Lore": 14965848,
}

var classificationRanks = [
    "All", // 0
    "All", // 1
    "All", // 2
    "SCPF:249-255", // 3
    "SCPF:250-255", // 4
    "SCPF:253-255" // 5
]

const parseRankString = (rankString) => {
    const TheRankString = rankString
    var groups = TheRankString.split(' ');

    var BindGroups = []

    for (var groupString of groups) {
        var [groupId, ranksString] = groupString.split(':');

        if (groupAbbreviations[groupId]) groupId = groupAbbreviations[groupId];

        if (groupId.toString().match(/[^\d]/)) return `You have attempted to bind an invalid group: \`${groupId}\``

        var bind = {
            group: Number(groupId)
        }

        if (ranksString != null) {
            const ranks = []
            const unparsedRanks = ranksString.split(',')
            for (const rank of unparsedRanks) {
                const rangeMatch = rank.match(/(\d+)-(\d+)/)
                const rankNumber = parseInt(rank, 10)

                if (rangeMatch) {
                    const start = parseInt(rangeMatch[1], 10)
                    const stop = parseInt(rangeMatch[2], 10)

                    if (start && stop) {
                        for (let i = start; i <= stop; i++) {
                            ranks.push(i)
                        }
                    }
                } else if (rankNumber != null) {
                    ranks.push(rankNumber)
                }
            }
            bind.ranks = ranks
        } else if (!groupId.match(/[a-z]/i)) {
            bind.ranks = []
            for (let i = 1; i <= 255; i++) {
                bind.ranks.push(i)
            }
        } else {
            bind.ranks = []
        }
        BindGroups.push(bind)
    }

    return BindGroups
}

var getGroupRank = (groups, groupid) => {
    if (groups.length == 0) return 0;

    for (var i = 0; i < groups.length; i++) {
        if (groups[i].group.id === groupid) return groups[i].role.rank

        if (i == (groups.length - 1)) {
            return 0;
        }
    }
}

var getGroupRoles = async (groupId) => {
    try {
        const response = await axios.get(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        if (response && response.data) {
            if (response.data.roles) {
                return response.data.roles
            }
        }
    } catch(err) {
        
    }

    return null;
}

var meetsRequirements = (groups, groupRequirements) => {
    for (var i = 0; i < groupRequirements.length; i++) {
        var groupBind = groupRequirements[i]
        var rank = getGroupRank(groups, groupBind.group)

        if (groupBind.ranks.includes(rank)) {
            return true;
        }

        if (i == (groupRequirements.length - 1)) {
            return false;
        }
    }
}

var getGroupRanks = (userId) => {
    return new Promise((resolve, reject) => {
        axios({
            url: `https://groups.roblox.com/v1/users/${userId}/groups/roles`
        }).then((result) => {
            resolve(result.data.data)
        }).catch((err) => {
            reject(err)
        })
    })
}


var getUserPermissionRole = (userId, permissions, groupRanks) => {
    return new Promise(async (resolve, reject) => {
        if (!permissions.read || !permissions.write || !permissions.manage) return reject('Invalid permissions object.');

        if (!groupRanks) {
            groupRanks = await getGroupRanks(userId);
        }
        
        if (meetsRequirements(groupRanks, permissions.manage) ) {
            return resolve('manager');
        } 
        else if (meetsRequirements(groupRanks, permissions.write)) {
            return resolve('writer');
        }
        else if (meetsRequirements(groupRanks, permissions.read)) {
            return resolve('reader');
        }
        else {
            resolve(null);
        }
    })
}

var getClearance = (groups) => {
    var clearance = 0;

    for (let i=0; i<classificationRanks.length; i++) {
        var requirements = classificationRanks[i];

        if (requirements == "All") {
            clearance = i
        } else {
            var parsed = parseRankString(requirements);

            if (typeof parsed == "string") {
                console.warn(requirements + ':', parsed);
                parsed = [];
            }

            if (meetsRequirements(groups, parsed)) {
                clearance = i
            };
        }

        if (i == (classificationRanks.length - 1)) return clearance;
    }
}

module.exports = {parseRankString, getGroupRank, meetsRequirements, getUserPermissionRole, getGroupRanks, getClearance, getGroupRoles, groupAbbreviations, classificationRanks}