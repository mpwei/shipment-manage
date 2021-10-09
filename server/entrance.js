const api = require('./app')

module.exports = app => {
    app.use('/api', api)
}
