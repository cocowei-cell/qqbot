# 基于go-cqhttp的JavaScript QQ机器人框架：js-qqbot

> 安装：npm i js-qqbot
> Git仓库：[[GitHub - cocowei-cell/qqbot: 基于js的qq机器人框架](https://github.com/cocowei-cell/qqbot)]
> 
> go-cqhttp地址：[开始 | go-cqhttp 帮助中心](https://docs.go-cqhttp.org/guide/quick_start.html#%E4%B8%8B%E8%BD%BD)

- 项目使用typescript编译器编译，更好的代码提示

- 打包采用commonjs格式，且支持TS项目

- 内部集成了node-schedule模块，帮助你更好的开启定时任务

- 集成express，可以在一个socket中同时监听http服务，更加方便多任务开发

- 此外js-qqbot支持插件化，可以让你像Vue一样通过use方法来注册你的插件



## 开启你的QQ机器人之旅

**项目运行前提：安装go-cqhttp**

1. 浏览go-cqhttp官网，找到其git地址，下载对应的版本，具体版本介绍可在官网找到

2. 下载对应平台的软件，windows、mac、linux各不相同，请下载正确的软件

3. 下载完成后，解压进入文件夹。如果是windows系统，win+R  输入cmd命令，或者在当前目录下按住shift+鼠标右键打开powershell，在打开的窗口中输入./go-cqhttp.bat，**注意：直接点击exe不可以的**，然后根据go-cqhttp官网教程选择反向websocket即可。

4. 之后会在目录下多出一个config.yml文件，打开后，将account uni：填写你的QQ账号，**PS：有些同学打开后可能会中文乱码，这个无关紧要，只需要在正确的地方填写就行**，填写qq号码后，找到最底下的 **servers下面的universal**，填写即可，该项填写js-qqbot开启的地址。**注：这里必须按照正确的格式编写(默认情况)，ws://127.0.0.1:9000/qqbot/ws/**,最后的ws/一定要填写，如果端口有其他应用占用，可以在new QQBot(port,path)，传入你想要开启的端口和路径，*eg: 要开启3000端口，路径设置为: /niubi666*,则可在创建机器人实例时传入，new QQBot(3000,'/niubi666')，同时对应config.yml也要修改universal为：**ws://127.0.0.1:3000/niubi666**

5. 编写好cofig.yml后重新执行go-cqhttp，会提示扫码登录等。
   
   **建议：先开启QQBot，然后开启go-cqhttp**



## 项目原理

- go-cqhttp为主要核心，其模拟设备登录QQ，连接腾讯服务器。其收到消息后进一步封装处理，然后和js-qqbot建立websocket连接，实时推送数据，然后在js-qqbot这边进一步封装处理。这也是为什么要选择反向websocket的原因。

- js-qqbot功能：帮助添加更好的go-cqhttp容错功能，包括插件支持，代码提示等。

*下面是一段示例代码*：

```js
const { QQBot, self, createPrivateSender } = require("js-qqbot");
const { Tips, Errors } = require("./plugins");
const bot = new QQBot()
bot.use(self).use(Tips).use(Errors)
// run方法可传入回调函数，将在go-cqhttp连接上时调用
bot.run((socket) => {
  const sendPrivate = createPrivateSender(socket)
  sendPrivate({
    user_id: "目标的qq号",
    message: "你好，主人！"
  }).then((data) => {
    console.log(data);
  })
})
// 监听私聊事假
bot.on("private", ({ message, message_id, raw_message, user_id, sender }, socket) => {
  const sendPrivate = createPrivateSender(socket)
  if (message === "Hello") {
    sendPrivate({
      user_id,
      message: "Hello"
    })
  }
})

// 监听通知类型
bot.on("notify", (data, socket) => {
  const sendPrivate = createPrivateSender(socket)
  sendPrivate({
    user_id: data.sender_id,
    message: "诶呀，请不要戳人家啦！"
  })
})
```

## API接口

> 所有api均从QQbot实例中导出，在调用api之前应先new QQBot()

| API | 功能   | 参数                                                                                                                                                                                                       |
| --- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| on  | 监听事件 | 参数1 : "private"\| "notify" \| "close" \| "error" ；                      参数2：(data,socket,ws,app)=>void                                            参数说明：data为返回的数据，socket为当前的连接，ws为socket实例，app为express对象 |
| use | 注册插件 | 返回：当前实例                                                                                                                                                                                                  |
|     |      |                                                                                                                                                                                                          |
|     |      |                                                                                                                                                                                                          |
|     |      |                                                                                                                                                                                                          |

## 内置工具方法

1. createPrivateSender

**该方法从js-qqbot导出**

```js
const { createPrivateSender, QQBot } = require("js-qqbot");
const bot = new QQBot();

// 监听私聊信息
bot.on("private", (data, socket) => {
  const sender = createPrivateSender(socket) // createPrivateSender创建私聊发送方法
  sender({
    message: "你好",
    user_id: "xxx"
  })
})

```





## 内置插件

*内置插件注册与否由使用者制定，此外还可以配置插件*

1. self

**self插件为内置插件，当有人给机器人发送: /say:xxx时，机器人会回复xxx**

如下：

```ts
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
```



插件机制：当在use方法中注册时，如果是函数，则执行函数，并将bot实例传入，如果是对象，则必须实现init方法，调用init方法 传入bot实例。如果编写插件想要配置插件，则可以将插件写为函数，该函数必须返回一个函数或者对象，同时将配置参数通过函数传参形式传递。

### 编写一个插件

```js
const { sendQQEmail } = require("../utils/sendEmil")
module.exports = {
  init(bot) {
    bot.app.get("/get", (req, res) => {
      res.send("123123123")
    })
    // 这里可以添加错误监控，当机器人挂掉后悔执行对应逻辑
    bot.on("close", (data) => {
      sendQQEmail("机器人close了")
    })
    bot.on("error", (data) => {
      sendQQEmail("机器人error了")
    })
    bot.on("unexpected-response", (data) => {
      sendQQEmail("机器人unexpected-response了")
    })
  }
}
```





> 后续文档持续更新中...