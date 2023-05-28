const { InteractionHandler, InteractionHandlerTypes } = require("@sapphire/framework");
const database = require("../../../utility/database");
const { MessageEmbed, Permissions } = require("discord.js");

module.exports = class extends InteractionHandler {
	constructor(ctx) {
		super(ctx, {
			interactionHandlerType: InteractionHandlerTypes.SelectMenu,
		});
	}

	async run(interaction, result) {
		return;
	}

	async parse(interaction) {
		if (interaction.customId.startsWith("department_report")) {
			interaction.deferUpdate();

			const isTicketBanned = await database.Schemas.TicketBans.findOne({ userId: interaction.user.id });
			if (isTicketBanned) return this.none("You are banned from making tickets!");

			const value = interaction.values;
			let staffticketcat;
			let guildId;
			let category = `${value[0]}-report`;

			let userTicketCategory = await this.container.client.channels.fetch("984758368298233866");
			let logchannel;

			if (value[0] == "sd") {
				staffticketcat = "1003364778925883523";
				guildId = "957760516745486397";
				logchannel = "1003332281726935101";
			} else if (value[0] == "mtf") {
				staffticketcat = "1003365036942704760";
				guildId = "957783674571591691";
				logchannel = "1003332264584806420";
			} else if (value[0] == "scd") {
				staffticketcat = "1003364861268459660";
				guildId = "972669151787221022";
				logchannel = "1003332304602664960";
			} else if (value[0] == "md") {
				staffticketcat = "1003364956101685359";
				guildId = "977041496593297488";
				logchannel = "1003332281726935101";
			} else if (value[0] == "ec") {
				staffticketcat = "1003446998365638695";
				guildId = "983903215953264670";
				logchannel = "1003350735544660028";
			} else if (value[0] == "aa") {
				staffticketcat = "1003365150323130428";
				guildId = "984341203011141662";
				logchannel = "1003332338090004681";
			}

			const staffTicketCategory = await this.container.client.channels.fetch(staffticketcat);

			const HasOpenTicket = await database.Schemas.Tickets.findOne({ ownerId: interaction.user.id, open: true, category: category });
			if (HasOpenTicket) {
				return this.none("You already have an open ticket!");
			}

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
				Ticket.category = category;
				Ticket.ticketId = ticketId;
				Ticket.staffChannelId = staffChannel.id;
				Ticket.userChannelId = userChannel.id;
				Ticket.logChannel = logchannel;
				await Ticket.save();

				const userEmbed = new MessageEmbed()
					.setTitle("Ticket Opened")
					.setColor(3553598)
					.setDescription(`You have opened a ticket!\n\nA member of department command will be with you shortly, in the meantime, please explain your reason for opening the ticket.`)
					.setTimestamp();

				const staffEmbed = new MessageEmbed().setTitle("Ticket Opened").setColor(3553598).setDescription(`${interaction.user} has opened a ticket!`).setTimestamp();

				userChannel.send({ content: `<@${interaction.user.id}>`, embeds: [userEmbed] });
				staffChannel.send({ content: `<@${interaction.user.id}>`, embeds: [staffEmbed] });

				return this.some();
			}
		} else {
			return this.none();
		}
	}
};
