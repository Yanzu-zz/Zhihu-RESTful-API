const jwt = require('koa-jwt')
const Router = require('koa-router')
const {
  find,
  findById,
  create,
  update,
  delete: del, // delete 是关键字，所以我们给他取个别名
  login,
  checkOwner // 授权中间件
} = require('../controllers/users')
const {
  secret
} = require('../config')

const router = new Router({
  prefix: '/users'
})

/**
 * 认证中间件
 * 但还是那句话，自己就不要重复造轮子了，用优秀社区的
const auth = async (ctx, next) => {
  const {
    authorization = ''
  } = ctx.request.header

  // 每次请求前获取 token 验证权限
  const token = authorization.replace('Bearer ', '')
  try {
    const user = jsonwebtoken.verify(token, secret)
    // 放到 ctx 上下文中，方便下面的方法查询 user 信息
    ctx.state.user = user
  } catch (err) {
    ctx.throw(401, err.message)
  }

  await next()
}
 */

 // 用别人写好的轮子一句话搞定
const auth = jwt({
  secret
})

router.get('/', find)

router.get('/:id', findById)

router.post('/', create)

// 记住先认证再授权，否则逻辑就乱了
router.patch('/:id', auth, checkOwner, update)

router.delete('/:id', auth, checkOwner, del)

router.post('/login', login)

module.exports = router