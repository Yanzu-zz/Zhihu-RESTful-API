require('dotenv').config('../../env')

const {
  SECRET, // token 加密密钥
  MONGOLAB_URI // 数据库连接 URI
} = process.env

module.exports = {
  SECRET,
  MONGOLAB_URI
}