"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.self = void 0;
const index_1 = require("../index");
exports.self = {
    init(bot) {
        bot.on('private', (data, socket) => {
            const sendPrivate = (0, index_1.createPrivateSender)(socket);
            const message = data.message;
            if (message.startsWith('/say:')) {
                const index = message.indexOf(':') + 1;
                sendPrivate({
                    user_id: data.sender.user_id,
                    message: message.substring(index),
                });
            }
        });
    },
};
//# sourceMappingURL=self.js.map