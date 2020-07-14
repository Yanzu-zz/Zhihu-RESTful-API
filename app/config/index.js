const {
  SECRET,
  MONGOLAB_URI
} = require('./database')

module.exports = {
  secret: SECRET,
  connectionStr: MONGOLAB_URI
}