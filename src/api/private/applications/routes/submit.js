const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const roblox = require('../../../../utility/roblox');
const noblox = require('noblox.js');
const { MessageEmbed } = require('discord.js');
const database = require('../../../../utility/database');


const APP_BUTTONS = [
	{
		style: 3,
		label: 'Accept',
		custom_id: 'accept',
		emoji: '👍',
	},
	{
		style: 4,
		label: 'Read departmental guidelines',
		custom_id: 'deny_Read the guidelines before applying.',
		emoji: '📝',
	},
    {
		style: 4,
		label: 'Lack detail',
		custom_id: 'deny_Some answers lack detail.',
		emoji: '👎',
	},
	{
		style: 4,
		label: 'Incorrect answers',
		custom_id: 'deny_Some details were incorrect in your application.',
		emoji: '👎',
	},
	{
		style: 4,
		label: 'Plagiarism',
		custom_id: 'deny_Plagiarism is NOT allowed!',
		emoji: '👎',
	},
	{
		style: 4,
		label: 'SPAG issues',
		custom_id: 'deny_Spelling, Punctuation and Grammar issues.',
		emoji: '👎',
	},
    {
		style: 4,
		label: 'Not eligible',
		custom_id: 'deny_Not eligible for joining department.',
		emoji: '👎',
	},
	// {
	// 	style: 4,
	// 	label: 'Decline (Other)',
	// 	custom_id: 'deny',
	// 	emoji: '👎',
	// },
	{
		style: 2,
		label: 'Mark as spam',
		custom_id: 'spam',
		emoji: '🗑️',
	},
];

module.exports = {
	async post(req, res) {
		try {
            const body = req.body;
            if (!body.application || !body.templateId) return res.status(400).json({
                success: false,
                data: 'An application object and templateId must be provided',
            });

            const Template = await req.utility.database.Schemas.appTemplates.findById(ObjectId(body.templateId));
            if (!Template) return res.status(400).json({
                success: false,
                data: 'AppTemplate not found',
            });

            if (Template.automatic == true) {
                let CorrectAnswers = 0;
                let passed = false;
                body.application.questions.forEach(function (question){
                    const TemplateQuestion = Template.questions.find(q => q.query === question.query)
                    if (!TemplateQuestion) {
                        return res.status(400).json({
                            success: false,
                            data: 'Corruption',
                        });
                    }

                    if (TemplateQuestion.questionType === "MultipleChoice") {
                        if (TemplateQuestion.answer == question.response) {
                            CorrectAnswers++;
                        }
                    }
                });
                
                const percentage = ((CorrectAnswers / body.application.questions.length) * 100).toFixed(2);
                if (percentage >= 80) {
                    //await roblox.awaitReady()
                    passed = true;
                    let passRank = Template.passRank;
                    if (passRank) {
                        
                        let rank = await noblox.getRankInGroup(passRank.group, body.application.submittingUserId);
                        if (rank < 0) {
                            try {
                                await noblox.handleJoinRequest(passRank.group, body.application.submittingUserId, true)
                            } catch (err) {
                                console.log(err)
                                return res.status(400).json({
                                    success: false,
                                    data: `ERROR: ${err}`,
                                });
                            }
                        }

                        if (rank < passRank.rank) {
                            try {
                                await noblox.setRank(passRank.group, body.application.submittingUserId, passRank.rank)
                            } catch (err) {
                                console.log(err)
                                return res.status(400).json({
                                    success: false,
                                    data: `ERROR 2: ${err}`,
                                });
                            }
                        }
                    }
                } 
                
                var discordId = await roblox.getDiscordIdFromRobloxId(body.application.submittingUserId)
                
                try {
                    const client = req.client;
                    const channel = client.guilds.cache.get('720339214641791006').channels.cache.get('957679153866473593')
                    const userProfileImage = `https://www.roblox.com/headshot-thumbnail/image?userId=${body.application.submittingUserId}&width=420&height=420&format=png`;
                    if (channel) {
                        const ResultEmbed = new MessageEmbed()
                            .setTitle(`${body.application.submittingUserName}'s ${Template.title} application has been ${passed ? 'accepted' : 'denied'}`)
                            .setColor(passed ? 0x30ed56 : 0xed3043)
                            .setTimestamp(Date.now())
                            .setThumbnail(userProfileImage)
                            .setDescription(passed ? `${body.application.submittingUserName}'s ${Template.title} application has been accepted!\n\n ${ discordId ? `*Their roles have automatically been updated.*` : `*They will need to run /update*`} ` : `${body.application.submittingUserName}'s ${Template.title} application has been denied\n**Reason**: \n> Answered too many questions wrong, check the Code of Ethics.`);

                        channel.send({content: discordId ? `<@${discordId}>` : `${body.application.submittingUserName}`, embeds: [ResultEmbed]})
                        //channel.send(`${discordId ? `<@${discordId}>` : body.application.submittingUserName}\nYour **${Template.title}** application has been ${passed ? 'accepted' : 'denied'}.`)
                    }
                } catch (err) {
                    console.log(err)
                    return res.status(400).json({
                        success: false,
                        data: `ERROR 3: ${err}`,
                    });
                }
                return res.status(200).json({
                    success: true,
                    data: passed,
                });
            } else {
                const client = req.client;
                const guild = await client.guilds.fetch(Template.discord.submit.guildId);
                if(Template.passRank.group){
                    const joinrequest = await noblox.getJoinRequest(Template.passRank.group, body.application.submittingUserId)
                    if(!joinrequest){
                        return res.status(400).json({
                            success: false,
                            data: `SEND A JOIN REQUEST TO THE DEPARTMENT!`
                        })
                    }
                }

                const entryfound = await database.Schemas.appSubmissions.find({ submittingUser: body.application.submittingUserId })

                if(entryfound && entryfound.status === "Unread" && entryfound.templateId == Template.templateId){
                    return res.status(400).json({
                        success: false,
                        data: `YOU ALREADY HAVE A PENDING APPLICATION!`
                    })
                }

                if (guild) {
                    const channel = await guild.channels.fetch(Template.discord.submit.channelId);
                    const userProfileImage = `https://www.roblox.com/headshot-thumbnail/image?userId=${body.application.submittingUserId}&width=420&height=420&format=png`;
                    const ApplicationId = await database.Schemas.appSubmissions.count();
                    const appId = ApplicationId+1;
                    // to number

                    if (channel) {
                        const newEmbed = new MessageEmbed()
                        .setTitle(`${Template.title} Application | ${body.application.submittingUserName}`)
                        .setURL(`https://www.roblox.com/users/${body.application.submittingUserId}/profile`)
                        .setColor('#87B8FF')
                        .setAuthor(body.application.submittingUserName, userProfileImage)
                        .setDescription(`**Application Id:** ${appId}`)
                        .setThumbnail(userProfileImage)
                        .setTimestamp();
                        for (const question of body.application.questions) {
                            newEmbed.addField(question.query, question.response);
                        }

                        const flags = []
                        const dbentry = await database.Schemas.Infractions_peopleofinterest.findOne({ userId: body.application.submittingUserId })
                        const groupsofinterest = await database.Schemas.Infractions_groupsofinterest.find()
                        const robloxgroups = await noblox.getGroups(body.application.submittingUserId)

                        if(dbentry){
                            flags.push('Listed as a Person of Interest')
                        }

                        for(const group of robloxgroups){
                            for(const goi of groupsofinterest){
                                if(group.Id == goi.groupId){
                                    if(goi.restrictions.ranklock.length > 0) flags.push(`Member of rank-locked group of interest (Locked to ${goi.restrictions.ranklock})`)
                                    if(goi.restrictions.banned) flags.push(`Member of BANNED group of interest`)
                                    flags.push('Member of a Group of Interest')
                                }
                            }
                        };

                        if(flags.length > 0){
                            newEmbed.addField(`⚠️ FLAGS ⚠️`, `\`\`\`${flags.join(',\n')}\`\`\``, false)
                        }

                        const rows = [];
                        let actionRow = { type: 1, components: [] };
                        for (const n in APP_BUTTONS) {
                            const buttonData = APP_BUTTONS[n];
                            if (buttonData) {
                                const button = {
                                    type: 2,
                                    style: buttonData.style,
                                    label: buttonData.label,
                                    custom_id: 'application_' + appId + '_' + buttonData.custom_id,
                                    emoji: buttonData.emoji,
                                };
            
                                actionRow.components.push(button);
                                if (n % 4 === 0) {
                                    rows.push(actionRow);
                                    actionRow = { type: 1, components: [] };
                                }
                            }
            
                        }
                        if (!rows.includes(actionRow)) {
                            rows.push(actionRow);
                        }

                        const message = await channel.send({ embeds: [newEmbed], components: rows });

                        const Application = new database.Schemas.appSubmissions();
                        Application.submittingUser = body.application.submittingUserId;
                        Application.questions = body.application.questions;
                        Application.applicationId = appId;
                        Application.status = "Unread";
                        Application.submitDate = new Date();
                        Application.submittedData.channelId = Template.discord.submit.channelId
                        Application.submittedData.guildId = Template.discord.submit.guildId
                        Application.submittedData.messageId = message.id;
                        Application.templateId = ObjectId(Template._id);

                        const Result = Application.save()

                        if (Result) {
                            return res.status(200).json({
                                success: true,
                                data: Application.id,
                            });
                        }
                    }
                }
                return res.status(400).json({
                    success: false,
                    data: `ERROR 4: SUBMISSION GUILD NOT FOUND`,
                });
            }
        } catch (err) {
            console.log(err)
            return res.status(400).json({
                success: false,
                data: `ERROR 4: ${err}`,
            });
        }
	},
};