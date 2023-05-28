const { InteractionHandler, InteractionHandlerTypes } = require('@sapphire/framework');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const database = require('../../../utility/database')
const roblox = require('../../../utility/roblox');
const noblox = require('noblox.js')

const { MessageEmbed, Permissions } = require('discord.js');

module.exports = class extends InteractionHandler {
	constructor(ctx) {
		super(ctx, 
            { 
                interactionHandlerType: InteractionHandlerTypes.Button 
            }
        );
	}

	async run(interaction, result) {
		return
	}

	async parse(interaction) {
        try {
            if (interaction.customId.startsWith('application')) {
                const args = interaction.customId.split('_');
                const id = args[1];
                const action = args[2];
                const responseMessage = args[3];
                await interaction.deferReply({ ephemeral: true });

                if (!id || !action) return;

                const reviewer = await roblox.getRobloxIdFromDiscord(interaction.user.id);
                if (!reviewer) return;

                let newStatus;
                let color;
                switch (action) {
                    case 'accept':
                        newStatus = 'Accepted';
                        color = 0x30ed56;
                        break;
                    case 'deny':
                        newStatus = 'Denied';
                        color = 0xed3043;
                        break;
                    case 'spam':
                        newStatus = 'Flagged';
                        color = 0x747474;
                        break;
                }
                if (!newStatus) return;
                
                try {
                    await interaction.editReply({ ephemeral: true, content: 'Updating application status...' });
                    const updates = {
                        reviewingUser: reviewer,
                        reviewDate: new Date(),
                        status: newStatus,
                    };
                    if (responseMessage) {
                        updates.responseMessage = responseMessage;
                    }

                    const app = await database.Schemas.appSubmissions.findOne({ applicationId: id });

                    const Template = await database.Schemas.appTemplates.findById(ObjectId(app.templateId));

                    const response = await database.Schemas.appSubmissions.updateOne({ applicationId: id }, { $set: updates });
                    if (response) {
                        const guild = await interaction.client.guilds.fetch(app.submittedData.guildId);
                        const messageChannel = await guild.channels.fetch(app.submittedData.channelId);
                        const message = await messageChannel.messages.fetch(app.submittedData.messageId);

                        const logGuild =  await interaction.client.guilds.fetch(Template.discord.log.guildId);
                        const logChannel = await logGuild.channels.fetch(Template.discord.log.channelId);
                        const userProfileImage = `https://www.roblox.com/headshot-thumbnail/image?userId=${app.submittingUser}&width=420&height=420&format=png`;

                        const discordId = await roblox.getDiscordIdFromRobloxId(app.submittingUser)
                        const applicantName = await roblox.getUsernameFromRobloxId(app.submittingUser);

                        if (logChannel && logChannel.isText()) {
                            if (!applicantName) applicantName = 'Unknown';

                            let reviewerName = await roblox.getUsernameFromRobloxId(reviewer);
                            if (!reviewerName) reviewerName = 'Unknown';
                            
                            const newEmbed = new MessageEmbed()
                            .setTitle(`${Template.title} Application | ${applicantName}`)
                            .setURL(`https://www.roblox.com/users/${app.submittingUser}/profile`)
                            .setColor('#87B8FF')
                            .setAuthor(applicantName, userProfileImage)
                            .setDescription(`**Application Id:** ${app.applicationId}`)
                            .setThumbnail(userProfileImage)
                            .setTimestamp();
                            for (const question of app.questions) {
                                newEmbed.addField(question.query, question.response);
                            }
                            newEmbed.setColor(color);
                            newEmbed.setDescription(`**Application Id:** ${id}\n**Reviewed by:** ${reviewerName}\n**Status:** ${newStatus}`);
                            logChannel.send({ embeds: [newEmbed] });
                        }

                        
                    
                        try {
                            const c = interaction.client;
                            const ch = c.guilds.cache.get('720339214641791006').channels.cache.get('957679153866473593')
                            
                            if (ch && newStatus !== 'Flagged') {
                                const ResultEmbed = new MessageEmbed()
                                    .setTitle(`${applicantName}'s ${Template.title} application has been ${newStatus == 'Accepted' ? 'accepted' : 'denied'}`)
                                    .setColor(newStatus == 'Accepted' ? 0x30ed56 : 0xed3043)
                                    .setTimestamp(Date.now())
                                    .setThumbnail(userProfileImage)
                                    .setDescription(newStatus == 'Accepted' ? `${applicantName}'s ${Template.title} application has been accepted!\n\n ${ discordId ? `*Their roles have automatically been updated.*` : `*They will need to run /update*`} ` : `${applicantName}'s ${Template.title} application has been denied\n**Reason**: \n> ${responseMessage}`);

                                ch.send({content: discordId ? `<@${discordId}>` : `${applicantName}`, embeds: [ResultEmbed]})
                                //ch.send(`${discordId ? `<@${discordId}>` : applicantName}\nYour **${Template.title}** application has been ${newStatus == 'Accepted' ? 'accepted' : 'denied'}.`)
                            }
                        } catch (err) {
                            console.log(err)
                            return res.status(400).json({
                                success: false,
                                data: `ERROR 3: ${err}`,
                            });
                        }

                        if (newStatus == 'Accepted') {
                            const passRank = Template.passRank
                            if (passRank.group) {
                                let rank = await noblox.getRankInGroup(passRank.group, app.submittingUser);
                                if (rank < 1) {
                                    try {
                                        await noblox.handleJoinRequest(passRank.group, app.submittingUser, true)
                                    } catch (err) {
                                        // handle failed join requests idk
                                        console.log(err)
                                        const joinKey = `joinrequest:${passRank.group}:${app.submittingUser}`;
                                        await interaction.editReply({ ephemeral: true, content: 'User is not pending to join the group.' });
                                        return;
                                    }
                                }

                                if (rank < passRank.rank && passRank.rank > 1) {
                                    try {
                                        await noblox.setRank(passRank.group, app.submittingUser, passRank.rank)
                                    } catch (err) {
                                        console.log(err)
                                    }
                                }
                            }
                            //const cc = await database.Schemas.PendingInvites.findOne({guild: Template.passDiscordInvite, userId: member.id})
                            if (discordId) {
                                const member = await interaction.client.guilds.cache.get('720339214641791006').members.fetch(discordId);
                                const c = interaction.client;
                                const userInviteCategory = c.guilds.cache.get('720339214641791006').channels.cache.get('1000746768776036432')

                                try {
                                    const GuildToInvite = await interaction.client.guilds.cache.get(Template.passDiscordInvite)
                                    var invite;
                                    if(GuildToInvite){
                                        const ChannelToInvite = await GuildToInvite.channels.cache.find(channel => channel.name === "welcome")
                                        invite = await ChannelToInvite.createInvite({
                                            temporary: false,
                                            maxAge: 0,
                                            maxUses: 1,
                                            unique: true,
                                            reason: `Invite for ${member.user.tag}`
                                        })
                                    } else {
                                        invite = null
                                    }

                                    if(userInviteCategory){
                                        try {
                                            const userChannel = await userInviteCategory.createChannel(`${member.user.tag}`, {
                                                permissionOverwrites: [
                                                    {
                                                        id: '720339214641791006',
                                                        deny: [Permissions.FLAGS.VIEW_CHANNEL],
                                                    },
                                                    {
                                                        id: member.id,
                                                        allow: [Permissions.FLAGS.VIEW_CHANNEL],
                                                        deny: [Permissions.FLAGS.SEND_MESSAGES],
                                                    }
                                                ],
                                            });

                                            const newDBEntry = new database.Schemas.PendingInvites()
                                            newDBEntry.guildId = GuildToInvite.id
                                            newDBEntry.userId = member.id
                                            newDBEntry.channelId = userChannel.id
                                            newDBEntry.save()

                                            userChannel.send(`<@${member.id}>`)
                                            userChannel.send(invite ? `You have passed your **${Template.title}** application, please join the following server:\n${invite}` : Template.passDiscordInvite.length < 18 ? `You have passed your **${Template.title}** application, special instructions:\n${Template.passDiscordInvite}` : `You have passed your **${Template.title}** application, although I failed to fetch you an invite. Please DM a member of the department's high command to resolve this issue.`)
                                        } catch(error) {
                                            console.log(error)
                                        }
                                    }

                                    //await member.user.send(invite ? `You have passed your **${Template.title}** application, please join the following server:\n${invite}` : Template.passDiscordInvite.length < 18 ? `You have passed your **${Template.title}** application, special instructions:\n${Template.passDiscordInvite}` : `You have passed your **${Template.title}** application, although I failed to fetch you an invite. Please DM a member of the department's high command to resolve this issue.`)
                                    //await member.user.send(Template.passDiscordInvite.includes('https://discord.gg') ? `You have passed your **${Template.title}** application, please join the following server:\n${Template.passDiscordInvite}` : `You have passed your **${Template.title}** application. Special instructions:\n${Template.passDiscordInvite}`)
                                    
                                } catch (err) {
                                    // DM could not be sent.
                                    console.log(err)
                                }
                            }
                        }

                        await interaction.editReply({ ephemeral: true, content: 'Updated application status.' });
                        if (message) {
                            await message.delete().catch(console.warn);
                        }

                        if(discordId && newStatus === "Accepted"){
                            await interaction.client.botFunctions.updateMember(interaction.client, await interaction.client.guilds.cache.get('720339214641791006').members.fetch(discordId));
                        }
                        

                        return this.some()
                    } else {
                        console.log("Could not get response")
                    }
                
                } catch (e) {
                    console.log(e)
                }
            } else {
                return this.none()
            }
        } catch(err) {
            console.log(err)
        }
	}
};