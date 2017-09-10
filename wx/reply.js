'use strict'

// var path=require('path')
// var wx=require('../wx/index')
var Movie=require('../app/api/movie')
// var wechatApi=wx.getWechat()
var help='欢迎关注科幻电影世界\n'+
    '回复 1~6，测试文字回复\n'+
    '回复 7，测试图文回复\n'+
    '回复 首页，进入电影首页\n'+
    '回复 电影名字，查询电影信息\n'+
    '回复 语音，查询电影信息\n'+
    '也可以点击 <a href="http://116.196.67.60/movie">语音查电影</a>'

exports.reply=function*(next){
    var message=this.weixin

    //判断消息类型
    if(message.MsgType==='event'){//事件推送
        if(message.Event==='subscribe'){//订阅事件
            this.body=help
        }
        else if(message.Event==='unsubscribe'){//取消订阅
            console.log('无情取关');
            this.body=''
        }
        else if(message.Event==='LOCATION'){//上报地理位置
            this.body='您上报的位置是：'+message.Latitude+'/'+message.Longitude+'-'+
                message.Precision
        }
        else if(message.Event==='CLICK'){//点击事件
            var news=[]

            if(message.EventKey==='movie_hot'){
                let movies=yield Movie.findHotMovies(-1,10)

                movies.forEach(function(movie){
                    news.push({
                        title:movie.title,
                        description:movie.title,
                        picUrl:movie.poster,
                        url:'http://116.196.67.60/wechat/jump/'+movie._id
                    })
                })
            }
            else if(message.EventKey==='movie_cold'){
                let movies=yield Movie.findHotMovies(1,10)

                movies.forEach(function(movie){
                    news.push({
                        title:movie.title,
                        description:movie.title,
                        picUrl:movie.poster,
                        url:'http://116.196.67.60/wechat/jump/'+movie._id
                    })
                })
            }
            else if(message.EventKey==='movie_crime'){
                let cat=yield Movie.findMoviesByCate('犯罪')
                cat.movies.forEach(function(movie) {
                    news.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: 'http://116.196.67.60/wechat/jump/' + movie._id
                    })
                })
            }
            else if(message.EventKey==='movie_cartoon'){
                let cat=yield Movie.findMoviesByCate('动画')
                cat.movies.forEach(function(movie) {
                    news.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: 'http://116.196.67.60/wechat/jump/' + movie._id
                    })
                })
            }
            else if(message.EventKey==='help'){
                news=help
            }

            this.body=news
        }
    }
    else if(message.MsgType==='voice'){
        var voiceText=message.Recognition

        var movies=yield Movie.searchByName(voiceText)

        if(!movies || movies.length === 0){
            movies=yield Movie.searchByDouban(voiceText)
        }

        if(movies && movies.length > 0){//有数据
            reply=[]

            movies=movies.slice(0,10)

            movies.forEach(function(movie){
                reply.push({
                    title:movie.title,
                    description:movie.title,
                    picUrl:movie.poster,
                    url:'http://116.196.67.60/wechat/jump/'+movie._id
                })
            })
        }else{//没有数据
            reply='没有查询到与'+content+'匹配到的电影：要不要换一个名字试试'
        }

        this.body=reply
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
        // else if(content==='8'){//图片上传
        //     var data=yield wechatApi.uploadMaterial('image',path.join(__dirname,'../2.jpg'))
        //
        //     reply={
        //         type:'image',
        //         mediaId:data.media_id
        //     }
        // }
        // else if(content==='9'){//视频上传
        //     var data=yield wechatApi.uploadMaterial('video',path.join(__dirname,'../6.mp4'))
        //
        //     reply={
        //         type:'video',
        //         title:'视频',
        //         description:'看看',
        //         mediaId:data.media_id
        //     }
        // }
        // else if(content==='10'){//音乐上传
        //     var data=yield wechatApi.uploadMaterial('image',path.join(__dirname,'../2.jpg'))
        //
        //     reply={
        //         type:'music',
        //         title:'音乐',
        //         description:'放松一下',
        //         musicUrl:'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3',
        //         thumbMediaId:data.media_id
        //     }
        // }
        // //永久素材上传
        // else if(content==='11'){//图片上传
        //     var data=yield wechatApi.uploadMaterial('image',path.join(__dirname,
        //         '../2.jpg'),{type:'image'})
        //
        //     reply={
        //         type:'image',
        //         mediaId:data.media_id
        //     }
        // }
        // else if(content==='12'){//视频上传
        //     var data=yield wechatApi.uploadMaterial('image',
        //         path.join(__dirname, '../6.mp4'),{type:'video',
        //             description: '{"title":"Really a nice place","introduction":"Never think it so easy"}'})
        //     console.log(data);
        //
        //     reply={
        //         type:'video',
        //         title:'视频',
        //         description:'看看',
        //         mediaId:data.media_id
        //     }
        // }
        // else if(content==='13'){
        //     var picData=yield wechatApi.uploadMaterial('image',
        //         path.join(__dirname, '../2.jpg'),{})
        //
        //     var media={
        //         articles:[{
        //             title:'起风了',
        //             thumb_media_id:picData.media_id,
        //             author:'yang',
        //             digest:'摘要',
        //             show_cover_pic:1, //显示封面图
        //             content:'内容',
        //             content_source_url:'https://github.com'
        //         },{
        //             title:'秋季',
        //             thumb_media_id:picData.media_id,
        //             author:'yang',
        //             digest:'摘要',
        //             show_cover_pic:1, //显示封面图
        //             content:'内容',
        //             content_source_url:'https://github.com'
        //         }]
        //     }
        //
        //     data=yield wechatApi.uploadMaterial('news',media,{})//更新永久素材
        //     data=yield wechatApi.fetchMaterial(data.media_id,'news',{})//获取永久素材
        //     console.log(data);
        //
        //     var items=data.news_item
        //     var news=[]
        //
        //     items.forEach(function(item){
        //         news.push({
        //             title:item.title,
        //             description:item.digest,
        //             picUrl:picData.url,
        //             url:item.url
        //         })
        //     })
        //
        //     reply=news
        // }
        // else if(content==='14'){
        //     var counts=yield wechatApi.countMaterial()
        //
        //     console.log(JSON.stringify(counts));
        //
        //     var results=yield [
        //         wechatApi.batchMaterial({
        //             type:'image',
        //             offset:0,
        //             count:10
        //         }),
        //         wechatApi.batchMaterial({
        //             type:'video',
        //             offset:0,
        //             count:10
        //         }),
        //         wechatApi.batchMaterial({
        //             type:'voice',
        //             offset:0,
        //             count:10
        //         }),
        //         wechatApi.batchMaterial({
        //             type:'news',
        //             offset:0,
        //             count:10
        //         })
        //     ]
        //     // console.log(JSON.stringify(results))
        //
        //     console.log(JSON.stringify(results));
        //     reply='大锅乱炖'
        //
        // }
        // //用户分组测试
        // else if(content==='15'){
        //     //创建分组
        //     var group=yield wechatApi.createGroup('wechat7')
        //
        //     console.log('新分组 wechat7');
        //     console.log(group);
        //
        //     var groups=yield wechatApi.fetchGroups()//查询分组
        //
        //     console.log('加了 wechat 后的分组列表');
        //     console.log(groups);
        //
        //     var group2=yield wechatApi.checkGroup(message.FromUserName)
        //
        //     console.log('查看自己的分组');
        //     console.log(group2);
        //
        //     //移动分组
        //     var result=yield wechatApi.moveGroup(message.FromUserName,101)
        //
        //     console.log('移动到 101');
        //     console.log(result);
        //
        //     var group3=yield wechatApi.fetchGroups()
        //
        //     console.log('移动后的分组列表');
        //     console.log(group3);
        //
        //     //批量移动
        //     var result2=yield wechatApi.moveGroup([message.FromUserName],100)
        //
        //     console.log('批量移动到 100');
        //     console.log(result2);
        //
        //     var group4=yield wechatApi.fetchGroups()
        //
        //     console.log('批量移动后的分组列表');
        //     console.log(group4);
        //
        //     var result3=yield wechatApi.updateGroup(102,'wechat102')
        //
        //     console.log('102 wechat2 改名 wechat102');
        //     console.log(result3);
        //
        //     var group5=yield wechatApi.fetchGroups()
        //
        //     console.log('改名后的分组列表');
        //     console.log(group5);
        //
        //     var result4=yield wechatApi.deleteGroup(103)
        //
        //     console.log('删除 103 08 分组');
        //     console.log(result4);
        //
        //     var group6=yield wechatApi.fetchGroups()
        //
        //     console.log('删除103后的分组列表');
        //     console.log(group6);
        //
        //     reply='Group done!'
        // }
        // else if(content==='16'){//获取用户信息
        //     var user=yield wechatApi.fetchUsers(message.FromUserName,'en')
        //
        //     console.log(user);
        //
        //     //批量获取
        //     var openIds=[
        //         {
        //             openid:message.FromUserName,
        //             lang:'en'
        //         }
        //     ]
        //     var users=wechatApi.fetchUsers(openIds)
        //
        //     console.log(users);
        //
        //     reply=JSON.stringify(user)
        // }
        // else if(content==='17'){//获取用户列表
        //     var userlist=yield wechatApi.listUsers()
        //
        //     console.log(userlist);
        //
        //     reply=userlist.total
        // }
        // else if(content==='18'){//分组群发消息
        //     var mpnews={
        //         media_id:'XwzAGp1UCtlgpvG-IfIZMtf4uVkDrxP-eEKn4LfRgzw'
        //     }
        //
        //     var text={
        //         'content':'Hello Wechat'
        //     }
        //     var msgData=yield wechatApi.sendByGroup('text',text,0)
        //
        //     console.log(msgData);
        //     reply='Yeah!'
        // }
        // else if(content==='19'){//预览群发消息
        //     var mpnews={
        //         media_id:'XwzAGp1UCtlgpvG-IfIZMtf4uVkDrxP-eEKn4LfRgzw'
        //     }
        //
        //     // var text={
        //     //     'content':'Hello Wechat'
        //     // }
        //     var msgData=yield wechatApi.previewMass('mpnews',mpnews,'o8usp0XzbvhFFG36Q-rtcKL_3Buo')
        //
        //     console.log(msgData);
        //     reply='Yeah!'
        // }
        // else if(content==='20'){//查询群发消息发送状态
        //     var msgData=yield wechatApi.checkMass('1000000002')
        //
        //     console.log(msgData);
        //     reply='OK, success!'
        // }
        // else if(content==='21'){//二维码测试
        //     var tempQr={//临时型
        //         expires_seconds:400000,//过期时间
        //         action_name:'QR_SCENE',
        //         action_info:{
        //             scene:{
        //                 scene_id:123
        //             }
        //         }
        //     }
        //     var permQr={//永久 整型
        //         action_name:'QR_LIMIT_SCENE',
        //         action_info:{
        //             scene:{
        //                 scene_id:123
        //             }
        //         }
        //     }
        //     var permStrQr={//永久 字符串
        //         action_name:'QR_LIMIT_STR_SCENE',
        //         action_info:{
        //             scene:{
        //                 scene_str:'abc'
        //             }
        //         }
        //     }
        //     var qr1=yield wechatApi.createQrcode(tempQr)
        //     var qr2=yield wechatApi.createQrcode(permQr)
        //     var qr3=yield wechatApi.createQrcode(permStrQr)
        //
        //     reply='OK'
        // }
        // else if(content==='22'){//转链接
        //     var longUrl='http://www.imooc.com/'
        //
        //     var shortData=yield wechatApi.createShorturl(null,longUrl)
        //
        //     reply=shortData.shortUrl
        // }
        // else if(content==='23'){//语义接口调用
        //     var semanticData={
        //         query:"寻龙诀",
        //         city:"杭州",
        //         category: "movie",
        //         uid:message.FromUserName
        //     }
        //
        //     var _semanticData=yield wechatApi.semantic(semanticData)
        //
        //     reply=JSON.stringify(_semanticData)
        // }
        else{
            var movies=yield Movie.searchByName(content)

            if(!movies || movies.length === 0){
                movies=yield Movie.searchByDouban(content)
            }

            if(movies && movies.length > 0){//有数据
                reply=[]

                movies=movies.slice(0,10)

                movies.forEach(function(movie){
                    reply.push({
                        title:movie.title,
                        description:movie.title,
                        picUrl:movie.poster,
                        url:'http://116.196.67.60/wechat/jump/'+movie._id
                    })
                })
            }else{//没有数据
                reply='没有查询到与'+content+'匹配到的电影：要不要换一个名字试试'
            }
        }

        this.body=reply
    }

    yield next
}
