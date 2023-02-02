const { Collection, InteractionType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionsBitField } = require("discord.js");
module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        if (interaction.isButton()) {
            if (interaction.customId === 'detete') return;
            let data = await client.db.guild.findOne({ guildId: interaction.guild.id });
            let user_data = await client.db.user.findOne({ userId: interaction.user.id });
            if (data?.private_voices?.mode === true) {
                if (interaction.member?.voice.channel && interaction.channel.id === data?.private_voices?.textId && interaction.channel.id === data.private_voices.textId && interaction.member?.voice.channel.id === user_data?.private_voices?.voiceId && interaction.member.voice.channel.id === user_data.private_voices.voiceId) {
                    if (interaction.customId === 'rename') {
                        const Modal = new ModalBuilder()
                            .setCustomId('myModal')
                            .setTitle('Kanal adını değiştiriniz');
                        const Input = new TextInputBuilder()
                            .setCustomId('Input')
                            .setPlaceholder('Kanal açmak')
                            .setLabel("Yeni bir isim giriniz")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(24)
                        firstActionRow = new ActionRowBuilder().addComponents(Input);
                        Modal.addComponents(firstActionRow);
                        await interaction.showModal(Modal);
                    }
                    if (interaction.customId === 'lock') {
                        let user_data = await client.db.user.findOne({ userId: interaction.user.id });
                        if (user_data?.private_voices?.lock === false) {
                            let textId = await client.channels.fetch(data?.private_voices?.textId)
                            await client.db.user.updateOne({ userId: interaction.user.id }, {
                                $set: {
                                    'private_voices.lock': true
                                }
                            })
                            await interaction.reply({ content: `${client.emoji.success} Kanalı başarıyla **açtınız**.`, ephemeral: true }).catch(() => null)
                            await interaction.member.voice.channel.edit({
                                parent: data?.private_voices?.categoryId,
                                permissionOverwrites: [
                                    {
                                        id: interaction.guild.roles.everyone,
                                        allow: [PermissionsBitField.Flags.Connect]
                                    }
                                ]
                            }).catch(() => null)
                        } else if (user_data?.private_voices?.lock === true) {
                            await client.db.user.updateOne({ userId: interaction.user.id }, {
                                $set: {
                                    'private_voices.lock': false
                                }
                            })
                            await interaction.reply({ content: `${client.emoji.success} Kanalı başarıyla **kapattınız**.`, ephemeral: true }).catch(() => null)
                            await interaction.member.voice.channel.edit({
                                parent: data?.private_voices?.categoryId,
                                permissionOverwrites: [
                                    {
                                        id: interaction.guild.roles.everyone,
                                        deny: [PermissionsBitField.Flags.Connect]
                                    }
                                ]
                            }).catch(() => null)
                        }
                    }
                    if (interaction.customId === 'bit') {
                        const Modal = new ModalBuilder()
                            .setCustomId('bit')
                            .setTitle('Kanal bit hızını değiştir');
                        const Input = new TextInputBuilder()
                            .setCustomId('InputBit')
                            .setPlaceholder('8 - 96 kbps')
                            .setLabel("Yeni bit hızı girin")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(2)
                        firstActionRow = new ActionRowBuilder().addComponents(Input);
                        Modal.addComponents(firstActionRow);
                        await interaction.showModal(Modal);
                    }
                    if (interaction.customId === 'limit') {
                        const Modal = new ModalBuilder()
                            .setCustomId('limit')
                            .setTitle('Kullanıcı sınırını değiştir');
                        const Input = new TextInputBuilder()
                            .setCustomId('InputLimit')
                            .setPlaceholder('0 - 99')
                            .setLabel("Yeni bir kullanıcı sınırı girin")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(2)
                        firstActionRow = new ActionRowBuilder().addComponents(Input);
                        Modal.addComponents(firstActionRow);
                        await interaction.showModal(Modal);
                    }
                    if (interaction.customId === 'kick') {
                        const Modal = new ModalBuilder()
                            .setCustomId('kick')
                            .setTitle('Kullanıcı odadan atma');
                        const Input = new TextInputBuilder()
                            .setCustomId('InputKick')
                            .setPlaceholder('ID-Kullanıcı İdsi')
                            .setLabel("Kullanıcı kimliğini/ID girin")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(20)
                        firstActionRow = new ActionRowBuilder().addComponents(Input);
                        Modal.addComponents(firstActionRow);
                        await interaction.showModal(Modal);
                    }
                } else {
                    if (interaction.customId === 'delete') return;
                    await interaction.deferUpdate().catch(() => null)
                    return await interaction.followUp({ content: `${client.emoji.error} Lütfen özel bir oda oluşturun.`, ephemeral: true })
                }
            }
        }
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'myModal') {
                const input = interaction.fields.getTextInputValue('Input');
                interaction.reply({ content: `${client.emoji.success} Kanal adı başarıyla değiştirildi **${input}**`, ephemeral: true })
                await interaction.member.voice.channel.setName(input).catch(() => null)
            }
            if (interaction.customId === 'bit') {
                let input = interaction.fields.getTextInputValue('InputBit');
                if (isNaN(input)) return interaction.reply({ content: `${client.emoji.error} Geçersiz bir sayı girdiniz.`, ephemeral: true })
                if (input > 96) input = 96
                if (input < 8) input = 8
                interaction.reply({ content: `${client.emoji.success} Kanal bit hızı başarıyla değiştirildi **${input}**.`, ephemeral: true })
                await interaction.member.voice.channel.setBitrate(input + `_000`).catch(() => null)
            }
            if (interaction.customId === 'limit') {
                let input = interaction.fields.getTextInputValue('InputLimit');
                if (isNaN(input)) return interaction.reply({ content: `${client.emoji.error} Geçersiz bir sayı girdiniz.`, ephemeral: true })
                interaction.reply({ content: `${client.emoji.success} Kullanıcı sınırı başarıyla değiştirildi **${input}**.`, ephemeral: true })
                await interaction.member.voice.channel.setUserLimit(input).catch(() => null)
            }
            if (interaction.customId === 'kick') {
                let user_data = await client.db.user.findOne({ userId: interaction.user.id });
                let input = interaction.fields.getTextInputValue('InputKick');
                interaction.guild.members.fetch(input).then(x => {
                    if (x.voice.channel.id !== user_data.private_voices.voiceId) return interaction.reply({ embeds: [new EmbedBuilder().setColor(client.colors.default).setDescription(`Belirtilen katılımcı bir ses kanalında değil.`)], ephemeral: true })
                    interaction.reply({ content: `${client.emoji.success} **${x.user.tag}** başarıyla özel odadan atıldı.`, ephemeral: true })
                    x.voice.disconnect()
                }, y => {
                    interaction.reply({ content: `${client.emoji.error} Kullanıcı bulunamadı.`, ephemeral: true })
                }
                )
                await interaction.member.voice.channel.setUserLimit(input).catch(() => null)
            }
        }
    }
}