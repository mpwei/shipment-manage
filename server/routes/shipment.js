const { Router } = require('express')
const router = Router()
const AuthMiddleware = require('../middlewares/auth')
const admin = require('firebase-admin')
const dayjs = require('dayjs')

router.post('/', AuthMiddleware, (req, res) => {
    return res.send('Shipment')
})

router.get('/get', AuthMiddleware, (req, res, next) => {
    const Client = admin.firestore().collection('Clients').doc(req.body.project).collection('Shipment')
    req.query.ShipmentNo = req.query.ShipmentNo.replace(/\//g, '')
    return Client.doc(req.query.ShipmentNo || 'x').get().then((doc) => {
        if (!doc.exists) {
            return next({
                Status: 400,
                Code: 'SH-001',
                Message: 'Data is not exists.',
            })
        }
        return res.send({
            Code: '200',
            Message: 'Success',
            Data: doc.data()
        })
    })
})

router.post('/list', AuthMiddleware, (req, res, next) => {
    let LastCreateTime = ''
    let Client = admin.firestore().collection('Clients').doc(req.body.project).collection('Shipment')
    if (typeof req.body.ShipmentNo !== 'undefined') {
        Client = Client.where('ShipmentNo', '==', req.body.ShipmentNo)
    }
    if (typeof req.body.Location !== 'undefined') {
        Client = Client.where('Location', '==', req.body.Location)
    }
    if (typeof req.body.Operator !== 'undefined') {
        Client = Client.where('Operator', '==', req.body.Operator)
    }
    if (typeof req.body.LastCreateTime !== 'undefined') {
        LastCreateTime = admin.firestore.Timestamp.fromMillis(req.body.LastCreateTime._seconds * 1000)
    }
    return Client.orderBy('CreateTime', 'desc').startAfter(LastCreateTime).limit(req.body.PerPage || 10).get().then((qs) => {
        const ResponseData = []
        qs.forEach((doc) => {
            ResponseData.push(doc.data())
        })
        return res.send({
            Code: '200',
            Message: 'Success',
            Data: ResponseData,
            LastCreateTime: ResponseData.length > 1 ? ResponseData[(ResponseData.length-1)].CreateTime : 'Last'
        })
    }).catch((error) => {
        return next({
            Code: 'SH-002',
            Message: error,
        })
    })
})

router.post('/update', AuthMiddleware, (req, res, next) => {
    let Client = admin.firestore().collection('Clients').doc(req.body.project).collection('Shipment')
    if (!req.body.ShipmentNo) {
        return next({
            Code: 'SH-004',
            Status: 400,
            Message: 'ShipmentNo is required.',
        })
    }
    req.body.ShipmentNo = req.body.ShipmentNo.replace(/\//g, '')
    return Client.doc(req.body.ShipmentNo).set({
        ...req.body.UpdateData,
        UpdateTime: admin.firestore.FieldValue.serverTimestamp()
    }, {
        merge: true
    }).then(() => {
        return res.send({
            Code: '200',
            Message: 'Success'
        })
    }).catch((error) => {
        return next({
            Code: 'SH-005',
            Message: error,
        })
    })
})

const xlsx = require('xlsx')
const Multer = require('multer')
const FileMulter = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: function (req, file, cb) {
        // ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
        if (!['text/csv', 'text/plain'].includes(file.mimetype)) {
            return cb(new Error('Only support CSV and TXT.'))
        }

        return cb(null, true)
    }
})
router.post('/import', FileMulter.single('upload'), AuthMiddleware, (req, res, next) => {
    let Result = []
    const Schema = {
        '匯入時間': 'CreateTime',
        '貨件號碼': 'ShipmentNo',
        '到貨站': 'Location',
    }
    if (req.file.mimetype === 'text/csv' || req.file.mimetype === 'text/plain') {
        const CSVData = Buffer.from(req.file.buffer).toString()
        const Line = CSVData.split('\n')
        const Headers = Line[0].split(',')
        for (let i = 1; i < Line.length; i++) {
            const TempObject = {}
            const CurrentLine = Line[i].split(',')
            for (let j = 0; j < Headers.length; j++) {
                TempObject[Schema[Headers[j].replace(/"/g, '').replace(/\r/g, '')]] = CurrentLine[j].replace(/"/g, '').replace(/\r/g, '')
            }
            Result.push(TempObject)
        }
    } else {
        const XLSXData = xlsx.read(req.file.buffer, {type: 'buffer', cellDates: true})
        Result = xlsx.utils.sheet_to_json(XLSXData.Sheets[XLSXData.SheetNames[0]])
    }
    let Client = admin.firestore().collection('Clients').doc(req.body.project).collection('Shipment')
    const ImportData = Result || []
    const Batch = admin.firestore().batch()
    ImportData.forEach((item) => {
        console.log(item)
        const Reference = Client.doc(item.ShipmentNo)
        return Batch.set(Reference, {
            ...item,
            CreateTime: admin.firestore.Timestamp.fromMillis(dayjs(item.CreateTime).unix() * 1000)
        })
    })

    return Batch.commit().then(() => {
        return res.send({
            Code: '200',
            Message: 'Success'
        })
    }).catch((error) => {
        return next({
            Code: 'SH-003',
            Message: error,
        })
    })
})

router.post('/export', AuthMiddleware, (req, res, next) => {
    let Client = admin.firestore().collection('Clients').doc(req.body.project).collection('Shipment')
    const StartTime = ''
    const EndTime = ''
    return Client.startAt(StartTime).endAt(EndTime).get().then((qs) => {
        const ResponseData = []
        qs.forEach((doc) => {
            ResponseData.push(doc.data())
        })
        return res.send({
            Code: '200',
            Message: 'Success',
            Data: ResponseData,
            LastCreateTime: ResponseData.length > 1 ? ResponseData[(ResponseData.length-1)].CreateTime : 'Last'
        })
    }).catch((error) => {
        return next({
            Code: 'SH-007',
            Message: error,
        })
    })
})

router.get('/editAdmin', async (req, res, next) => {
    const auth = admin.auth()

    const userRecord = await auth.getUser(req.query.id).then((userRecord) => {
        console.log(userRecord)
        return userRecord
    }).catch((err) => {
        next(err)
    })

    const setClaims = await auth.setCustomUserClaims(userRecord.uid, {
        ...userRecord.customClaims,
        project: 'KSONG'
    }).then((r) => {
        console.log('yy')
        console.log(r)
        console.log('xx')
        return true
    }).catch((err) => {
        throw err
    })

    return Promise.all([
        setClaims,
        // Edit,
        // setPermission
    ]).then(() => {
        return res.send("success!")
    }).catch((err) => {
        return res.send("error: " + err)
    })
})

module.exports = router
