const Answer = require('../models/answers')

class AnswersCtl {
  // 获取所有答案列表
  async find(ctx) {
    const {
      per_page = 10
    } = ctx.query
    // 当前页数
    const page = Math.max(ctx.query.page * 1, 1) - 1
    // 每页显示多少条数据，也防止坏用户填写非法条数，如0，-1，-1288 等
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q) // 一句话实现模糊搜索

    // 利用 MongoDB 的语法 .limit和.skip() 巧妙地进行分页
    // .limit(n) 一次只返回 n 条数据， .skip(m) 跳过前 m 条数据，返回第 m+1 条数据
    ctx.body = await Answer
      .find({
        content: q,
        questionId: ctx.params.questionId // 对应的wenti 必须精确匹配
      })
      .limit(perPage)
      .skip(page * perPage)
  }

  // 检查某个答案是否存在 中间件
  async checkAnswerExist(ctx, next) {
    // 其实就是请求一下数据库看看关注 or 取关的答案存不存在，不存在报错
    const answer = await Answer.findById(ctx.params.id).select('+answerer')

    if (!answer) {
      ctx.throw(404, '答案不存在')
    }
    if (answer.questionId !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有此答案')
    }

    // 存在 ctx.state 里，这样下面需要根据id查询数据库就省时间了
    ctx.state.answer = answer
    await next()
  }

  // 获取特定的答案（根据 ID）
  async findById(ctx) {
    const {
      fields = ''
    } = ctx.query
    const selectFields = fields.split(';')
      .filter(f => f)
      .map(f => ' +' + f)
      .join('')
    const answer = await Answer
      .findById(ctx.params.id)
      .select(selectFields)
      .populate('answerer')

    ctx.body = answer
  }

  // 创建答案
  async create(ctx) {
    ctx.verifyParams({
      content: {
        type: 'string',
        required: true
      }
    })
    
    const answer = await new Answer({
      ...ctx.request.body,
      answerer: ctx.state.user._id,
      questionId: ctx.params.questionId
    }).save()

    ctx.body = answer
  }

  async checkAnswerer(ctx, next) {
    const {
      answer
    } = ctx.state

    if (answer.answerer.toString() !== ctx.state.user._id) {
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

    // const answer = await Answer.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    await ctx.state.answer.update(ctx.request.body)
    ctx.body = ctx.state.answer
  }

  async delete(ctx) {
    const answer = await Answer.findByIdAndRemove(ctx.params.id)

    ctx.body = answer
    ctx.status = 204
  }
}

module.exports = new AnswersCtl()