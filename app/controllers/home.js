const path = require('path')

class HomeCtl {
  index(ctx) {
    ctx.body = "<h1>这是主页</h1>"
  }

  upload(ctx) {
    // ctx.request.files 是获取用户上传文件的对象，后面的 .file 是自己定义的name
    const file = ctx.request.files.file
    const basename = path.basename(file.path)

    ctx.body = {
      url: `${ctx.origin}/uploads/${basename}`
    }
  }
}

module.exports = new HomeCtl()