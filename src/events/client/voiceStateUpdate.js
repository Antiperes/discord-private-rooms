const { Client, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js')

module.exports = {
    name: 'voiceStateUpdate',
    async execute(client, oldState, newState) {
        let data = await client.db.guild.findOne({ guildId: newState.guild.id });

        if (data?.private_voices?.mode === true) {
            let data = await client.db.guild.findOne({ guildId: newState.guild.id });
            let user = await client.db.user.findOne({ userId: newState.member.user.id, guildId: newState.guild.id });
            if (!user) {
                await client.db.user.create({ userId: newState.member.user.id, guildId: newState.guild.id });
            }
            let channelId = await data?.private_voices?.channelId;
            let categoryId = await data?.private_voices?.categoryId;
            if (oldState.channel?.id !== data?.private_voices?.channelId && oldState.channel?.parent?.id == data?.private_voices?.categoryId && oldState.channel?.members.size === 0) {
                oldState.channel.delete().catch(() => null);
                await client.db.user.updateOne({ userId: newState.member.user.id, guildId: newState.guild.id }, {
                    $set: {
                        'private_voices.voiceId': null,
                        'private_voices.lock': true
                    }
                })
            }
            if (data?.private_voices?.mode === true) {
                if (newState.channel?.id == channelId && oldState.channel?.id == null || newState.channel?.id == channelId && oldState.channel?.id !== null) {
                    newState.guild.channels.create({
                        name: `${newState.member.user.username}`,
                        type: ChannelType.GuildVoice,
                        parent: categoryId,
                        permissionOverwrites: [{
                            id: newState.member.id,
                            allow: [PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers, PermissionFlagsBits.ManageChannels]
                        }, {
                            id: newState.guild.id,
                            deny: [PermissionFlagsBits.ManageChannels]
                        }]
                    }).then(async (channel) => {
                        await client.db.user.updateOne({ userId: newState.member.user.id, guildId: newState.guild.id }, {
                            $set: {
                                'private_voices.voiceId': channel.id,
                            }
                        })
                        newState.setChannel(channel).catch(() => null);
                    })
                }
            }
        }
    }
}