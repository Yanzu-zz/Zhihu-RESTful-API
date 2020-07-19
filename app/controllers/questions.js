const Question = require('../models/questions')

class QuestionsCtl {
  // 获取所有问题列表
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
    ctx.body = await Question
      .find({
        $or: [{
          title: q
        }, {
          description: q
        }]
      })
      .limit(perPage)
      .skip(page * perPage)
  }

  // 检查某个问题是否存在 中间件
  async checkQuestionExist(ctx, next) {
    // 其实就是请求一下数据库看看关注 or 取关的问题存不存在，不存在报错
    const question = await Question.findById(ctx.params.id).select('+questioner')

    if (!question) {
      ctx.throw(404, '问题不存在')
    }

    // 存在 ctx.state 里，这样下面需要根据id查询数据库就省时间了
    ctx.state.question = question

    await next()
  }

  // 获取特定的问题（根据 ID）
  async findById(ctx) {
    const {
      fields = ''
    } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const question = await Question
      .findById(ctx.params.id)
      .select(selectFields)
      .populate('questioner topics')

    ctx.body = question
  }

  // 创建问题
  async create(ctx) {
    ctx.verifyParams({
      title: {
        type: 'string',
        required: true
      },
      description: {
        type: 'string',
        required: false
      }
    })

    const question = await new Question({
      ...ctx.request.body,
      questioner: ctx.state.user._id
    }).save()

    ctx.body = question
  }

  async checkQuestioner(ctx, next) {
    const {
      question
    } = ctx.state

    if (question.questioner.toString() !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }

    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      title: {
        type: 'string',
        required: false
      },
      description: {
        type: 'string',
        required: false
      }
    })

    // const question = await Question.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    await ctx.state.question.update(ctx.request.body)
    ctx.body = ctx.state.question
  }

  async delete(ctx) {
    const question = await Question.findByIdAndRemove(ctx.params.id)

    ctx.body = question
    ctx.status = 204
  }
}

module.exports = new QuestionsCtl()