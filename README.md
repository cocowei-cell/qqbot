# 基于go-cqhttp的JavaScript的QQ机器人框架：js-qqbot

> 安装：npm i js-qqbot
> Git仓库：

- 项目使用typescript编译器编译，以便有类型声明文件

- 打包采用commonjs格式，支持ts项目

- 内部集成了node-schedule模块，帮助你更好的开机定时任务

- 集成express，可以在一个socket中同时监听http服务，更加方便多任务开发

- 此外js-qqbot支持插件化，可以让你像Vue一样通过use方法来注册你的插件

*下面是一段示例代码*：

```js
const { QQBot, self, createPrivateSender } = require("js-qqbot");

const { Tips, Errors } = require("./plugins");

const bot = new QQBot()

bot.use(self).use(Tips).use(Errors) // 调用插件 具体插件编写方法请看下面实例

bot.run((socket) => { // 该回调函数将在go-cqhttp连接上后调用，将当前socket对象传入

const sendPrivate = createPrivateSender(socket); // 创建发送工厂方法

sendPrivate({

user_id: "发送者的QQ账号",

message: "你好，主人！"

})

})
// 监听私有信息

bot.on("private", ({ message, message_id, raw_message, user_id, sender }, socket) => {

const sendPrivate = createPrivateSender(socket)

if (message === "天气") {

sendPrivate({

user_id,

message: "天气是：多云"
})

}

})
// 监听通知类型，如QQ戳一戳，群内戳一戳，具体可查看go-cqhttp官网
bot.on("notify", (data, socket) => {

const sendPrivate = createPrivateSender(socket)

sendPrivate({

user_id: data.sender_id,

message: "诶呀，请不要戳人家啦！"

})

})`
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



> 后续文档持续更新中...