const jwt = require('koa-jwt')
const Router = require('koa-router')
const {
  find,
  findById,
  create,
  update,
  delete: del,
  checkAnswerer,
  checkAnswerExist
} = require('../controllers/answers')
const {
  secret
} = require('../config')

const router = new Router({
  prefix: '/questions/:questionId/answers'
})

// 用别人写好的轮子一句话搞定
const auth = jwt({
  secret
})

router.get('/', find)

router.get('/:id', checkAnswerExist, findById)

router.post('/', auth, create)

router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)

router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del)

module.exports = router