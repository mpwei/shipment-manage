const { Router } = require('express')
const router = Router()
const admin = require('firebase-admin')
const dayjs = require('dayjs')
const Multer = require('multer')
const AuthMiddleware = require('../middlewares/auth')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

const FileMulter = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
})

router.post('/list', AuthMiddleware, async (req, res, next) => {
    const Bucket = admin.storage().bucket(req.body.storageBucket || 'mpwei-logistics-system.appspot.com')
    let prefix =  `Clients/${req.body.project}/Record/${req.body.SelectDate || dayjs().tz('Asia/Taipei').format('YYYY-MM-DD')}`
    if (typeof req.body.EntryTag !== 'undefined' && req.body.EntryTag !== '') {
        prefix += `/${req.body.EntryTag}`
    }
    const [files] = await Bucket.getFiles({
        prefix
    })
    const List = files.map(file => {
        return {
            Path: file.name,
            Name: file.name.split('/')[file.name.split('/').length - 1],
            CreateTime: dayjs(file.metadata.timeCreated).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
            Size: file.metadata.size,
            ContentType: file.metadata.contentType,
            PublicURL: file.publicUrl()
        }
    })
    return res.send({
        Code: 200,
        Message: 'Success',
        Data: List
    })
})

router.post('/upload', FileMulter.single('file'), AuthMiddleware, (req, res, next) => {
    const Bucket = admin.storage().bucket(req.body.storageBucket || 'mpwei-logistics-system.appspot.com')
    let Path = `Clients/${req.body.project}/Record/${dayjs().tz('Asia/Taipei').format('YYYY-MM-DD')}`
    if (typeof req.body.EntryTag !== 'undefined') {
        Path += `/${req.body.EntryTag}`
    }
    Path += `/${req.body.name}`
    const Blob = Bucket.file(Path)
    const BlobStream = Blob.createWriteStream({
        contentType: req.file.mimetype,
        predefinedAcl: 'publicRead'
    })

    BlobStream.on('error', error => {
        return next(error)
    })

    BlobStream.on('finish', async () => {
        await Bucket.file(Path).getSignedUrl({
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
