const { Client, Partials, Collection } = require("discord.js");
const User = require("./models/User");
const Guild = require("./models/Guild");
require("dotenv").config();
require("colors");
const client = new Client({
    intents: 14023,
    partials: [Partials.User, Partials.Message, Partials.GuildMember, Partials.Channel],
    allowedMentions: { repliedUser: false },
});
client.commands_array = [];
client.commands = new Collection();
client.colors = { default: 16777215 };
client.emoji = { success: "✔️", danger: "⚠", error: "⚠" };
client.db = { user: User, guild: Guild };

require("./handlers/eventHandler").init(client);

client.login(process.env.token).then(console.log(`[APP]: `.green.bold + `Bot başarıyla çalıştırıldı!`.blue.bold));

module.exports = client;