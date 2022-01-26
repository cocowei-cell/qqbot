"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.self = exports.wether = exports.createPrivateSender = exports.QQBot = void 0;
const bodyParser = require("body-parser");
const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const schedule = require("node-schedule");
const app = express();
class QQBot {
    constructor(port = 9000, path = '/qqbot/ws/') {
        this.ws = null;
        this.app = app;
        this.server = null;
        this.port = null;
        this.path = null;
        this.eventHandlerMap = null;
        this.plugins = [];
        this.socket = null;
        this.schedule = schedule;
        this.port = port;
        this.path = path;
        this.eventHandlerMap = new Map();
        this.server = http.createServer(this.app);
        this.ws = new WebSocket.Server({ server: this.server, path });
        this._init();
    }
    _init() {
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
    }
    run(fn) {
        this.ws.on('connection', socket => {
            const socketSend = socket.send.bind(socket);
            socket.send = (action, data) => socketSend(JSON.stringify({
                action,
                params: data,
            }));
            this.socket = socket;
            fn && fn(this.socket);
            this.excutePlugins();
            socket.on('message', msg => {
                const msgStr = msg.toString();
                const data = JSON.parse(msgStr);
                const { meta_event_type, post_type, message_type, notice_type, sub_type } = data;
                if (post_type === 'message') {
                    const handlers = this.eventHandlerMap.get(message_type);
                    handlers === null || handlers === void 0 ? void 0 : handlers.forEach(handler => {
                        handler && handler(data, socket, this.ws, this.app);
                    });
                }
                else if (post_type === 'notice') {
                    const handlers = this.eventHandlerMap.get(notice_type);
                    handlers === null || handlers === void 0 ? void 0 : handlers.forEach(handler => {
                        handler && handler(data, socket, this.ws, this.app);
                    });
                }
            });
        });
        const { port } = this;
        this.server.listen(this.port, function (err) {
            console.log(`http77://127.0.0.1:${port}`);
        });
    }
    on(event, handle) {
        if (typeof handle !== 'function') {
            return console.error('handle必须是函数');
        }
        process.nextTick(() => {
            const eventArr = this.eventHandlerMap.get(event);
            const fn = (data, socket, ws, app) => handle(data, socket, ws, app);
            if (eventArr) {
                eventArr.push(fn);
                this.eventHandlerMap.set(event, eventArr);
            }
            else {
                this.eventHandlerMap.set(event, [fn]);
            }
        });
    }
    use(plugin) {
        if (this.plugins.includes(plugin)) {
            return this;
        }
        this.plugins.push(plugin);
        return this;
    }
    excutePlugins() {
        this.plugins.forEach(plugin => {
            const type = typeof plugin;
            if (type === 'function') {
                plugin(this);
            }
            else if (type === 'object') {
                plugin.init(this);
            }
        });
    }
}
exports.QQBot = QQBot;
var utils_1 = require("./utils");
Object.defineProperty(exports, "createPrivateSender", { enumerable: true, get: function () { return utils_1.createPrivateSender; } });
var plugins_1 = require("./plugins");
Object.defineProperty(exports, "wether", { enumerable: true, get: function () { return plugins_1.wether; } });
Object.defineProperty(exports, "self", { enumerable: true, get: function () { return plugins_1.self; } });
//# sourceMappingURL=index.js.map