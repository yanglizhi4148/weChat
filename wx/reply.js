'use strict'

var Movie = require('../app/api/movie')
var convert = require('koa-convert')
var config = require('../config/app')
var help = `欢迎关注科幻电影世界
    回复 1~6，测试文字回复
    回复 7，测试图文回复
    回复 首页，进入电影首页
    回复 电影名字，查询电影信息
    回复 语音，查询电影信息
    也可以点击 <a href="${config.app.host}/wechat/movie">语音查电影</a>`

exports.reply = function*(next) {
    var message = this.weixin

    //判断消息类型
    if (message.MsgType === 'event') {//事件推送
        if (message.Event === 'subscribe') {//订阅事件
            this.body = help
        } else if (message.Event === 'unsubscribe') {//取消订阅
            console.log('无情取关');
            this.body = ''
        } else if (message.Event === 'LOCATION') {//上报地理位置
            this.body = '您上报的位置是：' + message.Latitude + '/' + message.Longitude + '-' +
                message.Precision
        } else if (message.Event === 'CLICK') {//点击事件
            var news = []

            if (message.EventKey === 'movie_hot') {
                let movies = yield Movie.findHotMovies(-1, 5)

                movies.forEach(function (movie) {
                    news.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: config.app.host + '/wechat/jump/' + movie._id
                    })
                })
            }
            else if (message.EventKey === 'movie_cold') {
                let movies = yield Movie.findHotMovies(1, 5)

                movies.forEach(function (movie) {
                    news.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: config.app.host + '/wechat/jump/' + movie._id
                    })
                })
            }
            else if (message.EventKey === 'movie_crime') {
                let cat = yield Movie.findMoviesByCate('犯罪')
                cat.movies.forEach(function (movie) {
                    news.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: config.app.host + '/wechat/jump/' + movie._id
                    })
                    news = news.slice(0, 5)
                })
            } else if (message.EventKey === 'movie_cartoon') {
                let cat = yield Movie.findMoviesByCate('动画')
                cat.movies.forEach(function (movie) {
                    news.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: config.app.host + '/wechat/jump/' + movie._id
                    })
                })
                news = news.slice(0, 5)
            } else if (message.EventKey === 'help') {
                news = help
            }

            this.body = news
        }
    }
    //语音搜索电影
    else if (message.MsgType === 'voice') {
        var voiceText = message.Recognition //语音翻译后的文本
        var movies = yield Movie.searchByName(voiceText)

        if (!movies || movies.length === 0) {
            movies = yield Movie.searchByDouban(voiceText)
        }


        if (movies && movies.length > 0) {//有数据
            reply = []

            movies = movies.slice(0, 5)

            movies.forEach(function (movie) {
                reply.push({
                    title: movie.title,
                    description: movie.title,
                    picUrl: movie.poster,
                    url: config.app.host + '/wechat/jump/' + movie._id
                })
            })
        } else {//没有数据
            reply = '没有查询到与' + voiceText + '匹配到的电影：要不要换一个名字试试'
        }

        this.body = reply
    } else if (message.MsgType === 'text') {
        var content = message.Content
        var reply = '额，你说的' + message.Content + '太复杂了'

        //判断用户输入的内容
        if (content === '1') {
            reply = '天王盖地虎'
        }
        else if (content === '2') {
            reply = '宝塔镇河妖'
        }
        else if (content === '3') {
            reply = '小鸡炖蘑菇'
        }
        else if (content === '4') {
            reply = '你敢回复5吗'
        }
        else if (content === '5') {
            reply = '你是不是傻'
        }
        else if (content === '6') {
            reply = '你的良心不会痛吗'
        }
        else if (content === '7') {//回复图文需要数组
            reply = [{
                title: '唯美小清新',
                description: '只有心灵才能洞察一切，最重要的东西，用眼睛是看不见的',
                picUrl: 'http://pic.qqtn.com/up/2016-1/2016010609094954155.jpg',
                url: 'https://github.com/'
            }, {
                title: '平平淡淡才是真',
                description: '淡雅朴实的生活方式',
                picUrl: 'http://pic.qqtn.com/up/2016-1/2016010609094866462.jpg',
                url: 'https://nodejs.org/'
            }]
        }
        else {//文本搜索电影
            var movies = yield Movie.searchByName(content)

            if (!movies || movies.length === 0) {//数组不存在或数组长度为0
                movies = yield Movie.searchByDouban(content)//用豆瓣查找
            }

            if (movies && movies.length > 0) {//有数据
                reply = []

                movies = movies.slice(0, 5)//5条电影列表

                movies.forEach(function (movie) {
                    reply.push({
                        title: movie.title,
                        description: movie.title,
                        picUrl: movie.poster,
                        url: config.app.host + '/wechat/jump/' + movie._id
                    })
                })
            } else {//没有数据
                reply = '没有查询到与' + content + '匹配到的电影：要不要换一个名字试试'
            }
        }

        this.body = reply
    }

    yield next
}
