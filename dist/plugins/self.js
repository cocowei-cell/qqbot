"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.self = void 0;
const index_1 = require("../index");
const self = (config = { start: '/say:', spec: ':' }) => ({
    init(bot) {
        bot.on('private', (data, socket) => {
            const sendPrivate = (0, index_1.createPrivateSender)(socket);
            const message = data.message;
            if (message.startsWith(config.start)) {
                const index = message.indexOf(config.spec) + 1;
                sendPrivate({
                    user_id: data.sender.user_id,
                    message: message.substring(index),
                });
            }
        });
    },
});
exports.self = self;
