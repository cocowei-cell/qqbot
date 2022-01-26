import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as WebSocket from 'ws';
import * as http from 'http';
import * as schedule from 'node-schedule';
const app = express();
export type SocketFn = (socket: WebSocket) => void;
export interface IPlugin {
  init: (bot: QQBot) => void;
}
export type IPluginFn = (bot: QQBot) => void;
export type IEventFn = (data, socket: WebSocket, ws: WebSocket.Server, app: Express.Application) => void;
export type IEventMap = IEventFn[];
export class QQBot {
  ws: WebSocket.Server = null;
  app = app;
  server = null;
  port: number = null;
  path: string = null;
  eventHandlerMap: Map<string, IEventMap> = null;
  plugins: IPlugin[] | IPluginFn[] = [];
  socket: WebSocket = null;
  schedule = schedule;
  constructor(port = 9000, path = '/qqbot/ws/') {
    this.port = port;
    this.path = path;
    this.eventHandlerMap = new Map();
    this.server = http.createServer(this.app);
    this.ws = new WebSocket.Server({ server: this.server, path });
    this._init();
  }
  /**
   * @description:初始化机器人
   */
  _init() {
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
  }
  /**
   * @description:启动监听端口
   */
  run(fn?: SocketFn) {
    this.ws.on('connection', socket => {
      const socketSend = socket.send.bind(socket);
      socket.send = (action, data) =>
        socketSend(
          JSON.stringify({
            action,
            params: data,
          })
        );
      // 执行插件注册方法
      this.socket = socket;
      fn && fn(this.socket);
      this.excutePlugins();
      socket.on('message', msg => {
        const msgStr = msg.toString();
        const data = JSON.parse(msgStr);
        const { meta_event_type, post_type, message_type, notice_type, sub_type } = data;
        if (post_type === 'message') {
          const handlers = this.eventHandlerMap.get(message_type);
          handlers?.forEach(handler => {
            handler && handler(data, socket, this.ws, this.app);
          });
        } else if (post_type === 'notice') {
          // 通知类型 如戳一戳
          const handlers = this.eventHandlerMap.get(notice_type);
          handlers?.forEach(handler => {
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
  /**
   * @description:监听事件
   */
  on(event: string, handle: (data: any, socket: WebSocket, ws?: WebSocket.Server, app?: Express.Application) => void) {
    if (typeof handle !== 'function') {
      return console.error('handle必须是函数');
    }
    // 异步监听
    process.nextTick(() => {
      const eventArr = this.eventHandlerMap.get(event);
      const fn = (data, socket: WebSocket, ws: WebSocket.Server, app: any) => handle(data, socket, ws, app);
      if (eventArr) {
        eventArr.push(fn);
        this.eventHandlerMap.set(event, eventArr);
      } else {
        this.eventHandlerMap.set(event, [fn]);
      }
    });
  }
  /**
   * @description: 绑定插件,use调用必须在run之后调用
   */
  use(plugin: IPlugin & IPluginFn) {
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
      } else if (type === 'object') {
        plugin.init(this);
      }
    });
  }
}

export { createPrivateSender } from './utils';

export { wether, self } from './plugins';
