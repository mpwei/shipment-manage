const api = require('./index')

module.exports = app => {
    app.use('/api', api)
}
