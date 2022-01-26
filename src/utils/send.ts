// 详情查看：
// https://docs.go-cqhttp.org/api/#%E5%8F%91%E9%80%81%E7%A7%81%E8%81%8A%E6%B6%88%E6%81%AF
interface IPrivateSend {
  user_id: string;
  group_id?: string;
  message: string;
  auto_escape?: boolean;
}

/**
 *
 * @param type 发送类型
 * @param socket socket链接
 */
export const createPrivateSender = (socket: any) => (config: IPrivateSend) => socket.send('send_private_msg', config);
