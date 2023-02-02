module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        require("../../handlers/commandHandler").init(client);
        require("../../mongo");
        setInterval(() => { client.user.setPresence({ status: `dnd`, activities: [{ name: `Antiperes`, type: 2 }] }) }, 15 * 1000)
    }
}