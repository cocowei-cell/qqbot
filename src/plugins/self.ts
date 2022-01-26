import { QQBot, createPrivateSender } from '../index';

// 自己给自己发送消息
export const self = {
  init(bot: QQBot) {
    bot.on('private', (data, socket) => {
      const sendPrivate = createPrivateSender(socket);
      const message = data.message as string;
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
