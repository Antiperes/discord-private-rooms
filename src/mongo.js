const mongoose = require("mongoose");

mongoose.connect(process.env.uri, { keepAlive: true });

mongoose.connection.on("connected", () => {
    console.log(`[MongoDB]: `.green.bold + `Mongoya bağlandı!`.blue.bold)
})

mongoose.connection.on('err', err => {
    console.log(`[MongoDB]: `.green.bold + `Mongo bağlantı hatası:\n${err.stack}`.red.bold)
});

mongoose.connection.on('disconnected', () => {
    console.log(`[MongoDB]: `.green.bold + `Mongo bağlantısını kaybetti!`.yellow.bold)
});