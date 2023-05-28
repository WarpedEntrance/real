const { InteractionHandler, InteractionHandlerTypes } = require("@sapphire/framework");
const database = require("../../../utility/database");
const { MessageEmbed, Permissions } = require("discord.js");
const noblox = require("noblox.js");

module.exports = class extends InteractionHandler {
	constructor(ctx) {
		super(ctx, {
			interactionHandlerType: InteractionHandlerTypes.Button,
		});
	}

	async run(interaction, result) {
		return;
	}

	async parse(interaction) {
		if (interaction.customId.startsWith("ec-general")) {
			const HasOpenTicket = await database.Schemas.Tickets.findOne({ ownerId: interaction.user.id, open: true, category: "ec-general" });
			if (HasOpenTicket) {
				return this.none("You already have an open ticket!");
			}

			const isTicketBanned = await database.Schemas.TicketBans.findOne({ userId: interaction.user.id });
			if (isTicketBanned) return this.none("You are banned from making tickets!");

			const staffTicketCategory = await this.container.client.channels.fetch("988785358659547218");
			const userTicketCategory = await this.container.client.channels.fetch("984758368298233866");
			const guildId = "983903215953264670";

			const ticketId = (await database.Schemas.Tickets.count()) + 1;

			if (staffTicketCategory && userTicketCategory) {
				const staffChannel = await staffTicketCategory.createChannel(`${ticketId}`);
				await staffChannel.lockPermissions();
				const userChannel = await userTicketCategory.createChannel(`${ticketId}`, {
					permissionOverwrites: [
						{
							id: "720339214641791006",
							deny: [Permissions.FLAGS.VIEW_CHANNEL],
						},
						{
							id: interaction.user.id,
							allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES, Permissions.FLAGS.EMBED_LINKS],
						},
					],
				});

				const Ticket = new database.Schemas.Tickets();
				Ticket.ownerId = interaction.user.id;
				Ticket.open = true;
				Ticket.category = "ec-general";
				Ticket.ticketId = ticketId;
				Ticket.staffChannelId = staffChannel.id;
				Ticket.userChannelId = userChannel.id;
				Ticket.logChannel = "1003350735544660028";
				await Ticket.save();

				const userEmbed = new MessageEmbed()
					.setTitle("Ticket Opened")
					.setColor(3553598)
					.setDescription(`You have opened a ticket!\n\nThank you for opening a ticket, a committee representative will review this ticket momentarily.`)
					.setTimestamp();

				const mainguild = await this.container.client.guilds.fetch("720339214641791006");
				const ruser = await database.Schemas.Player.findOne({ discordId: interaction.user.id });
				const robloxuser = ruser.userId;
				const robloxinfoobj = await noblox.getPlayerInfo(robloxuser);
				const robloxuserid = robloxuser;
				const robloxusername = robloxinfoobj.username;
				const robloxdisplay = robloxinfoobj.displayName;
				const robloxcreated = Math.floor(robloxinfoobj.joinDate.getTime() / 1000);
				const robloxfriends = robloxinfoobj.friendCount;
				const robloxfollowers = robloxinfoobj.followerCount;

				const membermainroles = (await mainguild.members.fetch(interaction.user.id)).roles;
				const flags = [];

				if (membermainroles.cache.has("955619374423760937")) flags.push("Founder");
				if (membermainroles.cache.has("720671862509535353")) flags.push("Overwatch Command");
				if (membermainroles.cache.has("955624660068859994")) flags.push("Senior Command");
				if (membermainroles.cache.has("955624608348905472")) flags.push("Command");

				if (membermainroles.cache.has("955620235392725024")) flags.push("Manufacturing Dept.");
				if (membermainroles.cache.has("974052264497008810")) flags.push("Scientific Dept.");
				if (membermainroles.cache.has("974052022393384960")) flags.push("Mobile Task Forces");
				if (membermainroles.cache.has("974051942236037171")) flags.push("Security Dept.");
				if (membermainroles.cache.has("974052512388763770")) flags.push("Anomaly Actor");
				if (membermainroles.cache.has("974052381773955072")) flags.push("Ethics Committee");

				const staffEmbed = new MessageEmbed()
					.setTitle("Ticket Opened")
					.setColor(3553598)
					.setDescription(`${interaction.user} has opened a ticket!`)
					.addField(
						`Roblox Info`,
						`**UserId:** ${robloxuserid}\n**Username:** ${robloxusername}\n**DisplayName:** ${robloxdisplay}\n**Created:** <t:${robloxcreated}:D>\n**Friends:** [${robloxfriends}](https://roblox.com/users/${robloxuserid}/friends#!/friends)\n**Followers:** [${robloxfollowers}](https://roblox.com/users/${robloxuserid}/friends#!/followers)`,
						true
					)
					.setTimestamp();

				if (flags.length > 1) staffEmbed.addField(`User Flags`, `${flags.join(",\n")}`);

				await userChannel.send({ content: `<@${interaction.user.id}>`, embeds: [userEmbed] });
				await staffChannel.send({ content: `<@${interaction.user.id}>`, embeds: [staffEmbed] });
				return this.some();
			} else {
				return this.none("Configuration for this ticket type not set up - please report this.");
			}
		} else if (interaction.customId.startsWith("ec-report")) {
			const HasOpenTicket = await database.Schemas.Tickets.findOne({ ownerId: interaction.user.id, open: true, category: "ec-report" });
			if (HasOpenTicket) {
				return this.none("You already have an open ticket!");
			}

			const isTicketBanned = await database.Schemas.TicketBans.findOne({ userId: interaction.user.id });
			if (isTicketBanned) return this.none("You are banned from making tickets!");

			const ticketId = (await database.Schemas.Tickets.count()) + 1;
			const staffTicketCategory = await this.container.client.channels.fetch("988785358659547218");
			const userTicketCategory = await this.container.client.channels.fetch("984758368298233866");
			if (staffTicketCategory && userTicketCategory) {
				const staffChannel = await staffTicketCategory.createChannel(`report-${ticketId}`);
				await staffChannel.lockPermissions();
				const userChannel = await userTicketCategory.createChannel(`ec-report-${ticketId}`, {
					permissionOverwrites: [
						{
							id: "720339214641791006",
							deny: [Permissions.FLAGS.VIEW_CHANNEL],
						},
						{
							id: interaction.user.id,
							allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES, Permissions.FLAGS.EMBED_LINKS],
						},
					],
				});

				const Ticket = new database.Schemas.Tickets();
				Ticket.ownerId = interaction.user.id;
				Ticket.open = true;
				Ticket.category = "ec-report";
				Ticket.ticketId = ticketId;
				Ticket.staffChannelId = staffChannel.id;
				Ticket.userChannelId = userChannel.id;
				Ticket.logChannel = "1003350735544660028";
				await Ticket.save();

				const userEmbed = new MessageEmbed()
					.setTitle("Ticket Opened")
					.setColor(3553598)
					.setDescription(`You have opened a ticket!\n\nThank you for opening a ticket, a committee representative will review this ticket momentarily.`)
					.setTimestamp();
				const mainguild = await this.container.client.guilds.fetch("720339214641791006");
				const ruser = await database.Schemas.Player.findOne({ discordId: interaction.user.id });
				const robloxuser = ruser.userId;
				const robloxinfoobj = await noblox.getPlayerInfo(robloxuser);
				const robloxuserid = robloxuser;
				const robloxusername = robloxinfoobj.username;
				const robloxdisplay = robloxinfoobj.displayName;
				const robloxcreated = Math.floor(robloxinfoobj.joinDate.getTime() / 1000);
				const robloxfriends = robloxinfoobj.friendCount;
				const robloxfollowers = robloxinfoobj.followerCount;

				const membermainroles = (await mainguild.members.fetch(interaction.user.id)).roles;
				const flags = [];

				if (membermainroles.cache.has("955619374423760937")) flags.push("Founder");
				if (membermainroles.cache.has("720671862509535353")) flags.push("Overwatch Command");
				if (membermainroles.cache.has("955624660068859994")) flags.push("Senior Command");
				if (membermainroles.cache.has("955624608348905472")) flags.push("Command");

				if (membermainroles.cache.has("955620235392725024")) flags.push("Manufacturing Dept.");
				if (membermainroles.cache.has("974052264497008810")) flags.push("Scientific Dept.");
				if (membermainroles.cache.has("974052022393384960")) flags.push("Mobile Task Forces");
				if (membermainroles.cache.has("974051942236037171")) flags.push("Security Dept.");
				if (membermainroles.cache.has("974052512388763770")) flags.push("Anomaly Actor");
				if (membermainroles.cache.has("974052381773955072")) flags.push("Ethics Committee");

				const staffEmbed = new MessageEmbed()
					.setTitle("Ticket Opened")
					.setColor(3553598)
					.setDescription(`${interaction.user} has opened a ticket!`)
					.addField(
						`Roblox Info`,
						`**UserId:** ${robloxuserid}\n**Username:** ${robloxusername}\n**DisplayName:** ${robloxdisplay}\n**Created:** <t:${robloxcreated}:D>\n**Friends:** [${robloxfriends}](https://roblox.com/users/${robloxuserid}/friends#!/friends)\n**Followers:** [${robloxfollowers}](https://roblox.com/users/${robloxuserid}/friends#!/followers)`,
						true
					)
					.setTimestamp();

				if (flags.length > 1) staffEmbed.addField(`User Flags`, `${flags.join(",\n")}`);

				await userChannel.send({ content: `<@${interaction.user.id}>`, embeds: [userEmbed] });
				await staffChannel.send({ content: `<@${interaction.user.id}>`, embeds: [staffEmbed] });
				return this.some();
			}
		} else if (interaction.customId.startsWith("itd-appeal")) {
			const HasOpenTicket = await database.Schemas.Tickets.findOne({ ownerId: interaction.user.id, open: true, category: "itd" });
			if (HasOpenTicket) {
				return this.none("You already have an open ticket!");
			}

			const isTicketBanned = await database.Schemas.TicketBans.findOne({ userId: interaction.user.id });
			if (isTicketBanned) return this.none("You are banned from making tickets!");

			const ticketId = (await database.Schemas.Tickets.count()) + 1;
			const staffTicketCategory = await this.container.client.channels.fetch("987974424080826388");
			const userTicketCategory = await this.container.client.channels.fetch("1016456674472640513");
			if (staffTicketCategory && userTicketCategory) {
				const staffChannel = await staffTicketCategory.createChannel(`appeal-${ticketId}`);
				await staffChannel.lockPermissions();
				const userChannel = await userTicketCategory.createChannel(`itd-appeal-${ticketId}`, {
					permissionOverwrites: [
						{
							id: "720339214641791006",
							deny: [Permissions.FLAGS.VIEW_CHANNEL],
						},
						{
							id: interaction.user.id,
							allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES, Permissions.FLAGS.EMBED_LINKS],
						},
					],
				});

				const Ticket = new database.Schemas.Tickets();
				Ticket.ownerId = interaction.user.id;
				Ticket.open = true;
				Ticket.category = "ec-report";
				Ticket.ticketId = ticketId;
				Ticket.staffChannelId = staffChannel.id;
				Ticket.userChannelId = userChannel.id;
				Ticket.logChannel = "1003350508397924392";
				await Ticket.save();

				const userEmbed = new MessageEmbed()
					.setTitle("Ticket Opened")
					.setColor(3553598)
					.setDescription(`You have opened a ticket!\n\nThank you for opening a ticket, a committee representative will review this ticket momentarily.`)
					.setTimestamp();
				const mainguild = await this.container.client.guilds.fetch("720339214641791006");
				const ruser = await database.Schemas.Player.findOne({ discordId: interaction.user.id });
				const robloxuser = ruser.userId;
				const robloxinfoobj = await noblox.getPlayerInfo(robloxuser);
				const robloxuserid = robloxuser;
				const robloxusername = robloxinfoobj.username;
				const robloxdisplay = robloxinfoobj.displayName;
				const robloxcreated = Math.floor(robloxinfoobj.joinDate.getTime() / 1000);
				const robloxfriends = robloxinfoobj.friendCount;
				const robloxfollowers = robloxinfoobj.followerCount;

				const membermainroles = (await mainguild.members.fetch(interaction.user.id)).roles;
				const flags = [];

				if (membermainroles.cache.has("955619374423760937")) flags.push("Founder");
				if (membermainroles.cache.has("720671862509535353")) flags.push("Overwatch Command");
				if (membermainroles.cache.has("955624660068859994")) flags.push("Senior Command");
				if (membermainroles.cache.has("955624608348905472")) flags.push("Command");

				if (membermainroles.cache.has("955620235392725024")) flags.push("Manufacturing Dept.");
				if (membermainroles.cache.has("974052264497008810")) flags.push("Scientific Dept.");
				if (membermainroles.cache.has("974052022393384960")) flags.push("Mobile Task Forces");
				if (membermainroles.cache.has("974051942236037171")) flags.push("Security Dept.");
				if (membermainroles.cache.has("974052512388763770")) flags.push("Anomaly Actor");
				if (membermainroles.cache.has("974052381773955072")) flags.push("Ethics Committee");

				const staffEmbed = new MessageEmbed()
					.setTitle("Ticket Opened")
					.setColor(3553598)
					.setDescription(`${interaction.user} has opened a ticket!`)
					.addField(
						`Roblox Info`,
						`**UserId:** ${robloxuserid}\n**Username:** ${robloxusername}\n**DisplayName:** ${robloxdisplay}\n**Created:** <t:${robloxcreated}:D>\n**Friends:** [${robloxfriends}](https://roblox.com/users/${robloxuserid}/friends#!/friends)\n**Followers:** [${robloxfollowers}](https://roblox.com/users/${robloxuserid}/friends#!/followers)`,
						true
					)
					.setTimestamp();

				if (flags.length > 1) staffEmbed.addField(`User Flags`, `${flags.join(",\n")}`);

				await userChannel.send({ content: `<@${interaction.user.id}>`, embeds: [userEmbed] });
				await staffChannel.send({ content: `<@${interaction.user.id}>`, embeds: [staffEmbed] });
				return this.some();
			}
		} else {
			return this.none();
		}
	}
};
