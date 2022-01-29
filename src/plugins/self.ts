import { QQBot, createPrivateSender } from '../index';
export interface ISelfConfig {
  start: string;
  spec: string;
}
export const self = (config: ISelfConfig = { start: '/say:', spec: ':' }) => ({
  init(bot: QQBot) {
    bot.on('private', (data, socket) => {
      const sendPrivate = createPrivateSender(socket);
      const message = data.message as string;
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
