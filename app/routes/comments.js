const jwt = require('koa-jwt')
const Router = require('koa-router')
const {
  find,
  findById,
  create,
  update,
  delete: del,
  checkCommentator,
  checkCommentExist
} = require('../controllers/comments')
const {
  secret
} = require('../config')

const router = new Router({
  prefix: '/questions/:questionId/answers/:answerId/comments'
})

// 用别人写好的轮子一句话搞定
const auth = jwt({
  secret
})

router.get('/', find)

router.get('/:id', checkCommentExist, findById)

router.post('/', auth, create)

router.patch('/:id', auth, checkCommentExist, checkCommentator, update)

router.delete('/:id', auth, checkCommentExist, checkCommentator, del)

module.exports = router