const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { ApplicationCommandType } = require('discord-api-types/v9');
const config = require('../../../utility/config')
const database = require('../../../utility/database')

class UpdateCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Unbinds a role',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
		await interaction.deferReply({ ephemeral: true });	
		if (!interaction.member.permissions.has('MANAGE_GUILD')) {
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Insufficient permissions', 'You have insufficient permissions to run this command.', true);
		}

		
        const role = interaction.options.getRole('role');

		const existingRole = await database.Schemas.Binds.find({ 'binds.role': role.id }).limit(1);
        if (!existingRole) {
			return this.container.client.utility.command.InteractionRespond(this.container.client, interaction,0xed3043, 'Role not bound', `The <@&${role.id}> role is not bound.`,true);
		}

		await database.Schemas.Binds.deleteOne({ _id: ObjectId(existingRole._id) });

		return this.container.client.utility.command.InteractionRespond(this.container.client, interaction,0x30ed56, 'Success', `Successfully unbound <@&${role.id}>.`,true);

	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
                    .addRoleOption(option => option.setName('role').setDescription('The role you would like to unbind').setRequired(true)),
			{ behaviorWhenNotIdentical: 'OVERWRITE' },
		);
	}
}

exports.UpdateCommand = UpdateCommand;
