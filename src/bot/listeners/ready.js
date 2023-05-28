const { Listener } = require('@sapphire/framework');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
var CronJob = require('cron').CronJob;


const noblox = require('noblox.js')
const database = require('../../utility/database');
const { GoogleHandler } = require('../../utility/google');
const google = new GoogleHandler();
const botFunctions = require('../../utility/functions');

class ReadyEvent extends Listener {
	constructor(context, options) {
		super(context, {
			...options,
			once: true,
			event: 'ready',
		});
	}

	async run(client) {

	
		const Embed = new MessageEmbed()
			.setColor(3553598)
			.setTimestamp(Date.now())
			.setDescription(`Bot Started.`);
		this.emitter.botFunctions.log(this.emitter, 0, 'restart', { embeds: [Embed] });

		// Loop through every guild and create a document for it if it doesn't exist.
		
		// Ticket Embed
		const TicketInfo = new MessageEmbed()
		.setTitle('<:SCPF:956374329413742692> Paragon Tickets System')
		.setColor(3553598)
		.setDescription('Welcome to the Paragon Ticket System hub.\n\n> **Ticket Rules**\nAll server rules apply,\nDo not misuse the ticket system for joke tickets,\nAlways try to open a ticket within the correct category,\nDo not share the content of tickets with others.\n\n> **How do tickets work?**\nUpon creation, a channel will be created for you. This will create a direct relay between you and the respective department and will transmit your messages between your channel and their own channel. \n***All messages are logged in a transcript, including all attachments and media.***\n\nWhen clicking a ticket or a dropdown item, it will **instantly** open a ticket. "It was a misclick" is not a valid excuse.')

		const EthicsEmbed = new MessageEmbed()
		.setTitle('<:ec:983890396574789642> Ethics Committee Tickets')
		.setColor(3553598)
		.setDescription('All ethics-related inquiries can be found below.')
		.addField('<:ec:983890396574789642> Ethics Violation', 'Ethical Violation reports should be used for those breaking foundation rules.')
		.addField('<:ITD:988773374358589490> Ethics Appeal', 'If you would like to contest your ethical reprimand, use an appeal.')

		const EthicsRow = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('ec-general')
				.setLabel('General Inquiry')
				.setStyle('PRIMARY')
				.setEmoji('983890396574789642'),
		)
		.addComponents(
			new MessageButton()
				.setCustomId('ec-report')
				.setLabel('Ethics Violation')
				.setStyle('SUCCESS')
				.setEmoji('983890396574789642'),
		)
		.addComponents(
			new MessageButton()
				.setCustomId('itd-appeal')
				.setLabel('Appeal')
				.setStyle('SECONDARY')
				.setEmoji('988773374358589490'),
		);

		const ModEmbed = new MessageEmbed()
		.setTitle('<:CMT:984839354226728970> Moderation Tickets')
		.setColor(3553598)
		.setDescription('All **in-game** moderation tickets should be handled below. For a **Discord** issue, please DM a moderator or use modcall.')

		const ModRow = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('mod-report')
				.setLabel('Report a Player')
				.setStyle('SUCCESS')
		)
		.addComponents(
			new MessageButton()
				.setCustomId('mod-exploiter')
				.setLabel('Report an Exploiter')
				.setStyle('DANGER')
		);

		const DepartmentEmbed = new MessageEmbed()
		.setTitle('<:SCPF:956374329413742692> Department Tickets')
		.setColor(3553598)
		.setDescription('If you need to open an inquiry to department command or report a member issue, open a ticket below.')

		const DepartmentRow = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('department_report')
					.setPlaceholder('Select Department')
					.setMaxValues(1)
					.addOptions([
						{
							label: 'Security Department',
							description: 'Report a member of the Security Department',
							value: 'sd',
							emoji: '986275357655203950',
						},
						{
							label: 'Scientific Department',
							description: 'Report a member of the Scientific Department',
							value: 'scd',
							emoji: '986275505705746474',
						},
						{
							label: 'Medical Department',
							description: 'Report a member of the Medical Department',
							value: 'md',
						},
						{
							label: 'Ethics Committee',
							description: 'Report a member of the Ethics Committee',
							value: 'ec',
							emoji: '983890396574789642',
						},
						{
							label: 'Mobile Task Forces',
							description: 'Report a member of the Mobile Task Forces',
							value: 'mtf',
							emoji: '986067631297683456',
						},
						{
							label: 'Anomaly Actors',
							description: 'Report a member of the Anomaly Actors',
							value: 'aa',
							emoji: '994378332680503356',
						},
					]),
			);

		const ManufacturingEmbed = new MessageEmbed()
		.setTitle('<:MaD:974212530752868382> Manufacturing Department Tickets')
		.setColor(3553598)
		.setDescription('If you have an inquiry related to manufacturing, do so below.\n\n**Manufacturing tickets are not to be used to create any sort of suggestion or bug report. Use other appropriate methods to do so.**')

		const ManufacturingRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('mad-employment')
					.setLabel('Employment Inquiry')
					.setStyle('PRIMARY')
					.setEmoji('974212530752868382'),
			)
			.addComponents(
				new MessageButton()
					.setCustomId('mad-report')
					.setLabel('Report a developer')
					.setStyle('SUCCESS'),
			)
			.addComponents(
				new MessageButton()
					.setCustomId('mad-general')
					.setLabel('Open an inquiry')
					.setStyle('SECONDARY'),
			);
	

		const PanelChannel = await this.container.client.channels.fetch('988771537991659570')
		if (PanelChannel) {
			// Delete all messages in channel
			PanelChannel.messages.fetch({ limit: 100 }).then(messages => {
				messages.forEach(message => {
					message.delete();
				});
			});
			// Send Embeds and attach buttons to them
			await PanelChannel.send({embeds: [TicketInfo]});
			await PanelChannel.send({embeds: [ModEmbed], components: [ModRow]});
			await PanelChannel.send({embeds: [EthicsEmbed], components: [EthicsRow]});
			await PanelChannel.send({embeds: [DepartmentEmbed], components: [DepartmentRow]});
			//await PanelChannel.send({embeds: [ManufacturingEmbed], components: [ManufacturingRow]});
		}

		const Servers = await this.container.client.guilds.fetch()

		Servers.forEach(x => {
			this.container.client.utility.utility.CheckForRole(this.container.client, x.id, "Investor")
		})

		const AppealEmbed = new MessageEmbed()
			.setTitle('Ban Appeals')
			.setColor(3553598)
			.setDescription('Have you been banned and wish to appeal? Do so below!')
			//.addField('Ban Appeal', 'Wrongfully banned, or believe you should be unbanned?')

		const AppealRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('banappeal')
					.setLabel('Ban Appeal')
					.setStyle('PRIMARY'),
			);


		const BPanelChannel = await client.channels.fetch('993934361210667058').catch(console.error)
		if (BPanelChannel) {
			// Delete all messages in channel
			BPanelChannel.messages.fetch({ limit: 100 }).then(messages => {
				messages.forEach(message => {
					message.delete();
				});
			});
			// Send Embeds and attach buttons to them
			await BPanelChannel.send({embeds: [AppealEmbed], components: [AppealRow]});
		}

		const TermVerify = new MessageEmbed()
			.setTitle('Terminal Network')
			.setColor(3553598)
			.setDescription('This server is read only and heavily restricted for everyone excluding Terminal Developers and Oversight.\n\nAll logging channels are classified Security Class 4. All other channels are classified Security Class 5 (due to extremely sensitive information related to the development of processes such as Terminal, those who hold SC-5 clearance will not be given access to these channels unless authorized by the Manufacturing Department Oversight).\n\nYou can receive your roles by clicking below. By accepting the terms, you pledge not to leak any content of this server.')

		const TermRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('terminalagree')
					.setLabel('Agree to Terms')
					.setStyle('SUCCESS')
					.setEmoji('✅'),
			);


		const TerminalWelcome = await client.channels.fetch('973673695547629579')
		if (TerminalWelcome) {
			// Delete all messages in channel
			TerminalWelcome.messages.fetch({ limit: 100 }).then(messages => {
				messages.forEach(message => {
					message.delete();
				});
			});
			// Send Embeds and attach buttons to them
			await TerminalWelcome.send({embeds: [TermVerify], components: [TermRow]});

		}

		// SET BOT STATUS \\
		const channel = await client.channels.fetch('1001622855462694962')
		const clientname = channel.name

		const isstreaming = clientname.includes('https://twitch.tv')

		if(isstreaming){
			await client.user.setPresence({activities: [{ type: 'STREAMING', url: clientname, name: 'WE\'RE LIVE!'  }]})
		} else {
			await client.user.setPresence({activities: [{ name: clientname, type: 'PLAYING' }]})
		}
	}
}

exports.ReadyEvent = ReadyEvent;



// const Departments = ["MD","SD", "SCD", "MAD", "MTF", "MP", "EC", "AA", "Delta","Lambda","ETA"];

// const CreateDep = async function(dep,department,Permissions) {
// 	const Group = await google.CreateGroup(department)
// 	await google.SetDefaultSettings(Group.email)
// 	let dbDocument = new database.Schemas.GoogleGroup();
// 	dbDocument.email = Group.email;
// 	dbDocument.Permissions = `${Permissions}`;
// 	await dbDocument.save()
// }

// for (let i = 0; i < Departments.length; i++) {
// 	const Department = Departments[i];
// 	CreateDep(Department,Department,`${Department}:1-255,SCPF:253-255`);
// 	CreateDep(Department,`${Department}-medium-command`,`${Department}:50-255,SCPF:253-255`);
// 	CreateDep(Department,`${Department}-high-command`,`${Department}:100-255,SCPF:253-255`);
// 	CreateDep(Department,`${Department}-central-command`,`${Department}:150-255,SCPF:253-255`);
// }

// CreateDep('','Chairperson','SCPF:254-255');
// CreateDep('','Council','SCPF:253-255');
// CreateDep('','Overwatch-Command','SCPF:251,253,254,255');
// CreateDep('','Senior-Command','SCPF:250,251,253,254,255');
// CreateDep('','Command','SCPF:249,250,251,253,254,255');