'use strict'

exports.reply=function*(next){
    var message=this.weixin

    //判断消息类型
    if(message.MsgType==='event'){//事件推送
        if(message.Event==='subscribe'){//订阅事件
            if(message.EventKey){//生成的值是二维码参数值
                console.log('扫二维码进来:'+message.EventKey+' '+message.ticket)//ticket可以获取二维码图片
            }
            this.body='哈哈，你订阅了这个号'//回复订阅内容
        }
        else if(message.Event==='unsubscribe'){//取消订阅
            console.log('无情取关');
            this.body=''
        }
        else if(message.Event==='LOCATION'){//上报地理位置
            this.body='您上报的位置是：'+message.Latitude+'/'+message.Longitude+'-'+
                message.Precision
        }
        else if(message.Event==='click'){//点击事件
            this.body='您点击了菜单：'+message.EventKey
        }
        else if(message.Event==='SCAN'){//扫描事件
            console.log('关注后扫二维码'+message.EventKey+' '+message.Ticket);
            this.body='看到你扫了一下'
        }
        else if(message.Evnt==='VIEW'){
            this.body='您点击了菜单中的链接：'+message.EventKey//EventKey就是菜单URL地址
        }
    }
    else if(message.MsgType==='text'){
        var content=message.Content
        var reply='额，你说的'+message.Content+'太复杂了'

        //判断用户输入的内容
        if(content==='1'){
            reply='天王盖地虎'
        }
        else if(content==='2'){
            reply='宝塔镇河妖'
        }
        else if(content==='3'){
            reply='小鸡炖蘑菇'
        }
        else if(content==='4'){
            reply='你敢回复5吗'
        }
        else if(content==='5'){
            reply='你是不是傻'
        }
        else if(content==='6'){
            reply='你的良心不会痛吗'
        }
        else if(content==='7'){//回复图文需要数组
            reply=[{
                title:'唯美小清新',
                description:'只有心灵才能洞察一切，最重要的东西，用眼睛是看不见的',
                picUrl:'http://pic.qqtn.com/up/2016-1/2016010609094954155.jpg',
                url:'https://github.com/'
            },{
                title:'平平淡淡才是真',
                description:'淡雅朴实的生活方式',
                picUrl:'http://pic.qqtn.com/up/2016-1/2016010609094866462.jpg',
                url:'https://nodejs.org/'
            }]
        }
        this.body=reply
    }

    yield next
}
