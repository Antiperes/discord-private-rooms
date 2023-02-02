const { ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('create-private-rooms')
        .setDescription('Özel oda oluşturun veya silin.').setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(client, interaction) {
        let newdata = await client.db.guild.findOne({ guildId: interaction.guild.id });
        if (newdata?.private_voices?.categoryId && newdata?.private_voices?.channelId != null) {
            let btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('delete').setLabel('Silme').setStyle(ButtonStyle.Danger))
            await interaction.deferReply().catch(() => null)
            let message = await interaction.editReply({ content: `${interaction.user}, özel odalar zaten var.`, components: [btn] })
            let collector = message.createMessageComponentCollector();
            setTimeout(() => {
                interaction.deleteReply().catch(() => null);
                collector.stop()
            }, 20 * 1000);
            collector.on('collect', async (i) => {
                if (interaction.user.id != i.user.id) return i.deferUpdate().catcha(() => null);
                if (i.customId == 'delete') {
                    interaction.editReply({ components: [], content: `${client.emoji.success} **${interaction.user.tag}** özel oda silindi` })
                    let data = await client.db.guild.findOne({ guildId: interaction.guild.id })
                    let channelId = await client.channels.fetch(data?.private_voices?.channelId).catch(() => null)
                    let textId = await client.channels.fetch(data?.private_voices?.textId).catch(() => null)
                    let categoryId = await client.channels.fetch(data?.private_voices?.categoryId).catch(() => null)
                    channelId?.delete().catch(() => null)
                    textId?.delete().catch(() => null)
                    categoryId?.delete().catch(() => null)
                    return await client.db.guild.updateOne({ guildId: interaction.guild.id }, {
                        $set: {
                            'private_voices': {}
                        }
                    })
                }
            })
        } else {
            let categoryId = await interaction.guild.channels.create({
                name: `Private`,
                type: ChannelType.GuildCategory,
            })
            let channelId = await interaction.guild.channels.create({
                name: `[+] Join Create`,
                type: ChannelType.GuildVoice,
                parent: categoryId,
                userLimit: 1,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        allow: [PermissionsBitField.Flags.Connect],
                        deny: [PermissionsBitField.Flags.Speak]
                    }
                ]
            })
            let textId = await interaction.guild.channels.create({
                name: `create-room`,
                parent: categoryId,
                topic: `Özel oda yönetimi`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.SendMessages]
                    }
                ]
            })
            // КНОПКИ УПРАВЛЕНИЯ
            let rename = new ButtonBuilder().setCustomId('rename').setEmoji('✏️').setStyle(ButtonStyle.Secondary);
            let lock = new ButtonBuilder().setCustomId('lock').setEmoji('🔒').setStyle(ButtonStyle.Secondary);
            let bit = new ButtonBuilder().setCustomId('bit').setEmoji('📻').setStyle(ButtonStyle.Secondary)
            let limit = new ButtonBuilder().setCustomId('limit').setEmoji('🫂').setStyle(ButtonStyle.Secondary)
            let kick = new ButtonBuilder().setCustomId('kick').setEmoji('🚫').setStyle(ButtonStyle.Secondary)

            let Buttons = new ActionRowBuilder().addComponents([rename, lock, bit, limit, kick])

            let Embed = new EmbedBuilder().setAuthor({ name: 'Özel oda yönetimi', iconURL: `https://cdn.discordapp.com/emojis/963689541724688404.webp?size=128&quality=lossless` })
                .setDescription(`Butonlara tıklayarak oda ayarlarınızı değiştirebilirsiniz.\n\n✏️ — Oda adını değiştir\n🔒 — Odayı kilitle/aç\n📻 — Oda bit hızını değiştir\n🫂 — Kullanıcı sınırını değiştir\n🚫 — Katılımcıyı odadan atmak`)
                .setColor(client.colors.default)
            textId.send({ embeds: [Embed], components: [Buttons] })
            await client.db.guild.updateOne({ guildId: interaction.guild.id }, {
                $set: {
                    'private_voices.mode': true,
                    'private_voices.categoryId': categoryId,
                    'private_voices.channelId': channelId,
                    'private_voices.textId': textId,
                }
            })

            await interaction.reply({ content: `${client.emoji.success} **${interaction.user.tag}** özel oda açtı.` })
        }
    }
}