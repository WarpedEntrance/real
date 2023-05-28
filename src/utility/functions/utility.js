// Functions that pertain to general "utility work"
const database = require('../database');
const { MessageEmbed } = require('discord.js');

module.exports = {
    async IsServerAuthorized(client, serverid) {
        const Guild = await client.guilds.fetch(serverid);
        if(!Guild) return;
        if(Guild.ownerId !== '957774669421895721' && Guild.ownerId !== '153638972013281282'){
            const embed = new MessageEmbed()
                .setDescription(`Terminal has left ${Guild.name} as it is not authorized!`);
            Guild.leave().then(g =>    
                client.botFunctions.log(client, "0", 'leaveLogs', { embeds: [embed] })
            )
        }
        return Guild;
    },

    async CheckForRole(client, serverid, rolename) {
        const Guild = await client.guilds.fetch(serverid);
        if(!Guild) return;
        const Role = await Guild.roles.cache.find(role => role.name === rolename)
        
        if(Role) {
            return Role;
        } else if(!Role) {
            const NewRole = Guild.roles.create({
                name: "Investor",
                color: 0x14a1a6,
                permissions: ["EMBED_LINKS", "ATTACH_FILES", "USE_EXTERNAL_EMOJIS", "USE_EXTERNAL_STICKERS"]

            })
            return NewRole;
        }


    
    }
}