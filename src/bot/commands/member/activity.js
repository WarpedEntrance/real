const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const database = require('../../../utility/database')
const config = require('../../../utility/config');
const roblox = require('../../../utility/roblox');
const botFunctions = require('../../../utility/functions');
const moment = require('moment')

function GetDaysBetween(start, end) {

    let startDate = new Date(start);
    let endDate = new Date(end);

    let days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    return days;
}


function formatDuration(ms) {
	var duration = moment.duration(ms);
	return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format("_mm");
}

class ActivityCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Get your and other user\'s activity',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: [],
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply();

		let member = interaction.options.get('member');

		var TargetMember;

		if(!member){
			TargetMember = interaction.member
		} else if(member && member.value && member.value !== interaction.member){
			const name = await roblox.getUserIdFromUsername(member.value)
			if(!name) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'This username was not found on ROBLOX!', true);
			const findplayerindb = await botFunctions.GetPlayerFromDatabase({userId: name });
			if(!findplayerindb) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'User not found in Database!', true);
			const mainguild = await this.container.client.guilds.fetch('720339214641791006')
			TargetMember = await mainguild.members.fetch(findplayerindb.discordId)
			if(!TargetMember) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not fetch user!', true);
		}

		const SelectedTeam = interaction.options.get('team').value

		const PlayerEntry = await database.Schemas.Player.findOne({ discordId: TargetMember.id })
		if(!PlayerEntry) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find user in Player database!', true);		

		let ActivityThisMonth = 0
		let ActivityThisWeek = 0
		let ActivityToday = 0

		let ReservedActivityThisMonth = 0
		let ReservedActivityThisWeek = 0
		let ReservedActivityToday = 0

		const data = await database.Schemas.Activity.find({ userId: PlayerEntry.userId, team: SelectedTeam, date: { $gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))}}) // yes it returns the data from the last 30 days
		if(!data) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'No activity found in database!', true);

		const Last7Days = data.filter(data => {
			const DaysBetween = GetDaysBetween(data.date, Date.now());
			return DaysBetween <= 7;
		})
		const LastDay = data.filter(data => {
			const DaysBetween = GetDaysBetween(data.date, Date.now());
			return DaysBetween <= 1;
		})
		const Last7Reserve = Last7Days.filter(data => {
			return data.type == "ReservedServer";
		})
		const LastDayReserve = LastDay.filter(data => {
			return data.type == "ReservedServer";
		})
		const Last7Live = Last7Days.filter(data => {
			return data.type == "StandardServer";
		})
		const LastDayLive = LastDay.filter(data => {
			return data.type == "StandardServer";
		})

		const Last30Live = data.filter(data => {
			return data.type == "StandardServer";
		})
		const Last30Reserved = data.filter(data => {
			return data.type == "ReservedServer";
		})
		
		for(const entry in Last7Live){
			const tot = (Last7Live[entry].endTime - Last7Live[entry].startTime)
			ActivityThisWeek += tot
		}
		for(const entry in LastDayLive){
			const tot = (LastDayLive[entry].endTime - LastDayLive[entry].startTime)
			ActivityToday += tot
		}
		for(const entry in Last7Reserve){
			const tot = (Last7Reserve[entry].endTime - Last7Reserve[entry].startTime)
			ReservedActivityThisWeek += tot
		}
		for(const entry in LastDayReserve){
			const tot = (LastDayReserve[entry].endTime - LastDayReserve[entry].startTime)
			ReservedActivityToday += tot
		}
		for(const entry in Last30Live){
			const tot = (Last30Live[entry].endTime - Last30Live[entry].startTime)
			ActivityThisMonth += tot
		}
		for(const entry in Last30Reserved){
			const tot = (Last30Reserved[entry].endTime - Last30Reserved[entry].startTime)
			ReservedActivityThisMonth += tot
		}

		const AmountOfLogs = data.length

		ActivityThisMonth = formatDuration(ActivityThisMonth).split('_')
		ActivityThisWeek = formatDuration(ActivityThisWeek).split('_')
		ActivityToday = formatDuration(ActivityToday).split('_')

		ActivityThisMonth = `${ActivityThisMonth[0]} hours ${ActivityThisMonth[1]} minutes`
		ActivityThisWeek = `${ActivityThisWeek[0]} hours ${ActivityThisWeek[1]} minutes`
		ActivityToday = `${ActivityToday[0]} hours ${ActivityToday[1]} minutes`

		ReservedActivityThisMonth = formatDuration(ReservedActivityThisMonth).split('_')
		ReservedActivityThisWeek = formatDuration(ReservedActivityThisWeek).split('_')
		ReservedActivityToday = formatDuration(ReservedActivityToday).split('_')

		ReservedActivityThisMonth = `${ReservedActivityThisMonth[0]} hours ${ReservedActivityThisMonth[1]} minutes`
		ReservedActivityThisWeek = `${ReservedActivityThisWeek[0]} hours ${ReservedActivityThisWeek[1]} minutes`
		ReservedActivityToday =  `${ReservedActivityToday[0]} hours ${ReservedActivityToday[1]} minutes`
		

		const Embed = new MessageEmbed()
			.setTimestamp()
			.setTitle(`${TargetMember.displayName} | ${SelectedTeam} Activity`)
			.setDescription(`${TargetMember.displayName} has **${AmountOfLogs}** logged activity times within the last **30 days** on the **${SelectedTeam}** team.`)
			.addField(`Live Server Activity`, `**Last 30 Days**: ${ActivityThisMonth}\n**Last 7 Days**: ${ActivityThisWeek}\n**Today**: ${ActivityToday}`)
			.addField(`Reserved Server Activity`, `**Last 30 Days**: ${ReservedActivityThisMonth}\n**Last 7 Days**: ${ReservedActivityThisWeek}\n**Today**: ${ReservedActivityToday}`)
			.setColor(0x2f3136);
		
		

		await interaction.editReply({ embeds: [Embed] })
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption(option => option.setName('team').setDescription('What team should you search for? Full team name as seen in-game needed.').setRequired(true)
					.addChoices(
						{ name: 'Class-D', value: 'Class D'},
						{ name: 'Administrative Department', value: 'Administrative Department'},
						{ name: 'Medical Department', value: 'Medical Department'},
						{ name: 'Foundation Personnel', value: 'Foundation Personnel'},
						{ name: 'Manufacturing Department', value: 'Manufacturing Department'},
						{ name: 'Ethics Committee', value: 'Ethics Committee'},
						{ name: 'Mobile Task Forces', value: 'Mobile Task Forces'},
						{ name: 'Security Department', value: 'Security Department'},
						{ name: 'O5 Council', value: 'O5 Council'},
						{ name: 'Scientific Department', value: 'Scientific Department'},
						{ name: 'Actors', value: 'Actor'},
						{ name: 'UNGOC', value: 'UNGOC'},
					))
					.addStringOption(option => option.setName('member').setDescription('Who\'s activity should I fetch? Leave blank if yours. (ROBLOX NAME)').setRequired(false)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.ActivityCommand = ActivityCommand;
