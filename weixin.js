'use strict'

var config=require('./config')
var Wechat=require('./wechat/wechat')
var wechatApi=new Wechat(config.wechat)//初始化wechatApi

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
        else if(content==='8'){//图片上传
            var data=yield wechatApi.uploadMaterial('image',__dirname+'/2.jpg')

            reply={
                type:'image',
                mediaId:data.media_id
            }
        }
        else if(content==='9'){//视频上传
            var data=yield wechatApi.uploadMaterial('video',__dirname+'/6.mp4')

            reply={
                type:'video',
                title:'视频',
                description:'看看',
                mediaId:data.media_id
            }
        }
        else if(content==='10'){//音乐上传
            var data=yield wechatApi.uploadMaterial('image',__dirname+'/2.jpg')

            reply={
                type:'music',
                title:'音乐',
                description:'放松一下',
                musicUrl:'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3',
                thumbMediaId:data.media_id
            }
        }
        //永久素材上传
        else if(content==='11'){//图片上传
            var data=yield wechatApi.uploadMaterial('image',__dirname+
                '/2.jpg',{type:'image'})

            reply={
                type:'image',
                mediaId:data.media_id
            }
        }
        else if(content==='12'){//视频上传
            var data=yield wechatApi.uploadMaterial('image',
                __dirname+ '/6.mp4',{type:'video',
                    description: '{"title":"Really a nice place","introduction":"Never think it so easy"}'})
            console.log(data);

            reply={
                type:'video',
                title:'视频',
                description:'看看',
                mediaId:data.media_id
            }
        }
        else if(content==='13'){
            var picData=yield wechatApi.uploadMaterial('image',
                __dirname+ '/2.jpg',{})

            var media={
                articles:[{
                    title:'起风了',
                    thumb_media_id:picData.media_id,
                    author:'yang',
                    digest:'摘要',
                    show_cover_pic:1, //显示封面图
                    content:'内容',
                    content_source_url:'https://github.com'
                },{
                    title:'秋季',
                    thumb_media_id:picData.media_id,
                    author:'yang',
                    digest:'摘要',
                    show_cover_pic:1, //显示封面图
                    content:'内容',
                    content_source_url:'https://github.com'
                }]
            }

            data=yield wechatApi.uploadMaterial('news',media,{})//更新永久素材
            data=yield wechatApi.fetchMaterial(data.media_id,'news',{})//获取永久素材
            console.log(data);

            var items=data.news_item
            var news=[]

            items.forEach(function(item){
                news.push({
                    title:item.title,
                    description:item.digest,
                    picUrl:picData.url,
                    url:item.url
                })
            })

            reply=news
        }
        else if(content==='14'){
            var counts=yield wechatApi.countMaterial()

            console.log(JSON.stringify(counts));

            var results=yield [
                wechatApi.batchMaterial({
                    type:'image',
                    offset:0,
                    count:10
                }),
                wechatApi.batchMaterial({
                    type:'video',
                    offset:0,
                    count:10
                }),
                wechatApi.batchMaterial({
                    type:'voice',
                    offset:0,
                    count:10
                }),
                wechatApi.batchMaterial({
                    type:'news',
                    offset:0,
                    count:10
                })
            ]
            // console.log(JSON.stringify(results))

            reply='大锅乱炖'

        }
        //用户分组测试
        else if(content==='15'){
            //创建分组
            var group=yield wechatApi.createGroup('wechat7')

            console.log('新分组 wechat7');
            console.log(group);

            var groups=yield wechatApi.fetchGroups()//查询分组

            console.log('加了 wechat 后的分组列表');
            console.log(groups);

            var group2=yield wechatApi.checkGroup(message.FromUserName)

            console.log('查看自己的分组');
            console.log(group2);

            //移动分组
            var result=yield wechatApi.moveGroup(message.FromUserName,101)

            console.log('移动到 101');
            console.log(result);

            var group3=yield wechatApi.fetchGroups()

            console.log('移动后的分组列表');
            console.log(group3);

            //批量移动
            var result2=yield wechatApi.moveGroup([message.FromUserName],100)

            console.log('批量移动到 100');
            console.log(result2);

            var group4=yield wechatApi.fetchGroups()

            console.log('批量移动后的分组列表');
            console.log(group4);

            var result3=yield wechatApi.updateGroup(102,'wechat102')

            console.log('102 wechat2 改名 wechat102');
            console.log(result3);

            var group5=yield wechatApi.fetchGroups()

            console.log('改名后的分组列表');
            console.log(group5);

            var result4=yield wechatApi.deleteGroup(103)

            console.log('删除 103 08 分组');
            console.log(result4);

            var group6=yield wechatApi.fetchGroups()

            console.log('删除103后的分组列表');
            console.log(group6);

            reply='Group done!'
        }


        this.body=reply
    }

    yield next
}
