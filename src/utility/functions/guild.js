// functions that pertain to guilds
const database = require('../database');

module.exports = {
    async CreateGuildConfig(data) {
        // Create a new guild config
        // data = { guildId, type, group }
        const GuildConfig = new database.Schemas.GuildConfig();
        GuildConfig.guildId = data.guildId ? data.guildId : null;
        GuildConfig.type = data.type ? data.type : null;
        GuildConfig.group = data.group ? data.group : null;
        GuildConfig.save();
        return GuildConfig;
    },

    async GetGuildConfig(guildId) {
        // Get a guild config
        const GuildConfig = await database.Schemas.Guild.findOne({guildId: guildId});
        if (!GuildConfig) {
            return null;
        }
        return GuildConfig;
    },

    async AddBind(data) {

    }
}