const mongoose = require('mongoose')

const {
  Schema,
  model
} = mongoose

// 生成一个 user schema 模型
const questionSchema = new Schema({
  __v: {
    type: Number,
    select: false
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  // 话题简介
  questioner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false
  },
  // 一个问题可能只关联1-10话题，而话题下面的问题可能有百万条
  // 所以我们这种设计就分散的数据，设计的就很合理
  topics: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Topic',
    }],
    select: false
  }
}, {
  // 加这么一句参数，所有的数据都会自带时间戳了（MongoDB帮我们做好的）
  timestamps: true
})

// 在 MongoDB 上创建一个集合，名字为 User，并导出类
module.exports = model('Question', questionSchema)