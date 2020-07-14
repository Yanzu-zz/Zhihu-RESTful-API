const Router = require('koa-router')
const {
  index
} = require('../controllers/home')

const router = new Router()

// router.get('/', (ctx) => {
//   ctx.body = "<h1>这是主页</h1>"
// })

// 分离了控制器之后就不用再这里写回调了
router.get('/', index)

module.exports = router