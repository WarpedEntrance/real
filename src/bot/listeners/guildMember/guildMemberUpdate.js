const { Listener } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const googleUtil = require('../../../utility/googlegrouputility');

class GuildMemberUpdateEvent extends Listener {
	constructor(context, options) {
		super(context, {
			...options,
			once: false,
			event: 'guildMemberUpdate',
		});
	}

	async run(oldMember, newMember) {
		if (newMember.user.bot) {return;}
		
		// Role Logging
		const addedRoles = Array.from(newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id)).values());
		const removedRoles = Array.from(oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id)).values());

		if (addedRoles.length > 0 || removedRoles.length > 0) {
			if (addedRoles.find((a) => (a.id == "987505721547571242" || a.id == 987505721547571242))) {
				const channel = newMember.guild.channels.cache.get('970332616735744050')
				if (channel) {
					channel.send(`${newMember} Just **<:Investor:987536957573840937> invested** in the foundation!`)
				}
				const role = await newMember.guild.roles.fetch('987522969347711017');
                if (role) {
                    if (!newMember.roles.cache.has(role.id)) {
                        newMember.roles.add(role).catch(err => {
                            console.log(err);
                        });
                    }
                }
			}
			const Embed = new MessageEmbed()
				.setColor(3553598)
				.setAuthor(`${newMember.user.tag} (${newMember.user.id})`, `${newMember.displayAvatarURL()}`)
				.setTimestamp(Date.now())
				.setDescription(`${newMember} **had their roles updated.**`)
            ;
			if (addedRoles.length > 0) {
				Embed.addField('Added Roles', `${addedRoles.map(r => `${r.name}:${r.id}`).join(',')}`);
				addedRoles.forEach(async (role) => {
					const roleFunction = this.emitter.utility.roleFunctions[role.id];
					if (roleFunction) {
						roleFunction.AddedFunction(this.emitter, newMember);
					}
				});
			}
			if (removedRoles.length > 0) {
				Embed.addField('Removed Roles', `${removedRoles.map(r => `${r.name}:${r.id}`).join(',')}`);
				addedRoles.forEach(async (role) => {
					const roleFunction = this.emitter.utility.roleFunctions[role.id];
					if (roleFunction) {
						roleFunction.RemovedFunction(this.emitter, newMember);
					}
				});
			}
			const roleEditEntry = await newMember.guild.fetchAuditLogs({ type: 'MEMBER_ROLE_UPDATE' }).then(audit => audit.entries.first());

			if (roleEditEntry.target.id === newMember.user.id && roleEditEntry.createdTimestamp > (Date.now() - 10000)) {
				const executor = await newMember.guild.members.fetch(roleEditEntry.executor.id);
				if (executor.user.id == '460175953012981790' || executor.user.bot) { return; }
				Embed.setFooter(`Edited By: ${executor.user.tag}`, executor.user.displayAvatarURL());
			}

			await googleUtil.updateUserGroups(newMember.id);

			this.emitter.botFunctions.log(this.emitter, newMember.guild.id, 'roleLog', { embeds: [Embed] });
		}
	}
}


exports.GuildMemberUpdateEvent = GuildMemberUpdateEvent;
