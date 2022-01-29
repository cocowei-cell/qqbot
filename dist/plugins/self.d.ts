import { QQBot } from '../index';
export interface ISelfConfig {
    start: string;
    spec: string;
}
export declare const self: (config?: ISelfConfig) => {
    init(bot: QQBot): void;
};
