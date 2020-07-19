const jwt = require('koa-jwt')
const Router = require('koa-router')
const {
  find,
  findById,
  create,
  update,
  delete: del,
  checkQuestioner,
  checkQuestionExist
} = require('../controllers/questions')
const {
  secret
} = require('../config')

const router = new Router({
  prefix: '/questions'
})

// 用别人写好的轮子一句话搞定
const auth = jwt({
  secret
})

router.get('/', find)

router.get('/:id', checkQuestionExist, findById)

// 创建和修改话题都需要登录，所以用 认证中间件 来判断下
router.post('/', auth, create)

router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)

router.delete('/:id', auth, checkQuestionExist, checkQuestioner, del)

module.exports = router