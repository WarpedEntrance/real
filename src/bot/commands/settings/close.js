const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { ApplicationCommandType } = require('discord-api-types/v9');
const config = require('../../../utility/config')
const database = require('../../../utility/database')
const Transcript = require('discord-html-transcripts');
const { MessageEmbed } = require('discord.js');

class ScanCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Close a ticket.',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_CHANNELS'],
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply({ ephemeral: true });	

		const ticketObject = await database.Schemas.Tickets.findOne({staffChannelId: interaction.channel.id})
		const isChanneluser = await database.Schemas.Tickets.findOne({userChannelId: interaction.channel.id})
		if(isChanneluser) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Insufficient Permissions', 'Only the staff member can close tickets!', true);
		if(!ticketObject) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Ticket not found', 'This ticket cannot be found in the database.', true);		
		if(ticketObject.open == false) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Ticket already closed', 'This ticket has already been closed!', true);		
		ticketObject.open = false;
		ticketObject.closeData.closedBy = interaction.user.id;
		ticketObject.closeData.closedAt = Date.now();
		await ticketObject.save();

		const staffTicketChannel = await this.container.client.channels.fetch(ticketObject.staffChannelId);
		const userTicketChannel = await this.container.client.channels.fetch(ticketObject.userChannelId);

		/// Give Transcript to Logging Channel \\\

		const attachment = await Transcript.createTranscript(interaction.channel)
		const TranscriptEmbed = new MessageEmbed()
			.setTimestamp()
			.setTitle(`Transcript for Ticket #${ticketObject.ticketId}`)
			.setDescription(`Download the file and open it to view the transcript!`)
			.setFooter({ text: '\u200B', icon: interaction.user.displayAvatarURL() });
		const logChannel = await this.container.client.channels.fetch(ticketObject.logChannel)
		logChannel.send({ embeds: [TranscriptEmbed] })
		logChannel.send({ files: [attachment] })


		/// Give Transcript to User \\\

		const closereason = interaction.options.get('reason').value

		var theuser;

		theuser = await (await this.container.client.guilds.fetch('720339214641791006')).members.fetch(ticketObject.ownerId).catch()

		if(!theuser){
			theuser = await (await this.container.client.guilds.fetch('993933309434408991')).members.fetch(ticketObject.ownerId).catch()
		}

		if(theuser){
			const userattachment = await Transcript.createTranscript(userTicketChannel)
			const userTranscriptEmbed = new MessageEmbed()
				.setTimestamp()
				.setTitle(`Ticket #${ticketObject.ticketId} closed`)
				.setDescription(`Your ticket was closed with the following reason:\n\`${closereason}\`\n\nDownload the file and open it to view the transcript!`)
				.setFooter({ text: '\u200B', icon: interaction.user.displayAvatarURL() });
			
			theuser.send({ embeds: [userTranscriptEmbed] }).catch()
			theuser.send({ files: [userattachment] }).catch()
		}
		try{
			if(staffTicketChannel) await staffTicketChannel.delete();
			if(userTicketChannel) await userTicketChannel.delete();
		} catch(err) {
			console.log(err)
		}
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption(option => option.setName('reason').setDescription('Reason for closing ticket | VISIBLE TO USER!').setRequired(true)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.ScanCommand = ScanCommand;
