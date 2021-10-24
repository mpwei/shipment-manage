const { Router } = require('express')
const router = Router()
const admin = require('firebase-admin')
const dayjs = require('dayjs')
const Multer = require('multer')
const AuthMiddleware = require('../middlewares/auth')

const FileMulter = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
})

router.post('list', (req, res, next) => {

})

router.post('/upload', FileMulter.single('file'), AuthMiddleware, (req, res, next) => {
    const Bucket = admin.storage().bucket(req.body.storageBucket || 'mpwei-logistics-system.appspot.com')
    const Blob = Bucket.file(`Clients/${req.body.project}/Record/${dayjs().format('YYYY-MM-DD')}/${req.body.name}`)
    const BlobStream = Blob.createWriteStream({
        contentType: req.file.mimetype,
        predefinedAcl: 'publicRead'
    })

    BlobStream.on('error', error => {
        return next(error)
    })

    BlobStream.on('finish', async () => {
        await Bucket.file(`Clients/${req.body.project}/Record/${dayjs().format('YYYY-MM-DD')}/${req.body.name}`).getSignedUrl({
            action: 'read',
            expires: Date.now() + 60000 * 60 * 24 * 365 * 20
        }).then((url) => {
            return res.send({
                Code: 200,
                Message: 'Success',
                Data: url
            })
        }).catch((error) => {
            return next(error)
        })
    })

    BlobStream.end(req.file.buffer)
})

module.exports = router
