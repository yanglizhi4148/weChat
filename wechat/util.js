'use strict'

var xml2js=require('xml2js')
var Promise=require('bluebird')

exports.parseXMLAsync=function(xml){//导出parseXMLAsync
    return new Promise(function(resolve,reject){
        xml2js.parseString(xml,{trim:true},function(err,content){
            if(err) reject(err)
            else resolve(content)
        })
    })
}

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

// exports.formatMessage=function(xml){//导出
//     return new Promise(function(resolve,reject){
//         xml2js.parseString(xml,{trim:true},function(err,content){
//             if(err) reject(err)
//             else resolve(content)
//         })
//     })
// }

exports.formatMessage=formatMessage //把 message 对象进一步格式化出来
