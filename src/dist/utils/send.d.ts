interface IPrivateSend {
    user_id: string;
    group_id?: string;
    message: string;
    auto_escape?: boolean;
}
export declare const createPrivateSender: (socket: any) => (config: IPrivateSend) => any;
export {};
