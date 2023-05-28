const { Command, CommandOptionsRunTypeEnum, err } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js');
const database = require('../../../utility/database')
const config = require('../../../utility/config')
const noblox = require('noblox.js');

class BcheckCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Background check a user',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: [],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const executordb = await database.Schemas.Player.findOne({ discordId: interaction.user.id })
        if(executordb){
            const rank = await noblox.getRankInGroup(6650179, executordb.userId);
            if(rank < 75) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Unauthorized, aborting!', true);
        }

        let discorduser = interaction.options.get('discorduser')
        let robloxuser = interaction.options.get('robloxuser')

        if(!interaction.options.get('discorduser') && interaction.options.get('robloxuser')){
            robloxuser = await this.container.client.roblox.getUserIdFromUsername(interaction.options.get('robloxuser').value);
            const duser = await database.Schemas.Player.findOne({ userId: robloxuser });
            if(duser) discorduser = duser.discordId;
            
        } else if(!interaction.options.get('robloxuser') && interaction.options.get('discorduser')){
            discorduser = interaction.options.get('discorduser').value
            const ruser = await database.Schemas.Player.findOne({ discordId: discorduser });
            if(!ruser.userId) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find this discord user\'s ROBLOX account!', true);
            robloxuser = ruser.userId
            
        }
        if(!discorduser && !robloxuser) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You must select a user!', true);
        

        const robloxinfoobj = await noblox.getPlayerInfo(robloxuser)
        const robloxuserid = robloxuser
        const robloxusername = robloxinfoobj.username
        const robloxdisplay = robloxinfoobj.displayName
        const robloxcreated = Math.floor(robloxinfoobj.joinDate.getTime()/1000)
        const robloxfriends = robloxinfoobj.friendCount
        const robloxfollowers = robloxinfoobj.followerCount
        const robloxgroups = await noblox.getGroups(robloxuserid)
        const robloxfriendslist = await noblox.getFriends(robloxuserid)
        const robloxavatar = await noblox.getPlayerThumbnail(robloxuserid, 100, 'png')

        const discorduserobj = await this.container.client.guilds.cache.get('720339214641791006').members.fetch(discorduser).catch(err => {return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Member must be in this guild!', true)})
        const discordtag = discorduserobj.user.tag
        const discordid = discorduser
        const discordcreated = Math.floor(discorduserobj.user.createdTimestamp/1000)


        const BackgroundEmbed = new MessageEmbed()
            .setDescription(`Terminal | Background Check`)
            .addField(`Roblox Info`, `**UserId:** ${robloxuserid}\n**Username:** ${robloxusername}\n**DisplayName:** ${robloxdisplay}\n**Created:** <t:${robloxcreated}:D>\n**Friends:** [${robloxfriends}](https://roblox.com/users/${robloxuserid}/friends#!/friends)\n**Followers:** [${robloxfollowers}](https://roblox.com/users/${robloxuserid}/friends#!/followers)`, true);
        
        BackgroundEmbed.setThumbnail(robloxavatar[0].imageUrl)
        if(discorduser && discorduserobj){BackgroundEmbed.addField(`Discord Info`, `**Tag:** ${discordtag}\n**UserID:** ${discordid}\n**Created:** <t:${discordcreated}:D>`, true)}

        // USER FLAGS \\
        const flags = []
        const warnings = []
        const flaggedgroups = []
        const flaggedgroupwords = ['raisa', 'intelligence', 'internal', 'agency', 'information', 'records', 'redacted', 'classified']
        const mainguild = await this.container.client.guilds.cache.get('720339214641791006')
        const membermainroles = (await mainguild.members.fetch(discorduser)).roles

        if(membermainroles.cache.has('955619374423760937')) flags.push('Founder'); 
        if(membermainroles.cache.has('720671862509535353')) flags.push('Overwatch Command'); 
        if(membermainroles.cache.has('955624660068859994')) flags.push('Senior Command'); 
        if(membermainroles.cache.has('955624608348905472')) flags.push('Command'); 

        if(membermainroles.cache.has('974054078457970699')) flags.push('Supporter');

        if(membermainroles.cache.has('955620235392725024')) flags.push('Manufacturing Dept.');
        if(membermainroles.cache.has('974052264497008810')) flags.push('Scientific Dept.');
        if(membermainroles.cache.has('974052022393384960')) flags.push('Mobile Task Forces');
        if(membermainroles.cache.has('974051942236037171')) flags.push('Security Dept.');
        if(membermainroles.cache.has('974052512388763770')) flags.push('Anomaly Actor');
        if(membermainroles.cache.has('974052381773955072')) flags.push('Ethics Committee');

        const warns = await database.Schemas.Warns.find({userId: discordid});
		const mutes = await database.Schemas.Mutes.find({userId: discordid});
		const kicks = await database.Schemas.Kicks.find({userId: discordid});

        const groupsofinterest = await database.Schemas.Infractions_groupsofinterest.find()


        if((warns.length + mutes.length + kicks.length) >= 4 && (warns.length + mutes.length + kicks.length) <= 6) warnings.push('Moderate Moderation History');
        if((warns.length + mutes.length + kicks.length) >= 7) warnings.push('Heavy Moderation History');

        for(const group of robloxgroups){
            for(const flaggedword of flaggedgroupwords){
                if(group.Name.toLowerCase().includes(flaggedword)) flaggedgroups.push(`[${group.Name}](https://roblox.com/groups/${group.Id}) - Detected "${flaggedword}"`)
            };
            for(const goi of groupsofinterest){
                if(group.Id == goi.groupId){
                    flaggedgroups.push(`[${group.Name}](https://roblox.com/groups${group.Id}) - Group of Interest`)
                    if(goi.restrictions.ranklock.length > 0) warnings.push(`Member of rank-locked group of interest (Locked to ${goi.restrictions.ranklock})`)
                    if(goi.restrictions.banned) warnings.push(`Member of BANNED group of interest`)
                    warnings.push('Member of a Group of Interest')
                }
            }
        };
        
        for(const friend of robloxfriendslist.data){
            const peopleofinterest = await database.Schemas.Infractions_peopleofinterest.findOne({ userId: friend.id })
            if(peopleofinterest && !warnings.find(x => x == 'Friends with a POI')) warnings.push('Friends with a POI');
            if(peopleofinterest && !warnings.find(x => x == 'Friends with a burned user') && peopleofinterest.restrictions.burned) warnings.push('Friends with a burned user');
        }

        
        if(flags.length > 0){
            BackgroundEmbed.addField(`Flags`, `\`\`\`${flags.join(',\n')}\`\`\``, false)
        }

        if(warnings.length > 0){
            BackgroundEmbed.addField(`Warnings`, `\`\`\`${warnings.join(',\n')}\`\`\``, false)
        }
        
        if(flaggedgroups.length > 0){
            BackgroundEmbed.addField(`Flagged Groups`, `${flaggedgroups.join(',\n')}`, false)
        }

        await interaction.editReply({embeds: [BackgroundEmbed]})
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
                    .addStringOption(option =>
						option.setName('discorduser')
							.setDescription('Background check a Discord user (ENTER ID)')
							.setRequired(false))
                    .addStringOption(option =>
                        option.setName('robloxuser')
                        .setDescription('Background check a ROBLOX user (NAME ONLY - NOT ID)')
                        .setRequired(false)),

			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.BcheckCommand = BcheckCommand;
