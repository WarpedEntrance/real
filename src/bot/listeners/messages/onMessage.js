const { Constants, Permissions } = require('discord.js');
const { Listener } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');

class OnMessageEvent extends Listener {
	constructor(context, options) {
		super(context, {
			...options,
			once: false,
			event: Constants.Events.MESSAGE_CREATE,
		});
	}

	async run(message) {
		if (message.webhookId !== null) return;
		if (message.system) return;

		if (message.guild && !message.member) {
			await message.guild.members.fetch(message.author.id);
		}

		// Make sure the message is in a guild and not a bot
		if (!message.guild || !message.member || message.author.bot) return;

		// Tag Detection
		if (message.content.startsWith('?')) {
			const tag = await this.emitter.database.Schemas.Tags.findOne({$or: [
				{	
					name: message.content.substring(1),
					guildId: message.guild.id
				},
				{
					aliases: message.content.substring(1),
					guildId: message.guild.id
				}
			]});
			if (tag) {
				message.channel.send(tag.content);
			}
		}

		if (message.channel.type === 'GUILD_TEXT') {
			// Ticket Detection
			const TicketData = await this.emitter.database.Schemas.Tickets.findOne({ $or: [ { userChannelId: message.channel.id }, { staffChannelId: message.channel.id } ] });
			if (TicketData && !message.content.startsWith('!')) {
				const RelayChannelId = TicketData.userChannelId === message.channel.id ? TicketData.staffChannelId : TicketData.userChannelId;
				const RelayChannel = await this.emitter.channels.fetch(RelayChannelId);
				if (RelayChannel) {
					const embeds = [];
					const relayDisplayName = TicketData.staffChannelId === message.channel.id ? `${message.member.roles.highest.name}` : TicketData.anon ? `Anonymous` : `${message.member.displayName}`;
					const RelayMessageEmbed = new MessageEmbed()
						.setColor(3553598)
						.setDescription(`**${relayDisplayName}**: ${message.content}`);

					if (message.attachments.size > 0) {
						message.attachments.forEach((e) => {
							embeds.push(new MessageEmbed().setDescription(`${e.proxyURL || ""}`).setImage(`${e.proxyURL || ""}`).setColor(3553598));
						});
					}
					if(embeds.length >= 1){
						embeds.forEach(async (e) => {
							await RelayChannel.send({ embeds: [e] })
						})
					}
					const RelayMessage = await RelayChannel.send({ embeds: [RelayMessageEmbed]});
					message.react('✅')
				}
			}
			//Sticky Detections
			const sticky = await this.emitter.database.Schemas.Stickies.findOne({channelId: message.channel.id});

			if (sticky) {
				const channel = await message.guild.channels.resolve(message.channel.id)
				const StickyMessage = await channel.messages.fetch(sticky.messageId).catch(err => console.log(err));
				if (StickyMessage) {
					StickyMessage.delete();
				}
				// Create new sticky and send it
				const StickyEmbed = new MessageEmbed()
                .setColor(3553598)
                .setTitle(`⚠️ | ${sticky.title}`)
                .setDescription(sticky.content);


            	const stickyMsg = await message.channel.send({embeds: [StickyEmbed]});

				// Update the sticky's messageId
				await this.emitter.database.Schemas.Stickies.updateOne({channelId: message.channel.id}, {messageId: stickyMsg.id});
			}
		}

		// Auto-Moderation
		const wildcards = [];
		const manualreview = [];
		const bypassroles = ['955624811512594472', '993917281337872424']

		if (message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
			const canbypass = bypassroles.some(role => {
				message.member.roles.cache.has(role)
			})
			if(canbypass) return;
			if (message.content.match(`<@&957774669421895721>`)){
				message.member.timeout(60*1000, 'Mentioning The Administrator').catch(console.error);
			}
			for(var i = 0; i < wildcards.length; i++){
				if(message.content.toLowerCase().includes(wildcards[i])){
					const violated_embed = new MessageEmbed()
						.setColor(0x2f3136)
						.setDescription(`Terminal | Automod Violation\n\nYour message has triggered automod. Please ensure you are following our server rules in the future.\n\n**Message:**\n\`\`\`${message.content}\`\`\`\n**Detected:**\n\`\`\`${wildcards[i]}\`\`\``);
					await message.member.user.send({embeds: [violated_embed]})
					await message.delete();
				}
			}
			for(var i = 0; i < manualreview.length; i++){
				if(message.content.toLowerCase().includes(manualreview[i])){
					const violated_embed = new MessageEmbed()
						.setColor(0x2f3136)
						.setDescription(`Terminal | Automod Violation\n\nYour message has triggered automod for manual review. A moderator will review this and remove your timeout accordingly, or punish you further.\n\n**Message:**\n\`\`\`${message.content}\`\`\`\n**Detected:**\n\`\`\`${manualreview[i]}\`\`\``);
					await message.member.user.send({embeds: [violated_embed]})
					await message.delete();

					const mod_embed = new MessageEmbed()
					.setColor(0x2f3136)
						.setDescription(`Terminal | Automod Violation\n\n A message has triggered automod for manual review. Please review this and remove the timeout accordingly, or punish the user further.\n\n**User:** ${message.member}\n**Guild:** ${message.guild.name}\n\n**Message:**\n\`\`\`${message.content}\`\`\`\n**Detected:**\n\`\`\`${manualreview[i]}\`\`\``)
						.setTimestamp(Date.now())
						.setFooter(`${message.member.user.id} \u200B`, message.member.user.displayAvatarURL());
					await this.container.client.botFunctions.log(this.container.client, "1", 'callLogs', { embeds: [mod_embed], content: `<@&974217266113683486>` });
					await message.member.timeout(40320 * 60 * 1000, `Automod Detection`)
				}
			}
			//this.emitter.botFunctions.moderation.testMessage(this.emitter, message);
		}
		// Do Work here

		if (message.member.roles.cache.length <= 0) {
			this.emitter.botFunctions.updateMember(this.emitter, message.member);
		}
	}
}


exports.OnMessageEvent = OnMessageEvent;