const { LogLevel, SapphireClient } = require('@sapphire/framework');
const { Intents } = require('discord.js');
const { resolve } = require('node:path');
const { Time } = require('@sapphire/time-utilities');
const API = require('../api/entry');
const fs = require('fs');
const path = require('path');

const client = new SapphireClient({
	defaultPrefix: '!',
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug,
	},
	loadMessageCommandListeners: true,
	baseUserDirectory: resolve('./src/bot'),
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
	],
	defaultCooldown: {
		cooldownDelay: Time.Second * 3,
		cooldownLimit: 1,
	}
});

client.utility = {};
// Load utility functions under the client
function isClass(v) {
	return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

const utilityFiles = fs.readdirSync(path.join(__dirname, '../utility/functions')).filter(file => file.endsWith('.js'));
for (const file of utilityFiles) {
	const route = require(path.join(__dirname, '../utility/functions', file));
	const utilityName = file.replace('.js', '');

	if (isClass(route)) {
		client.utility[utilityName] = new route();
	}
	else {
		client.utility[utilityName] = route;
	}
}

client.utility.roleFunctions = {}
const roleFunctionFiles = fs.readdirSync(path.join(__dirname, '../utility/roleFunctions')).filter(file => file.endsWith('.js'));
for (const file of roleFunctionFiles) {
	const route = require(path.join(__dirname, '../utility/roleFunctions', file));
	const roleId = route.roleId;

	client.utility.roleFunctions[roleId] = route;
}

client.botFunctions = require('../utility/functions'); // Will be removed eventually
client.roblox = require('../utility/roblox'); // Will be removed eventually
client.database = require('../utility/database'); // Will be removed eventually
client.cache = require('../utility/cache')
API.StartAPI(client);
client.login(process.env.DISCORD_BOT_TOKEN);