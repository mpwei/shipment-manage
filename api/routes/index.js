const { Router } = require('express')
const router = Router()
const dayjs = require('dayjs')
const fs = require('fs')
const Multer = require('multer')

const FileMulter = Multer({
    storage: Multer.diskStorage({
        destination (req, file, cb) {
            const Dir = `./storage/${dayjs().format('YYYY-MM-DD')}`
            if (!fs.existsSync(Dir)){
                fs.mkdirSync(Dir, { recursive: true });
            }
            cb(null, Dir)
        },
        filename (req, file, cb) {
            cb(null , req.body.name)
        }
    }),
    limits: {
        fileSize: 1024 * 1024 * 100,
    }
})

router.post('/', (req, res) => {
    return res.send('OK22')
})

router.post('/upload/local', FileMulter.single('file'), (req, res) => {
    return res.send('OK')
})

module.exports = router
