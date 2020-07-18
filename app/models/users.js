const mongoose = require('mongoose')

const {
  Schema,
  model
} = mongoose

// 生成一个 user schema 模型
const userSchema = new Schema({
  // MongoDB 自带的字段，隐藏掉
  __v: {
    type: Number,
    select: false
  },
  name: {
    type: String,
    required: true
  },
  // 密码字段是敏感字段，需要隐藏
  password: {
    type: String,
    required: true,
    select: false // 这就隐藏了
  },
  // 用户头像
  avatar_url: {
    type: String
  },
  // 性别
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male',
    required: true
  },
  // 一句话简介
  headline: {
    type: String
  },
  // 以下都是默认不显示的字段
  // 居住地
  locations: {
    type: [{
      // 根据 Topic 的 ObjectId，获取该字段的所有数据（需要配合 populate 函数）
      type: Schema.Types.ObjectId,
      ref: 'Topic'
    }],
    select: false
  },
  // 从事行业
  business: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    select: false
  },
  // 职业经历
  employments: {
    type: [{
      company: {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
      },
      job: {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
      }
    }],
    select: false
  },
  // 教育经历
  educations: {
    type: [{
      school: {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
      },
      major: {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
      },
      diploma: {
        // 用数字来表示学历，这样做也是比较合理的
        type: Number,
        enum: [1, 2, 3, 4, 5]
      },
      entrance_year: {
        type: Number
      },
      graduation_year: {
        type: Number
      }
    }],
    select: false
  },
  // 关注列表
  following: {
    type: [{
      // 关注的人的ID，此 ID 的类型是 MongoDB 设置好的类型，不是简单的 JS 类型
      type: Schema.Types.ObjectId,
      ref: 'User' // 表示与 User 这个 Schema 相关联的
    }],
    select: false
  },
  followingTopics:{
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Topic'
    }],
    select: false
  }
})

// 在 MongoDB 上创建一个集合，名字为 User，并导出类
module.exports = model('User', userSchema)