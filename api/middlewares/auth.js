const admin = require('firebase-admin')

module.exports = function (req, res, next) {
    return admin.auth().verifyIdToken((req.headers['xx-csrf-token'] || req.query.token || req.query.Token), true)
        .then((decodedToken) => {
            req.body.uid = decodedToken.uid
            req.body.project = decodedToken.project
            req.body.authUser = decodedToken
            if (!req.body.project) {
                return next({
                    Code: 'Forbidden',
                    Message: '權限不足'
                })
            }
            return next()
        }).catch((error) => {
            console.log(JSON.stringify(error))
            if (error.code === 'auth/id-token-revoked') {
                console.log('Token has been revoked.')
            } else {
                console.log('Token is invalid.')
            }
            return next(error)
        })
}
