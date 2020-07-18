const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const {
  secret
} = require('../config')

class UsersCtl {
  // users 页面不像 home 只有一个函数，而是有多个
  // 那我们就按功能给函数起名就好了

  // 查询用户列表
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
    ctx.body = await User
      .find({
        name: new RegExp(ctx.query.q) // 一句话实现模糊搜索
      })
      .limit(perPage)
      .skip(page * perPage)
  }

  // 获取特定用户
  async findById(ctx) {
    // 获取 fields 参数，额外显示需要显示的字段内容（每个字段以 ; 号隔开）
    const {
      fields = ''
    } = ctx.query
    // 把传入的 field 参数处理成 MongoDB 需要的 select 格式（+[字段名]+[字段名2]+...）
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const populateStr = fields.split(';').filter(f => f).map(f => {
      if (f === 'employments') {
        return 'employments.company employments.job'
      }
      if (f === 'educations') {
        return 'educations.school educations.major'
      }
      return f
    }).join(' ')

    const user = await User
      .findById(ctx.params.id)
      .select(selectFields)
      .populate(populateStr)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }

  async create(ctx) {
    // 用官方写好的轮子校验就很方便了
    ctx.verifyParams({
      name: {
        type: 'string',
        required: true
      },
      password: {
        type: 'string',
        request: true
      }
    })

    const {
      name
    } = ctx.request.body

    const repetedUser = await User.findOne({
      name
    })
    if (repetedUser) {
      ctx.throw(409, "用户已存在")
    }

    // 新建一个用户结构然后 save() 方法保存到数据库里
    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }

  // 授权中间件，防止别的用户删除或修改了你的帐号
  // 该授权码中间件只有在涉及到自己操作自己 ID 的时候才会用上
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      name: {
        type: 'string',
        required: false
      },
      password: {
        type: 'string',
        required: false
      },
      avatar_url: {
        type: 'string',
        require: false
      },
      gender: {
        type: 'string',
        require: false
      },
      headline: {
        type: 'string',
        require: false
      },
      locations: {
        type: 'array',
        itemType: 'string',
        require: false
      },
      business: {
        type: 'string',
        require: false
      },
      employments: {
        type: 'array',
        itemType: 'object',
        require: false
      },
      educations: {
        type: 'array',
        itemType: 'object',
        require: false
      },
    })

    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if (!user) {
      ctx.throw(404)
    }
    ctx.body = user
  }

  async delete(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) {
      ctx.throw(404)
    }
    ctx.body = user
    ctx.status = 204
  }

  // 参照 Github 转移仓库的接口设计，post + 动词
  async login(ctx) {
    ctx.verifyParams({
      name: {
        type: 'string',
        required: true
      },
      password: {
        type: 'string',
        required: true
      }
    })

    const user = await User.findOne(ctx.request.body)
    if (!user) {
      ctx.throw(401, '用户名或密码不正确')
    }

    // 登录成功后就用 jsonwebtoken 生成一个 token
    const {
      _id,
      name
    } = user

    const token = jsonwebtoken.sign({
      _id,
      name
    }, secret, {
      // 设置过期时间 - 一天
      expiresIn: '1d'
    })

    ctx.body = {
      token
    }
  }

  // 获取某个用户的关注列表
  async listFollowing(ctx) {
    // 有了 ref 的帮助，用 .populate 函数就可以获取列表用户的具体信息了（根据id）
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if (!user) {
      ctx.throw(404, "用户不存在")
    }

    ctx.body = user.following
  }

  // 获取某个用户的粉丝列表（注意，粉丝可能有百万上千万）
  async listFollowers(ctx) {
    const users = await User.find({
      // 查询粉丝列表很简单，只需要查找数据库 following 字段包含本用户的 id 即可
      following: ctx.params.id
    })

    ctx.body = users
  }

  // 校验用户存在与否的中间件
  async checkUserExist(ctx, next) {
    // 其实就是请求一下数据库看看关注 or 取关的用户存不存在，不存在报错
    const user = await User.findById(ctx.params.id)

    if (!user) {
      ctx.throw(404, '用户不存在')
    }

    await next()
  }

  // 关注某人功能
  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')

    // 判断以下防止多次关注一个人
    if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save() // 操作完记得保存到数据库里
    }

    ctx.status = 204
  }

  // 取消关注某人功能
  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    // 获取需要取关的人的 ID 在你自己的关注人列表索引
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)

    // 如果需要取关的人存在你的关注列表里
    if (index > -1) {
      me.following.splice(index, 1)
      me.save() // 操作完记得保存到数据库里
    }

    ctx.status = 204
  }

  // 获取用户关注的话题
  async listFollowingTopics(ctx) {
    // 有了 ref 的帮助，用 .populate 函数就可以获取列表用户的具体信息了（根据id）
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
    if (!user) {
      ctx.throw(404, "用户不存在")
    }

    ctx.body = user.followingTopics
  }

  // 关注话题功能（和关注用户功能大致一样，不懂参考上面）
  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')

    // 判断以下防止多次关注话题
    if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id)
      me.save() // 操作完记得保存到数据库里
    }

    ctx.status = 204
  }

  // 取消关注话题功能
  async unfollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+followingTopics')
    // 获取需要取关的话题 id 在你自己的关注人列表索引
    const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)

    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save() // 操作完记得保存到数据库里
    }

    ctx.status = 204
  }
}

module.exports = new UsersCtl()