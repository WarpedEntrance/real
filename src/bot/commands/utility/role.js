const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const database = require('../../../utility/database')
const config = require('../../../utility/config')

class RoleCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Grab optional roles',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });	

        let addable_roles = ['event ping','recruitment ping'];

        let role = interaction.options.get('role').value;

        if(addable_roles.includes(role.toLowerCase())){
            const role_to_add = interaction.guild.roles.cache.find(rolef => rolef.name === role)

            if(!interaction.member.roles.cache.find(rolef => rolef.name === role)){
                await interaction.member.roles.add(role_to_add);
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x00ff00, 'Success', 'You have been added to the ' + role + ' role!', true);
            } else {
                await interaction.member.roles.remove(role_to_add)
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x00ff00, 'Success', 'You have been removed from the ' + role + ' role!', true);
            }
        } else {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'That role is not addable!', true);
        }
	}

registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
        (builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option.setName('role')
                        .setDescription('Select the role you\'d like to add!')
                        .setAutocomplete(true)
                        .setRequired(true)),
        { behaviorWhenNotIdentical: 'OVERWRITE' },
    );
}
}

exports.RoleCommand = RoleCommand;
