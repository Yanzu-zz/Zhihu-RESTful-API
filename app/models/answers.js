const mongoose = require('mongoose')

const {
  Schema,
  model
} = mongoose

// 生成一个 user schema 模型
const answerSchema = new Schema({
  __v: {
    type: Number,
    select: false
  },
  content: {
    type: String,
    required: true
  },
  // 话题简介
  answerer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false
  },
  // 答案对应的问题 ID
  questionId: {
    type: String,
    required: true
  },
  // 投票数（赞/踩数量）
  voteCount: {
    type: Number,
    require: true,
    default: 0
  }
}, {
  // 加这么一句参数，所有的数据都会自带时间戳了（MongoDB帮我们做好的）
  timestamps: true
})

// 在 MongoDB 上创建一个集合，名字为 User，并导出类
module.exports = model('Answer', answerSchema)