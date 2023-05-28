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
			description: 'Award users with special roles',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });	

        const isMod = this.container.client.utility.moderation.IsModerator(this.container.client, interaction.member);
        if (!isMod) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to award users.', true);
        }

        const addable_roles = ['event winner', 'community creator'];

        let role = interaction.options.get('award').value;
        const member = interaction.options.get('member');

        const membertogive = await interaction.guild.members.fetch(member.value)

        const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
        if (!ModLevel.isMod || ModLevel.level < 3) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to warn members.', true);
        }

        if (addable_roles.includes(role.toLowerCase())) {
            const role_to_add = interaction.guild.roles.cache.find(findrole => findrole.name.toLowerCase() == role.toLowerCase())
            if(!role_to_add) return;

            if(!membertogive.roles.cache.find(findrole => findrole.name.toLowerCase() == role.toLowerCase())){
                await membertogive.roles.add(role_to_add)
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x00ff00, 'Success', 'User has been added to the ' + role_to_add.name + ' role!', true);
            } else {
                await membertogive.roles.remove(role_to_add)
                return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x00ff00, 'Success', 'User has been removed from the ' + role_to_add.name + ' role!', true);
            }
            
        } else {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'That is not a valid role to award!', true);
        }

	}

registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
        (builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(option =>
                    option.setName('member')
                        .setDescription('Select the member to award.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('award')
                        .setDescription('Select the award you\'d like to add!')
                        .setAutocomplete(true)
                        .setRequired(true)),
        { behaviorWhenNotIdentical: 'OVERWRITE' },
    );
}
}

exports.RoleCommand = RoleCommand;
