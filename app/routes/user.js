const jwt = require('koa-jwt')
const Router = require('koa-router')
const {
  find,
  findById,
  create,
  update,
  delete: del, // delete 是关键字，所以我们给他取个别名
  login,
  listFollowing,
  follow,
  unfollow,
  listFollowers,
  listFollowingTopics,
  followTopic,
  unfollowTopic,
  listQuestions,
  listlikingAnswers,
  likeAnswer,
  unlikeAnswer,
  listDislikingAnswers,
  dislikeAnswer,
  undislikeAnswer,
  listCollectingAnswers,
  collectAnswer,
  uncollectAnswer
} = require('../controllers/users')
const {
  secret
} = require('../config')

// 中间件
const {
  checkOwner,
  checkUserExist
} = require('../controllers/users')
const {
  checkTopicExist
} = require('../controllers/topics')
const {
  checkAnswerExist
} = require('../controllers/answers')

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

router.get('/:id/following', listFollowing)

router.get('/:id/followers', listFollowers)

router.put('/following/:id', auth, checkUserExist, follow)

router.delete('/following/:id', auth, checkUserExist, unfollow)

router.get('/:id/followingTopics', listFollowingTopics)

router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)

router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)

router.get('/:id/questions', listQuestions)

// 赞答案逻辑
router.get('/:id/likingAnswers', listlikingAnswers)
// undislikeAnswer 在 likeAnswer 后执行，就相当于 赞/踩 互斥了
router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer)
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer)

// 踩答案逻辑
router.get('/:id/dislikingAnswers', listDislikingAnswers)
router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer)
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer)

// 收藏答案逻辑
router.get('/:id/collectingAnswers', listCollectingAnswers)
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer)
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, uncollectAnswer)

module.exports = router