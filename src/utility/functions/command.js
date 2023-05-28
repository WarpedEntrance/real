// functions to aid in commands
const { MessageEmbed } = require('discord.js')

module.exports = {
    InteractionRespond(client, interaction, color, title, msg, ephemeral) {
		const Embed = new MessageEmbed()
			.setColor(color)
			.setDescription(`**${title}** | ${msg}`)
			.setTimestamp(Date.now())
			.setFooter({text: '\u200B', iconURL: interaction.user.displayAvatarURL()});
		return interaction.editReply({
			embeds: [Embed], ephemeral: ephemeral
		})
	},
}