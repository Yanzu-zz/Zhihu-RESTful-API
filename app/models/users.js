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
  }
})

// 在 MongoDB 上创建一个集合，名字为 User，并导出类
module.exports = model('User', userSchema)