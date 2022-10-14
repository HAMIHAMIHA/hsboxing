//1.导入express模块
const express = require('express')

const app = express()

// const cors = require('cors')
// app.use(cors())

var multer = require('multer'); //multer - node.js 中间件，用于处理 enctype="multipart/form-data"（设置表单的MIME编码）的表单数据。

app.use(multer({ dest: './public/' }).any()) // 通过配置multer的dest属性， 将文件储存在项目下的tmp文件中

//3.挂载具体路由
//配置解析表单数据中间件,只能解析application/x-www-form-urlencoded格式的表单数据
app.use(express.urlencoded({ extended: false }))
    //能解析json格式数据
app.use(express.json())


// // 中间件
// const mv = function(req, res, next) {
//     console.log("这是最简单的中间件,访问/test会输出两次")
//     next()
// };
// // 将mv注册为全局生效的中间件,use则为全局使用
// app.use(mv);
// // 中间件格式的简化
// app.use((req, res, next) => {
//     console.log('格式的简化_中间件1')
//     const time = Date.now()
//     req.startTime = time
//     next()
// });
// // 注册到路由里即局部使用
// app.get('/test', mv, (req, res) => {
//     res.send('test OK')
//     console.log(req.query.name, req.query.age)
// })


// app.use(express.json())

//将assets设置为静态资源, 命名跟require不一样
app.use(express.static('public'))

//引入路由组件,注册路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)

//错误级别中间件能够捕获错误,一定要在所有路由注册之后使用
app.use(function(err, req, res, next) {
    console.log("发生了错误" + err.message)
    res.send('Error' + err.message)
})



//调用app.listen方法,指定端口号并启动web服务器
app.listen(8081, function() {
    console.log('api server running at http://127.0.0.1:8081')
})