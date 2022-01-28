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
export type IEventFn = (data?, socket?: WebSocket, ws?: WebSocket.Server, app?: Express.Application) => void;
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
  _id = 0;
  pluginsCache = new Set<IPlugin & IPluginFn>();
  static runTag = false; // 第一次连接上去后就锁住，以防止多次连接，造成插件执行多次
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
    if (QQBot.runTag) {
      throw new Error('run方法只需调用一次即可');
    }
    QQBot.runTag = true; // 防止多次调用run方法
    this.ws.on('connection', socket => {
      console.log('连接上....');
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
      this.excutePlugins();
      fn && fn.call(this, this.socket);
      socket.on('message', msg => {
        const msgStr = msg.toString();
        const data = JSON.parse(msgStr);
        const { meta_event_type, post_type, message_type, notice_type, sub_type } = data;
        if (post_type === 'message') {
          const handlers = this.eventHandlerMap.get(message_type);
          handlers?.forEach(handler => {
            handler && handler.call(this, data, socket, this.ws, this.app);
          });
        } else if (post_type === 'notice') {
          // 通知类型 如戳一戳
          const handlers = this.eventHandlerMap.get(notice_type);
          handlers?.forEach(handler => {
            handler && handler.call(this, data, socket, this.ws, this.app);
          });
        }
      });
      socket.on('close', () => {
        this.handleWrong('close', '1');
      });
      socket.on('error', err => {
        this.handleWrong('error', '0');
      });
      socket.on('unexpected-response', () => {
        this.handleWrong('unexpected-response', '-1');
      });
    });
    this.ws.on('close', () => {
      this.handleWrong('close', '1');
    });
    this.ws.on('error', () => {
      this.handleWrong('error', '0');
    });
    const { port } = this;
    this.server.listen(this.port, function (err) {
      console.log(`http://127.0.0.1:${port}已经开启`);
    });
  }
  handleWrong(type: 'error' | 'close' | 'unexpected-response', code) {
    const handlers = this.eventHandlerMap.get(type);
    handlers?.forEach(fn => {
      fn(type);
    });
    console.error(type);
    QQBot.runTag = false;
  }
  /**
   * @description:监听事件
   */
  on(
    event: 'private' | 'notice' | 'error' | 'close' | 'unexpected-response',
    handle: (data: any, socket: WebSocket, ws?: WebSocket.Server, app?: Express.Application) => void
  ) {
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
    // Gen the uniq id
    if (this.plugins.includes(plugin)) {
      return this;
    }
    this.plugins.push(plugin);
    return this;
  }
  excutePlugins() {
    // 执行插件先加入插件执行池
    this.plugins.forEach(plugin => {
      if (this.pluginsCache.has(plugin)) {
        return;
      }
      const type = typeof plugin;
      if (type === 'function') {
        plugin(this);
      } else if (type === 'object') {
        plugin.init(this);
      }
      this.pluginsCache.add(plugin);
    });
  }
}

export { createPrivateSender } from './utils';

export { wether, self } from './plugins';
