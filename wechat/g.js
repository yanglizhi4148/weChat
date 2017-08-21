'use strict'

var sha1 = require('sha1')
var getRawBody=require('raw-body')
var Wechat=require('./wechat')//是构造函数所以用大写的W
var util=require('./util')

module.exports = function (opts) {
    // var wechat = new Wechat(opts)
    return function*(next) {
        var that=this//把this的值赋给that

        //加密的逻辑
        var token = opts.token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)

        //请求方法的判断
        if(this.method==='GET'){
            if (sha === signature) {
                this.body = echostr + ''
            } else {
                this.body = 'wrong'
            }
        }else if(this.method==='POST'){
            if (sha !== signature) {
                this.body = 'wrong'
                return false
            }
        }

        var data=yield getRawBody(this.req,{//data是原始的xml数据
            length:this.length,//传输数据的最大长度
            limit:'1mb',//限制体积
            encoding:this.charset//编码
        })
        // console.log(data);//xml数据包是buffer语句
        // console.log(data.toString());

        // parseXMLAsync 是为了把 XML 解析为 JS 对象
        var content=yield util.parseXMLAsync(data)//解析xml
        console.log(content);//解析后的结果

        //格式化的方法
        // formatMessage 是为了把 JS 对象解析为扁平的 JS 对象
        var message=util.formatMessage(content.xml)

        console.log(message);

        //判断消息的类型
        if(message.MsgType==='event'){//消息是事件
            if(message.Event==='subscribe'){//事件时订阅事件
                var now=new Date().getTime()//生成一个当前时间戳

                that.status=200//设置回复的状态是200
                that.type='application/xml'//设置回复的格式是XML格式

                var reply='<xml>'+
                    '+<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>'+
                    '+<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>'+
                    '+<CreateTime>'+ now +'</CreateTime>'+
                    '+<MsgType><![CDATA[text]]></MsgType>'+
                    '+<Content><![CDATA[哈哈哈哈，可以了]]></Content>'+
                    '+</xml>'

                console.log(reply);
                that.body=reply//设置回复的主体
                return
            }
        }

    }
}

