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
    ctx.body = await User.find()
  }

  // 获取特定用户
  async findById(ctx) {
    const user = await User.findById(ctx.params.id)
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
      }
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
}

module.exports = new UsersCtl()