const mongoose = require('mongoose')

const {
  Schema,
  model
} = mongoose

// 生成一个 user schema 模型
const topicSchema = new Schema({
  __v: {
    type: Number,
    select: false
  },
  name: {
    type: String,
    required: true
  },
  avatar_url: {
    type: String
  },
  // 话题简介
  introduction: {
    type: String,
    select: false
  }
})

// 在 MongoDB 上创建一个集合，名字为 User，并导出类
module.exports = model('Topic', topicSchema)