const jwt = require('koa-jwt')
const Router = require('koa-router')
const {
  find,
  findById,
  create,
  update,
  checkTopicExist,
  listTopicFollowers
} = require('../controllers/topics')
const {
  secret
} = require('../config')

const router = new Router({
  prefix: '/topics'
})

// 用别人写好的轮子一句话搞定
const auth = jwt({
  secret
})

router.get('/', find)

router.get('/:id', checkTopicExist, findById)

// 创建和修改话题都需要登录，所以用 认证中间件 来判断下
router.post('/', auth, create)

router.patch('/:id', auth, checkTopicExist, update)

router.get('/:id/followers', checkTopicExist, listTopicFollowers)

module.exports = router