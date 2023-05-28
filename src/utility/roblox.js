const axiosRoot = require('axios');
const noblox = require('noblox.js');
const util = require('util');


const database = require('../utility/database')
const botFunctions = require('../utility/functions');

const axios = axiosRoot.create({
	timeout: 10000,
});

const cache = require("./cache");

noblox.setCookie(process.env.ROBLOX_COOKIE).then((data) => {
	console.log(`Logged in successfully to user account ${data.UserName}`)
}).catch(console.warn);

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
    "SCPF:252-255" // 5
]

const placeIds = {
	"live": 9896535629,
	"staging": 9896549458
};

const scanAll = async (pattern) => {
	const found = [];
	let cursor = 0;

	do {
		const reply = await cache.scan(cursor, { MATCH: pattern });

		cursor = reply.cursor;
		for (const key of reply.keys) {
			found.push(key);
		}
	} while (cursor !== 0);

	return found;
};
module.exports = {

    awaitReady() {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			if (!this.cookie) return;

			const isPending = util.inspect(this.currentUser).includes('pending');

			if (isPending) console.log('Awaiting Roblox login...');

			const currentUser = await this.currentUser;

			if (!currentUser || !currentUser.UserName) {
				if (this.retries < this.maxRetries) {
					setTimeout(() => {
						this.retries += 1;
						console.log(`Attempting re-connection to Roblox, try ${this.retries}/${this.maxRetries}`);
						this.currentUser = noblox.setCookie(this.cookie).catch(console.warn);
						resolve(this.awaitReady());
					}, 2000);
				}
				else {
					reject(`Could not connect to Roblox, connection failed after ${this.retries} attempts.`);
				}
			}
			else {
				console.log(`Logged into Roblox (${currentUser.UserName}).`);
				resolve(currentUser);
			}
		});
	},

    async isRobloxDown() {
		try {
			await axios.get('https://roblox.com/');
		}
		catch (error) {
			return true;
		}
		return false;
	},

    async getRobloxIdFromRoVer(discordId) {
		try {
			const response = await axios.get(`https://verify.eryn.io/api/user/${discordId}`);
			if (response && response.data) {
				if (response.data.status == 'ok') {
					return response.data.robloxId;
				}
			}
		}
		catch(err) {
			console.warn(err);
		}
		return null;
	},

	async getRobloxIdFromRoWifi(discordId) {
		try {
			const response = await axios.get(`https://api.rowifi.link/v1/users/${discordId}`);
			if (response && response.data) {
				if (response.data.success != "false") {
					return response.data.roblox_id;
				}
			}
		}
		catch(err) {
			console.warn(err);
		}
		return null;
	},

	async getCatalogInfo(catalogId) {
		try {
			const response = await axios.get(`http://api.roblox.com/marketplace/productinfo?assetId=${catalogId}`);
			if (response && response.data) {
				const data = response.data;

				if (data) {
					return data;
				}
			}
		}
		catch(err) {
			console.warn(err);
		}
		return null;
	},

    async getRobloxIdFromBloxlink(discordId) {
        try {
            const response = await axios.get(`https://v3.blox.link/developer/discord/${discordId}`, {headers: {
				"api-key": "119c70e6-27cb-42ac-a776-1d65613b9e15aa5cd2cd-10b8-4c39-9d7b-4756fbb98736ccab26bc-86ee-49d4-b85d-e6ad8af37525",
			  }});
			if (response && response.data) {
				if (response.data.success === true) {
					return response.data.user.robloxId;
				} else {
					return null;
				}
			}
        } catch (err) {
            console.warn(err)
        }
        return null;
    },

    async getRobloxIdFromDiscord(discordId) {
        let dbDocument = await botFunctions.GetPlayerFromDatabase({ discordId: discordId });
		if (dbDocument) {
            return dbDocument.userId;
		} else { 
			const RoverId = await this.getRobloxIdFromBloxlink(discordId);
            if (RoverId !== null) {
                dbDocument = new database.Schemas.Player();
                dbDocument.discordId = discordId;
                dbDocument.userId = RoverId;
				dbDocument.email = "";
				dbDocument.premiumDays = 0;
                dbDocument.date = new Date();
                await dbDocument.save()
                return RoverId;
            } 
            return null
        }
    },

    async getUserIdFromUsername(Username) {
		try {
			
			const response = await axios.get(`http://api.roblox.com/users/get-by-username?username=${Username}`);
			if (response && response.data) {
				const userId = response.data.Id;

				if (userId) {
					return userId;
				}
			}

		}
		catch (err) {
			console.warn(err);
		}

		return null;
	},

    async getDiscordIdFromRobloxId(robloxId) {
		const dbDocument = await botFunctions.GetPlayerFromDatabase({ userId: robloxId, discordId:{ $exists:true, $ne: null } });
		if (dbDocument) {
			if (dbDocument.discordId) {
				return dbDocument.discordId;
			}
		}
		return null;
	},

    async getUsernameFromRobloxId(robloxId) {
		try {
			
			const response = await axios.get(`http://api.roblox.com/users/${robloxId}`);
			if (response && response.data) {
				const username = response.data.Username;
				if (username) {
					return username;
				}
			}
		}
		catch (err) {
			console.warn(err);
		}

		return null;
	},

    async getThumbnail(userId) {

		try {
			
			const response = await axios.get(`https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=100&height=100&format=png`);
			if (response && response.data) {
				if (response.data[0]) {
					const image = response.data[0].imageUrl;
					return image;
				}
			}
	
		}
		catch (err) {
			console.warn(err);
		}

		return null;
	},

    getGroupRanks(userId) {
        return new Promise((resolve, reject) => {
            axios({
                url: `https://groups.roblox.com/v1/users/${userId}/groups/roles`
            }).then((result) => {
                resolve(result.data.data)
            }).catch((err) => {
                reject(err)
            })
        })
    },

	getRankInGroup(groups, groupId) {
		if (groups.length == 0) return 0;

		for (let i = 0; i < groups.length; i++) {
			if (groups[i].group === groupId) return groups[i].rank;

			if (i == (groups.length - 1)) {
				return 0;
			}
		}
	},

	getRoleInGroup(groups, groupId) {
		if (groups.length == 0) return 0;

		for (let i = 0; i < groups.length; i++) {
			if (groups[i].group === groupId) return groups[i].role;

			if (i == (groups.length - 1)) {
				return 0;
			}
		}
	},

    meetsRequirements(groups, groupRequirements) {
        for (var i = 0; i < groupRequirements.length; i++) {
            var groupBind = groupRequirements[i]
            var rank = this.getRankInGroup(groups, groupBind.group)
            if (groupBind.ranks.includes(rank)) {
                return true;
            }
    
            if (i == (groupRequirements.length - 1)) {
                return false;
            }
        }
    },

    getGroupRank (groups, groupid) {
        if (groups.length == 0) return 0;
    
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].group.id === groupid) return groups[i].role.rank
    
            if (i == (groups.length - 1)) {
                return 0;
            }
        }
    },

    async getGroups(userId) {
		try {
			const response = await axios.get(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
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
			console.warn(error);
		}
	},

    async hasPermissions(discordId, permissions) {
		const parsedPermissions = this.parseRankString(permissions);
		if (typeof parsedPermissions == 'string') return false;

		var robloxId = await this.getRobloxIdFromDiscord(discordId);
		if (!robloxId && robloxId !== null) {
			return false;
		};

		const groupRanks = await this.getGroups(robloxId);
		if (!groupRanks) return false;

		return this.meetsRequirements(groupRanks, parsedPermissions);
	},

    parseRankString (rankString) {
        var groups = rankString.split(' ');
    
        var BindGroups = []
    
        for (var groupString of groups) {
            var [groupId, ranksString] = groupString.split(':');
    
            if (groupAbbreviations[groupId]) groupId = groupAbbreviations[groupId];
    
            //if (groupId.match(/[^\d]/)) return `You have attempted to bind an invalid group: \`${groupId}\``
    
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
    },

    getClearance(groups) {
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
    },

    getUserPermissionRole(userId, permissions, groupRanks) {
        return new Promise(async (resolve, reject) => {
            if (!permissions.read || !permissions.write || !permissions.manage) return reject('Invalid permissions object.');
    
            if (!groupRanks) {
                groupRanks = await getGroupRanks(userId);
            }
            
            if (meetsRequirements(groupRanks, permissions.manage) || meetsRequirements(groupRanks, [{group:4606577, ranks:[9,10,11,255]}])) {
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
    },

    async getServers(stage) {
		const placeId = placeIds[stage];
		const keys = await scanAll(`gameinstance:${placeId}:*`);
		const servers = [];

		if (keys.length == 0) return servers;

		const getServerz = () => {
			return new Promise(async (resolve) => {
				for (let i = 0; i < keys.length; i++) {
					const key = keys[i];

					const serverCache = await cache.get(key);
					if (serverCache) {
						servers.push(JSON.parse(serverCache));
					}

					if (i == (keys.length - 1)) {
						resolve();
					}
				}
			});
		};

		await getServerz();

		return servers;
	},
}