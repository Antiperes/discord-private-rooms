const fs = require("fs")

module.exports.init = async (client) => {
    fs.readdirSync("src/commands").forEach(dir => {
        fs.readdirSync("src/commands/" + dir).filter(end => end.endsWith(".js")).forEach(file => {
            const cmd = require(`../commands/${dir}/${file}`);
            client.commands_array.push(cmd.slash.toJSON())
            client.commands.set(cmd.slash.toJSON().name, cmd, cmd.category = dir)
        })
    })
    client.application.commands.set(client.commands_array);
    console.log("[EVENT]: ".green.bold + "Command Handler başlatıldı".blue.bold);
}