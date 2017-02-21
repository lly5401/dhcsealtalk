##WebSDK1.0迁移到2.0的说明

###切换SDK文件的引入连接
* 如果你引用的是网络上的源，请改变文件引用[连接]()。
* 如果你引用的是本地源码，将原1.0SDK引用文件换成[2.0SDK]()（若你用的TypeScript请添加RongIMLib.d.ts）

###调用方式的改变
   新版的SDK源码采用TypeScript模块化编程，在原RongIMClient上加了一层module `module RongIMLib{}` 和之前调用API的方法有些区别例如：  

```js
//SDK1.0 初始化。
RongIMClient.init(appkey);

//SDK2.0改为以下方式
RongIMLib.RongIMClient.init(appkey);

其他参数说明
/**
 * 初始化 SDK，在整个应用全局只需要调用一次。
 * @param appKey    开发者后台申请的 AppKey，用来标识应用。
 * @param dataAccessProvider 必须是DataAccessProvider的实例
 */
static init(appKey: string,  dataAccessProvider?: DataAccessProvider): void;

```

###属性获取和设置方式的转变

```js
//之前属性的设置和获取都是通过访问器方法的形式
var msg=new TextMessage();
msg.getContent();
msg.setContent("hello word");
//2.0可以直接调用属性
msg.content//获取属性值
msg.content="hello word!"//设置属性值
```

###类定义的变动
   所有的枚举类型和实体类型都定义在model RongIMLib下


###一些API添加了回调方法(详细查找[API文档](http://www.rongcloud.cn/docs/api/js/index.html))

* removeConversation

```js
RongIMLib.RongIMClient.getInstance().removeConversation(type, targetId, {
    onSuccess: function(bo) {
		//bo:删除是否成功
    },
    onError: function() {

    }
});
```


###部分方法换成静态方法

* setOnReceiveMessageListener()
* setConnectionStatusListener()

```javascript
RongIMLib.RongIMClient.setOnReceiveMessageListener(obj);
```


###特殊的
* getConversationList
	SDK1.0版通过syncConversationList同步服务器的会话列表。在2.0版本通过以下方法获取。

```javascript
RongIMLib.RongIMClient.getInstance().getConversationList({
    onSuccess: function(array) {
        //array:会话数组
    },
    onError: function(error) {

    }
});
```
