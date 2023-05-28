const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { Time } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js')
const noblox = require('noblox.js')
const database = require('../../../utility/database')
const config = require('../../../utility/config')

class GiveSupporterCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			aliases: [],
			description: 'Award a user with supporter.',
			cooldownDelay: Time.Second * 3,
			runIn: CommandOptionsRunTypeEnum.GuildAny,
			preconditions: [],
			requiredClientPermissions: ['MANAGE_ROLES'],
		});
	}

	async chatInputRun(interaction) {
        await interaction.deferReply({ ephemeral: true });	
// return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x00ff00, 'Success', 'You have been added to the ' + role + ' role!', true);
        const user = interaction.options.get('user').value;
        let days = interaction.options.get('days').value;

        const ModLevel = await this.container.client.utility.moderation.GetModeratorLevel(this.container.client, interaction.member);
        if (!ModLevel.isMod || ModLevel.level < 3) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You are not permitted to warn members.', true);
        }

        const member = await interaction.guild.members.fetch(user)

        if (!member) {
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find the member!', true);
        }
        if (days > 60 && days <= 1){
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'You can only give supporter for up to 60 days!', true);
        }

        const memb = await database.Schemas.Player.findOne({ discordId: member.user.id });

        if(!memb){
            return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0xed3043, 'Error', 'Could not find the member in the database!', true);
        }
        
        const role = await this.container.client.guilds.cache.get('720339214641791006').roles.fetch('974054078457970699');
        if (role) {
            if (!member.roles.cache.has(role.id)) {
                member.roles.add(role).catch(err => {
                    console.log(err);
                });
            }
        }

        if(memb.premiumDays < 0){
            days = memb.premiumDays + days;
        }

        const rank = await noblox.getRankInGroup(6650179, memb.userId);
        if (rank <= 246) {
            noblox.setRank(6650179, memb.userId, 246)
        }

        const update = await database.Schemas.Player.updateOne({userId: memb.userId}, {premiumDays: days});

        const channel = this.container.client.guilds.cache.get('720339214641791006').channels.cache.get('970332616735744050');
        if (channel) {
            channel.send(`${`<@${member.user.id}>`} has been awarded ${days} days of Premium by ${interaction.member}!`)
        }
        return this.container.client.utility.command.InteractionRespond(this.container.client, interaction, 0x30ed56, 'Success', `Successfully added premium to <@${member.user.id}>`, true);
    }

registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
        (builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Select the user you wish to give supporter to')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Select the amount of days you wish to add (max 60)')
                        .setRequired(true)),
        { behaviorWhenNotIdentical: 'OVERWRITE' },
    );
}
}

exports.GiveSupporterCommand = GiveSupporterCommand;
