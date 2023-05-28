const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { ApplicationCommandType } = require('discord-api-types/v9');
const { MessageEmbed } = require('discord.js')
const { google } = require('googleapis');
const { option } = require('lexure');
const database = require('../../../utility/database')
const config = require('../../../utility/config')

class LinkCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Link an external source to your account.',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: [],
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply({ ephemeral: true });	
		
        const code = interaction.options.getString('code', false);

		const messageOptions = {
			embeds: [{
				color: 0x308AED,
			}],
		};
		const oAuth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			'https://api.scpf.network/code', // return code in browser
		);

        if (code) {
			oAuth2Client.getToken({ code: code }).then((result) => {
				oAuth2Client.setCredentials(result.tokens);

				const oAuth2 = google.oauth2({
					auth: oAuth2Client,
					version: 'v2',
				});

				oAuth2.userinfo.get(async (err, res) => {
					if (err) {
						messageOptions.embeds[0].color = 0xed3043;
						messageOptions.embeds[0].fields = [{
							inline: false,
							name: 'Error',
							value: 'An error occured while fetching your email. Please try again.',
						}];
						return ctx.editReply(messageOptions);
					}
					const email = res.data.email;

					const existingEmail = await this.container.client.botFunctions.GetPlayerFromDatabase({ email: email });
					if (existingEmail) {
						return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Email already bound', `The email provided is already linked to another account.`, true);
					}

					const player = await this.container.client.botFunctions.GetPlayerFromDatabase({ discordId: interaction.member.id });
					player.email = email;
					await player.save();
					return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Email bound', `The email provided has been bound.`, true);

				}).catch((err) => {
					return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', `Error while validating email.`, true);
				});
			}).catch((err) => {
				return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', `Error while validating email.`, true);
			});
        } else {
            const authUrl = oAuth2Client.generateAuthUrl({
				scope: ['https://www.googleapis.com/auth/userinfo.email'],
			});

			
            messageOptions.components = [{
				type: 1,
				components: [{
					type: 2,
					style: 5,
					label: 'Authorise Terminal',
					url: authUrl,
				}],
			}];
			messageOptions.embeds[0].description = 'Please authorise Terminal to view your email address and run the command again with the code provided by Google (`/link code:yourcodehere`).';
			return interaction.editReply(messageOptions);
        }
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
                    .addStringOption(option => 
                        option.setName('code')
                            .setDescription('Code provided by Google to link your email')
                            .setRequired(false)),
			{behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.LinkCommand = LinkCommand;
