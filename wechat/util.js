'use strict'

var xml2js=require('xml2js')
var Promise=require('bluebird')
var tpl=require('./tpl')
var convert=require('koa-convert')

exports.parseXMLAsync=convert(function(xml){//导出parseXMLAsync
    return new Promise(function(resolve,reject){
        xml2js.parseString(xml,{trim:true},function(err,content){
            if(err) reject(err)
            else resolve(content)
        })
    })
})

function formatMessage(result){
    var message={}

    //判断result的类型
    if(typeof result==='object'){
        var keys =Object.keys(result)//拿到所有的key

        for(var i=0;i<keys.length;i++){
            var item=result[keys[i]]//拿到key对应的value
            var key=keys[i]

            if(!(item instanceof Array) || item.length===0){
                continue
            }
            if(item.length===1){
                var val=item[0]

                //判断值得类型
                if(typeof val==='object'){
                    message[key]=formatMessage(val)//对Object进行进一步的遍历
                }else {
                    message[key]=(val || '').trim()//拿掉首尾的空格
                }
            }else{//val既不是0也不是1是个数组
                message[key]=[]

                for(var j=0,k=item.length;j<k;j++){
                    message[key].push(formatMessage(item[j]))
                }
            }
        }
    }
    return message
}


exports.formatMessage=formatMessage //把 message 对象进一步格式化出来

exports.tpl=convert(function(content,message){
    var info={}//临时存储回复的内容
    var type='text'//默认的类型
    var fromUserName=message.FromUserName
    var toUserName=message.ToUserName

    if(Array.isArray(content)){//如果content是数组
        type='news'//就是图文消息
    }

    content = content || {}
    type=content.type || type
    info.content=content
    info.createTime=new Date().getTime()//时间戳
    info.msgType=type
    info.toUserName=fromUserName
    info.fromUserName=toUserName

    return tpl.compiled(info)
})