const Koa = require('koa')
const error = require('koa-json-error')
const bodyparser = require('koa-bodyparser') // 要安装这个中间件才能解析请求体
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const routing = require('./routes')

const app = new Koa()

// 连接 MongoDB
const {
  connectionStr
} = require('./config')

mongoose.connect(connectionStr, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}, () => {
  console.log('MongoDB 连接成功了')
})
mongoose.connection.on('error', console.error)


/**
 * 自己编写错误处理中间件，弥补 Koa 错误机制返回不是 JSON 格式的问题
 * 虽然代码看起来很少，但它能捕获全部我们主动抛出的错误
 * 即使自己写中间件很酷，但开发中重复造轮子是不可取的，所以我推荐用 koa-json-error 来作为我们的错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || err.statusCode || 500
    // 返回 JSON 格式
    ctx.body = {
      message: err.message
    }
  }
})
*/
app.use(error({
  postFormat: (e, {
    stack,
    ...rest
  }) => process.env.NODE_ENV === 'production' ? rest : {
    stack,
    ...rest
  }
}))
app.use(bodyparser())
// 用 koa-parameter 来校验参数
app.use(parameter(app))
// 批量读取路由文件并注册
routing(app)

const port = 3001
app.listen(port, () => {
  console.log(`程序启动在 ${port} 端口了`)
})