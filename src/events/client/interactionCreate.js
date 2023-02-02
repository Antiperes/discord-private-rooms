const { Collection } = require("discord.js");
const cooldowns = new Collection()
module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        if (!interaction.isCommand()) return;
        if (!interaction.guild) return;

        const cmd = client.commands.get(interaction.commandName)
        if (!cmd) return;

        if (!await client.db.guild.findOne({ guildId: interaction.guild.id })) await client.db.guild.create({ guildId: interaction.guild.id })
        if (!await client.db.user.findOne({ guildId: interaction.guild.id, userId: interaction.user.id })) await client.db.user.create({ guildId: interaction.guild.id, userId: interaction.user.id })

        if (cmd.user_perm && cmd.user_perm.length > 0 && !interaction.member.permissions.has(cmd.user_perm)) {
            return interaction.reply(`> ${client.emoji.error} Sen\'Bunu yapmaya yetkin bulunmamakta \`${cmd.user_perm.join(", ")}\``, true);
        }
        if (cmd.bot_perm && cmd.bot_perm.length > 0 && !interaction.guild.members.me.permissions.has(cmd.bot_perm)) {
            return interaction.reply(`> ${client.emoji.error} Bot\'Bunu yapmaya yetkim bulunmamakta \`${cmd.bot_perm.join(", ")}\``, true);
        }

        if (!cooldowns.has(interaction.commandName)) {
            cooldowns.set(interaction.commandName, new Collection())
        }
        const now = Date.now();
        const timestamps = cooldowns.get(interaction.commandName);
        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + (cmd.cooldown || 1) * 1000;;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply(`Bekleyin **${timeLeft.toFixed(2)}s.** sonra komutu kullanabilirsiniz.`, true);
            }
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), (cmd.cooldown || 1) * 1000);
        console.log(`[LOGS]: `.green.bold + `[${interaction.commandName.toUpperCase()}]`.blue.bold + ` ${interaction.user.tag}`.yellow + ` komudunu kullandı.`.grey)
        try { cmd.execute(client, interaction) } catch { interaction.reply({ content: `> ${client.emoji.danger} bir hata oluştu.`, ephemeral: true }) }
    }
}
