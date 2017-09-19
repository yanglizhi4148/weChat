/**
 * Created by Lizhi.Yang <njalizhi@163.com>
 */

'use strict'

var config = {
    host: '',                   //公网IP或者域名（正式上线时必须为域名）
    listenHost:'127.0.0.1',     //koa运行监听地址
    listenPort:80,              //koa运行监听的端口
    wechat: {
        appID: '',             //公众号app id
        appSecret: '',         //公众号app secret
        token: ''              //公众号设置token
    }
}

module.exports=config
