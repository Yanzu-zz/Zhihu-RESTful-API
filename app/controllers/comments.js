const Comment = require('../models/comments')

class CommentsCtl {
  // 获取所有评论列表
  async find(ctx) {
    const {
      per_page = 10
    } = ctx.query
    // 当前页数
    const page = Math.max(ctx.query.page * 1, 1) - 1
    // 每页显示多少条数据，也防止坏用户填写非法条数，如0，-1，-1288 等
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q) // 一句话实现模糊搜索
    // ctx.params 获取的是自己在 router 处定义的名字
    const {
      questionId,
      answerId
    } = ctx.params
    // ctx.query 获取的是 ?xxx=yyy 信息
    const {
      rootCommentId
    } = ctx.query

    // 利用 MongoDB 的语法 .limit和.skip() 巧妙地进行分页
    // .limit(n) 一次只返回 n 条数据， .skip(m) 跳过前 m 条数据，返回第 m+1 条数据
    ctx.body = await Comment
      .find({
        content: q,
        questionId,
        answerId,
        rootCommentId
      })
      .limit(perPage)
      .skip(page * perPage)
      .populate('commentator replyTo') // 评论都是显示用户的信息的
  }

  // 检查某个评论是否存在 中间件
  async checkCommentExist(ctx, next) {
    // 其实就是请求一下数据库看看关注 or 取关的评论存不存在，不存在报错
    const comment = await Comment.findById(ctx.params.id).select('+commentator')

    if (!comment) {
      ctx.throw(404, '评论不存在')
    }
    // 只有删改查评论时才检查次逻辑，赞和踩评论不检查
    if (ctx.params.questionId && comment.questionId !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有此评论')
    }
    if (ctx.params.answerId && comment.answerId !== ctx.params.answerId) {
      ctx.throw(404, '该答案下没有此评论')
    }

    // 存在 ctx.state 里，这样下面需要根据id查询数据库就省时间了
    ctx.state.comment = comment

    await next()
  }

  // 获取特定的评论（根据 ID）
  async findById(ctx) {
    const {
      fields = ''
    } = ctx.query
    const selectFields = fields
      .split(';')
      .filter(f => f)
      .map(f => ' +' + f)
      .join('')

    const comment = await Comment
      .findById(ctx.params.id)
      .select(selectFields)
      .populate('commentator')

    ctx.body = comment
  }

  // 创建评论
  async create(ctx) {
    ctx.verifyParams({
      content: {
        type: 'string',
        required: true
      },
      rootCommentId: {
        type: 'string',
        required: false
      },
      replyTo: {
        type: 'string',
        required: false
      }
    })

    const comment = await new Comment({
      ...ctx.request.body,
      commentator: ctx.state.user._id,
      questionId: ctx.params.questionId,
      answerId: ctx.params.answerId
    }).save()

    ctx.body = comment
  }

  async checkCommentator(ctx, next) {
    const {
      comment
    } = ctx.state

    if (comment.commentator.toString() !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }

    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      content: {
        type: 'string',
        required: false
      }
    })

    const {
      content
    } = ctx.request.body
    // 只允许用户修改评论的 content，不允许修改层级
    await ctx.state.comment.update(content)
    ctx.body = ctx.state.comment
  }

  async delete(ctx) {
    const comment = await Comment.findByIdAndRemove(ctx.params.id)

    ctx.body = comment
    ctx.status = 204
  }
}

module.exports = new CommentsCtl()