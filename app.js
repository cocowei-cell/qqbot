const { QQBot, self } = require("./dist/index")


const bot = new QQBot()

bot.run()
bot.use(self)