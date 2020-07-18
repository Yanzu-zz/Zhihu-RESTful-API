const Topic = require('../models/topics')
const User = require('../models/users')

class TopicsCtl {
  // 获取所有话题列表
  async find(ctx) {
    const {
      per_page = 10
    } = ctx.query
    // 当前页数
    const page = Math.max(ctx.query.page * 1, 1) - 1
    // 每页显示多少条数据，也防止坏用户填写非法条数，如0，-1，-1288 等
    const perPage = Math.max(per_page * 1, 1)

    // 利用 MongoDB 的语法 .limit和.skip() 巧妙地进行分页
    // .limit(n) 一次只返回 n 条数据， .skip(m) 跳过前 m 条数据，返回第 m+1 条数据
    ctx.body = await Topic
      .find({
        name: new RegExp(ctx.query.q) // 一句话实现模糊搜索
      })
      .limit(perPage)
      .skip(page * perPage)
  }

  // 检查某个话题是否存在 中间件
  async checkTopicExist(ctx, next) {
    // 其实就是请求一下数据库看看关注 or 取关的话题存不存在，不存在报错
    const topic = await Topic.findById(ctx.params.id)

    if (!topic) {
      ctx.throw(404, '话题不存在')
    }

    await next()
  }

  // 获取特定的话题（根据 ID）
  async findById(ctx) {
    const {
      fields = ''
    } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const topic = await Topic.findById(ctx.params.id).select(selectFields)

    ctx.body = topic
  }

  // 创建话题
  async create(ctx) {
    ctx.verifyParams({
      name: {
        type: 'string',
        required: true
      },
      avatar_url: {
        type: 'string',
        required: false
      },
      introduction: {
        type: 'string',
        required: false
      }
    })

    const topic = await new Topic(ctx.request.body).save()
    ctx.body = topic
  }

  async update(ctx) {
    ctx.verifyParams({
      name: {
        type: 'string',
        required: false
      },
      avatar_url: {
        type: 'string',
        required: false
      },
      introduction: {
        type: 'string',
        required: false
      }
    })

    const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    ctx.body = topic
  }

  // 获取某个话题的关注者列表（注意，关注者可能有百万上千万）
  async listTopicFollowers(ctx) {
    const {
      per_page = 10
    } = ctx.query
    // 当前页数
    const page = Math.max(ctx.query.page * 1, 1) - 1
    // 每页显示多少条数据，也防止坏用户填写非法条数，如0，-1，-1288 等
    const perPage = Math.max(per_page * 1, 1)

    // 我们找的是关注该话题的 “用户”，所以要调用存放用户数据的数据库 User
    const users = await User
      .find({
        followingTopics: ctx.params.id,
        name: new RegExp(ctx.query.q)
      })
      .limit(perPage)
      .skip(page * perPage)

    ctx.body = users
  }
}

module.exports = new TopicsCtl()