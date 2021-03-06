## Introduction
1. 该项目是一个关于电影的微信公众号，项目由微信公众号与仿豆瓣电影网站两部分整合而成；
2. 电影公众号可以实现自动回复功能、语音及文本搜索电影、电影分类、电影详情及电影的评论；
3. 电影网站可以实现登录注册功能，电影的分类、电影详情、电影查询以及电影评论；
4. 项目基于Node.js的Koa1框架以及微信JS-SDK进行电影公众号开发，使用MongoDB进行数据存储，运用jade模板引擎完成页面创建渲染。

## Requirement
1. Node.js>=7.0
2. MongoDB

## Installation
1. `git clone https://github.com/yanglizhi4148/weChat`
2. `cd weChat`
3. `npm install`
4. 把config/app.default.js拷贝为config/app.js，把config/db.default.js拷贝为config/db.js，并在里面配置微信appID、appSecret、token、host
5. `node test.js`
6. 在微信公众平台上面配置服务器
7. 配置成功之后就可以`npm start`

## License
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, Lizhi.Yang
