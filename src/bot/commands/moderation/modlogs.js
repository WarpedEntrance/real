const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed, Message } = require('discord.js')
const database  = require('../../../utility/database')
const { PaginatedFieldMessageEmbed } = require('@sapphire/discord.js-utilities');
const config = require('../../../utility/config')

class ModlogsCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Check a user\'s moderation history.',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: [],
		});
	}

	async chatInputRun(interaction) {

		await interaction.deferReply({ ephemeral: false });

		const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
        if (!ModLevel.isMod) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to warn members.', true);
        }


        const member = interaction.options.get('user').value
		const warns = await database.Schemas.Warns.find({userId: member});
		const mutes = await database.Schemas.Mutes.find({userId: member});
		const kicks = await database.Schemas.Kicks.find({userId: member});
		const bans = await database.Schemas.Bans.find({userId: member});

		let globalarray = []

		const witems = warns.map(w => { return { title: `**Warning ${w._id}**`, value: `Reason: \`${w.reason}\`\nModerator: <@${w.moderatorId}>\nEvidence: ${w.evidence}\nDate: ${w.date}\n`} });
		const mitems = mutes.map(w => { return { title: `**Mute ${w._id}**`, value: `Reason: \`${w.reason}\`\nModerator: <@${w.moderatorId}>\nEvidence: ${w.evidence}\nDate: ${w.date}\n`} });
		const kitems = kicks.map(w => { return { title: `**Kick ${w._id}**`, value: `Reason: \`${w.reason}\`\nModerator: <@${w.moderatorId}>\nEvidence: ${w.evidence}\nDate: ${w.date}\n`} });
		const bitems = bans.map(w => { return { title: `**Ban ${w._id}**`, value: `Reason: \`${w.reason}\`\nModerator: <@${w.moderatorId}>\nEvidence: ${w.evidence}\nDate: ${w.date}\n`} });

		witems.forEach(element => {
			globalarray.push(element)
		})
		mitems.forEach(element => {
			globalarray.push(element)
		})
		kitems.forEach(element => {
			globalarray.push(element)
		})
		bitems.forEach(element => {
			globalarray.push(element)
		})

		globalarray.sort((a, b) => a.date - b.date)
		
		if(globalarray.length < 1) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'No modlogs found for this user', true);

		let template = new MessageEmbed()
			.setColor('0x2f3136')

		new PaginatedFieldMessageEmbed()
        .setTitleField(`Modlogs for ${member}`)
	   	.setItems(globalarray)
        .formatItems((item) => `\n${item.title}\n${item.value}`)
        .setItemsPerPage(4)
		.setTemplate(template)
        .make()
        .run(interaction);
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption(option =>
						option.setName('user')
							.setDescription('Who\'s modlogs should be checked?')
							.setRequired(true)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.ModlogsCommand = ModlogsCommand;
