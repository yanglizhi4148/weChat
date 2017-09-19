/**
 * Created by Lizhi.Yang <njalizhi@163.com>
 */

'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')//是构造函数所以用大写的W
var util = require('./util')

module.exports = function (opts, handler) {
    // 我们在传入这个中间件的时候，首先初始化这个 Wechat，获取到一个实例，后面使用
    var wechat = new Wechat(opts)
    return function*(next) {
        var that = this//把this的值赋给that

        //加密的逻辑
        var token = opts.token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)

        //请求方法的判断
        if (this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + ''
            } else {
                this.body = 'wrong'
            }
        } else if (this.method === 'POST') {
            if (sha !== signature) {
                this.body = 'wrong'
                return false
            }
        }

        var data = yield getRawBody(this.req, {//data是原始的xml数据
            length: this.length,//传输数据的最大长度
            limit: '1mb',//限制体积
            encoding: this.charset//编码
        })
        // console.log(data);//xml数据包是buffer语句
        // console.log(data.toString());

        // parseXMLAsync 是为了把 XML 解析为 JS 对象
        var content = yield util.parseXMLAsync(data)//解析xml
        console.log(content);//解析后的结果

        //格式化的方法
        // formatMessage 是为了把 JS 对象解析为扁平的 JS 对象
        var message = util.formatMessage(content.xml)

        console.log(message);

        //把解析好的message挂载到this上
        this.weixin = message

        yield handler.call(this, next)

        wechat.reply.call(this)
    }
}

