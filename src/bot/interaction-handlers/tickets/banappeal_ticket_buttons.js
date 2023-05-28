const { InteractionHandler, InteractionHandlerTypes } = require("@sapphire/framework");
const database = require("../../../utility/database");
const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require("discord.js");

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
		if (interaction.customId.startsWith("banappeal")) {
			const HasOpenTicket = await database.Schemas.Tickets.findOne({ ownerId: interaction.user.id, open: true, category: "banappeal" });
			if (HasOpenTicket) {
				return this.none("You already have an open ticket!");
			}

			const isTicketBanned = await database.Schemas.TicketBans.findOne({ userId: interaction.user.id });
			if (isTicketBanned) return this.none("You are banned from making tickets!");

			const staffTicketCategory = await this.container.client.channels.fetch("993935518679187476");
			const userTicketCategory = await this.container.client.channels.fetch("993935066352857131");

			const ticketId = (await database.Schemas.Tickets.count()) + 1;

			if (staffTicketCategory && userTicketCategory) {
				const staffChannel = await staffTicketCategory.createChannel(`${ticketId}`);
				await staffChannel.lockPermissions();
				const userChannel = await userTicketCategory.createChannel(`${ticketId}`, {
					permissionOverwrites: [
						{
							id: "993933309434408991",
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
				Ticket.category = "banappeal";
				Ticket.ticketId = ticketId;
				Ticket.staffChannelId = staffChannel.id;
				Ticket.userChannelId = userChannel.id;
				Ticket.logChannel = "1003350364092891198";
				await Ticket.save();

				const userEmbed = new MessageEmbed()
					.setTitle("Appeal Opened")
					.setColor(3553598)
					.setDescription(`You have opened a ban appeal!\n\nThank you for opening a ban appeal, please include all relevant information, including why you were banned. A moderator will be with you shortly.`)
					.setTimestamp();

				const staffEmbed = new MessageEmbed().setTitle("Ban Appeal Opened").setColor(3553598).setDescription(`${interaction.user} has opened a ban appeal!`).setTimestamp();

				await userChannel.send({ content: `<@${interaction.user.id}>`, embeds: [userEmbed] });
				await staffChannel.send({ content: `<@${interaction.user.id}>`, embeds: [staffEmbed] });

				return this.some();
			}
		} else {
			return this.none();
		}
	}
};
