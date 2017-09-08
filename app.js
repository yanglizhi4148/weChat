'use strict'

var Koa=require('koa')
var fs=require('fs')
var path=require('path')
var mongoose=require('mongoose')
// var wechat=require('./wechat/g')
// var reply=require('./wx/reply')
var dbUrl='mongodb://127.0.0.1:27017/test'

mongoose.connect(dbUrl,{useMongoClient: true});

//models loading
var models_path=__dirname+'/app/models'
var walk=function(path){
    fs
        .readdirSync(path)
        .forEach(function(file){
            var newPath=path+'/'+file
            var stat=fs.statSync(newPath)

            if(stat.isFile()){
                if(/(.*)\.(js|coffee)/.test(file)){
                    require(newPath)
                }
            }
            else if(stat.isDirectory()){
                walk(newPath)
            }
        })
}
walk(models_path)

var menu=require('./wx/menu')
var wx=require('./wx/index')
var wechatApi=wx.getWechat()

wechatApi.deleteMenu().then(function(){
    return wechatApi.createMenu(menu)
})
    .then(function(msg){
        console.log(msg);
    })

var app=new Koa()
var Router=require('koa-router')
var router=new Router()
var game=require('./app/controllers/game')
var wechat=require('./app/controllers/wechat')

var views=require('koa-views')

app.use(views(__dirname+'/app/views',{
    extension:'jade'
}))

router.get('/movie',game.guess)
router.get('/movie/:id',game.find)
router.get('/wx',wechat.hear)
router.post('/wx',wechat.hear)

app.use(router.routes())
    .use(router.allowedMethods())

// app.use(wechat(wx.wechatOptions.wechat,reply.reply))

app.listen(1234)
console.log('Listening:1234');









