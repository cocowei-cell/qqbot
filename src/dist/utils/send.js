"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrivateSender = void 0;
const createPrivateSender = (socket) => (config) => socket.send('send_private_msg', config);
exports.createPrivateSender = createPrivateSender;
//# sourceMappingURL=send.js.map