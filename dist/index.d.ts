/// <reference types="express-serve-static-core" />
import * as WebSocket from 'ws';
import * as schedule from 'node-schedule';
export declare type SocketFn = (socket: WebSocket) => void;
export interface IPlugin {
    init: (bot: QQBot) => void;
}
export declare type IPluginFn = (bot: QQBot) => void;
export declare type IEventFn = (data?: any, socket?: WebSocket, ws?: WebSocket.Server, app?: Express.Application) => void;
export declare type IEventMap = IEventFn[];
export declare class QQBot {
    ws: WebSocket.Server;
    app: import("express-serve-static-core").Express;
    server: any;
    port: number;
    path: string;
    eventHandlerMap: Map<string, IEventMap>;
    plugins: IPlugin[] | IPluginFn[];
    socket: WebSocket;
    schedule: typeof schedule;
    _id: number;
    pluginsCache: Set<IPlugin & IPluginFn>;
    static runTag: boolean;
    constructor(port?: number, path?: string);
    _init(): void;
    run(fn?: SocketFn): void;
    handleWrong(type: 'error' | 'close' | 'unexpected-response', code: any): void;
    on(event: 'private' | 'notice' | 'error' | 'close' | 'unexpected-response', handle: (data: any, socket: WebSocket, ws?: WebSocket.Server, app?: Express.Application) => void): void;
    use(plugin: IPlugin & IPluginFn): this;
    excutePlugins(): void;
}
export { createPrivateSender } from './utils';
export { wether, self } from './plugins';
