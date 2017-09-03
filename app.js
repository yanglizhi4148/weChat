'use strict'

var Koa=require('koa')
var path=require('path')
var wechat=require('./wechat/g')
var util=require('./libs/util')
var config=require('./config')
var reply=require('./wx/reply')
var Wechat=require('./wechat/wechat')
//定义一个文本文件
// var wechat_file=path.join(__dirname,'./config/wechat.txt')


var app=new Koa()


var ejs = require('ejs')
var crypto = require('crypto')
var heredoc = require('heredoc')

var tpl = heredoc(function(){/*
 <!DOCTYPE html>
 <html>
    <head>
        <title>搜电影</title>
        <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
    </head>
    <body>
        <h1>点击标题，开始录音翻译</h1>
        <p id="title"></p>
        <div id="director"></div>
        <div id="year"></div>
        <div id="poster"></div>
        <script src="http://zeptojs.com/zepto-docs.min.js"></script>
        <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
        <script>
            wx.config({
                debug: false,
                appId: 'wxf8dce3cefe4d1a73',
                timestamp: '<%= timestamp %>',
                nonceStr: '<%= noncestr %>',
                signature: '<%= signature %>',
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'previewImage',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'translateVoice'
                ]
            })

            wx.ready(function(){
                wx.checkJsApi({
                    jsApiList: ['onVoiceRecordEnd'],
                    success: function(res) {
                        console.log(res)
                    }
                })

                var shareContent={
                    title: '搜索',
                    desc: '搜出来了什么',
                    link: 'http://github.com',
                    imgUrl:'http://static.mukewang.com/static/img/common/logo.png',
                    success: function () {
                        window.alert('分享成功')
                    },
                    cancel: function () {
                        window.alert('分享失败')
                    }
                }
                wx.onMenuShareAppMessage(shareContent)

                var slides
                var isRecording=false

                $('#poster').on('tap',function(){
                    wx.previewImage(slides)
                })
                $('h1').on('tap',function(){
                    if(!isRecording){
                        isRecording=true
                        wx.startRecord({
                            cancel:function(){
                                window.alert('那就不搜了哦')
                            }
                        })
                    return
                    }
                    isRecording=false
                    wx.stopRecord({
                        success: function (res) {
                            var localId = res.localId

                            wx.translateVoice({
                                localId: localId,
                                isShowProgressTips: 1,
                                success: function (res) {
                                    var result=res.translateResult

                                    $.ajax({
                                        type:'get',
                                        url:'https://api.douban.com/v2/movie/search?q='+result,
                                        dataType:'jsonp',
                                        jsonp:'callback',
                                        success:function(data){
                                            var subject=data.subjects[0]

                                            $('#title').html(subject.title)
                                            $('#year').html(subject.year)
                                            $('#director').html(subject.directors[0].name)
                                            $('#poster').html('<img src=" ' + subject.images.large + ' ">')

                                            shareContent={
                                                title: subject.title,
                                                desc: '我搜出来了'+subject.title,
                                                link: 'http://github.com',
                                                imgUrl: subject.images.large,
                                                success: function () {
                                                    window.alert('分享成功')
                                                },
                                                cancel: function () {
                                                    window.alert('分享失败')
                                                }
                                            }

                                            slides={
                                                current:subject.images.large,
                                                urls:[subject.images.large]
                                            }

                                            data.subjects.forEach(function(item){
                                                 slides.urls.push(item.images.large)
                                            })

                                            wx.onMenuShareAppMessage(shareContent)
                                        }
                                    })
                                }
                            })
                         }
                     })
                })
            })
        </script>
    </body>
 </html>
 */})

var createNonce = function(){//生成随机字符串
    return Math.random().toString(36).substr(2,15)
}

var createTimestamp = function(){//生成随机时间戳
    return parseInt(new Date().getTime() / 1000, 10) + ''
}

var _sign = function(noncestr, ticket, timestamp, url){
    var params = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ]
    var str = params.sort().join('&')//排序
    var shasum = crypto.createHash('sha1')//加密

    shasum.update(str)

    return shasum.digest('hex')
}

function sign(ticket, url){//生成签名的方法
    var noncestr = createNonce()
    var timestamp = createTimestamp()
    var signature = _sign(noncestr, ticket, timestamp, url)

    // console.log(ticket);
    // console.log(url);
    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    }
}

app.use(function *(next){
    if (this.url.indexOf('/movie') > -1){
        var wechatApi = new Wechat(config.wechat)
        var data = yield wechatApi.fetchAccessToken()
        var access_token = data.access_token
        var ticketData = yield wechatApi.fetchTicket(access_token)
        var ticket = ticketData.ticket//拿到授权票据
        var url = this.href
        var params = sign(ticket,url)

        // console.log(ticketData);
        // console.log(ticket);
        // console.log(access_token);
        console.log(params);
        this.body = ejs.render(tpl,params)

        return next
    }

    yield next
})

// app.use(wechat(config.wechat))//把config方法传给wechat
app.use(wechat(config.wechat,reply.reply))

app.listen(1234)
console.log('Listening:1234');


//初始配置
// 'use strict'
// var Koa=require('koa')
// var sha1=require('sha1')
// var config={
//     wechat:{
//         appID:'wxf8dce3cefe4d1a73',
//         apSecret:'762169d8e70521f695228281b9cf266e',
//         token:'ylzwxkf4148',
//     }
// }
// var app=new Koa()
// app.use(function*(next){
//     console.log(this.query)
//     var token=config.wechat.token
//     var signature=this.query.signature
//     var nonce=this.query.nonce
//     var timestamp=this.query.timestamp
//     var echostr=this.query.echostr
//     var str=[token,timestamp,nonce].sort().join('')
//     var sha=sha1(str)
//
//     if(sha===signature){
//         this.body=echostr+''
//     }else{
//         this.body='wrong'
//     }
// })
//
// app.listen(1234)
// console.log('Listening:1234')






