const fs = require("fs")

module.exports.init = async (client) => {
    fs.readdirSync("src/events").forEach(dir => {
        fs.readdirSync("src/events/" + dir).filter(end => end.endsWith(".js")).forEach(file => {
            const event = require(`../events/${dir}/${file}`);
            client.on(event.name, event.execute.bind(null, client));
        })
    })
    console.log("[EVENT]: ".green.bold + "Events Handler Başlatıldı".blue.bold);
}