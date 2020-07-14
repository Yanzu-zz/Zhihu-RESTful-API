const fs = require('fs')

// 批量组成路由函数
module.exports = (app) => {
  // readdirSync nodejs自带fs模块的读取目录函数，返回一个结果数组
  fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js') {
      return
    }

    const route = require(`./${file}`)
    app.use(route.routes()).use(route.allowedMethods())
  })
}