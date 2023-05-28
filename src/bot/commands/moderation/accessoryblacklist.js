const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const ms = require('ms');
const config = require('../../../utility/config')
const robloxfunctions = require('../../../utility/roblox')
const database = require('../../../utility/database')

class WarnCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Warns a user',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });
		const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
        if (!ModLevel.isMod || ModLevel.level < 2) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to add accessory blacklists.', true);
        }

        const accessoryraw = interaction.options.get('accessoryid').value
        const status = interaction.options.get('status').value

        const accessoryinfo = await robloxfunctions.getCatalogInfo(accessoryraw)

        if(!accessoryinfo) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find this catalog item. This may be due to ROBLOX being down!', true);

        const name = accessoryinfo.Name

        let newstatus;

        switch(status){
            case 'add':
                newstatus = 'Added to blacklist'
                break;
            case 'remove':
                newstatus = 'Removed from blacklist'
                break;
        }

        const LogEmbed = new MessageEmbed()
			.setColor(3553598)
            .setTitle(`Accessory Blacklist Edited`)
            .addField(`Issuer`, `${interaction.member} (${interaction.member.user.tag})`, true)
            .addField(`Accessory`, `${name} (${accessoryraw})`, true)
            .addField(`Status`, newstatus, true)
			.setTimestamp(Date.now())
			.setFooter({text: '\u200B', icon: interaction.member.user.displayAvatarURL()});

        if(status == 'add'){
            if(await database.Schemas.AccessoryBlacklist.findOne({accessoryId : accessoryraw})) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'This accessory is already blacklisted!', true);
            const x = new database.Schemas.AccessoryBlacklist()
            x.accessoryId = accessoryraw
            x.addedBy = interaction.member.id
            x.save()
        } else if (status == 'remove'){
            const findaccessory = await database.Schemas.AccessoryBlacklist.findOne({accessoryId: accessoryraw})
            if(!findaccessory) return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find this accessory in the blacklist database!', true);
            await database.Schemas.AccessoryBlacklist.deleteOne({ accessoryId: accessoryraw})
        }

        this.container.client.botFunctions.log(this.container.client, "0", 'command', { embeds: [LogEmbed] });
        return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Accessory Updated', `Successfully ${newstatus} - ${name}`, true);
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
                    .addStringOption(option =>
						option.setName('accessoryid')
							.setDescription('ID of accessory')
							.setRequired(true))
                    .addStringOption(option =>
                        option.setName('status')
                            .setDescription('Add/Remove Blacklist')
                            .addChoices(
                                {name: 'add', value: 'add'},
                                {name: 'remove', value: 'remove'},
                            )
                            .setRequired(true)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.WarnCommand = WarnCommand;
