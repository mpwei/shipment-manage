const { Router } = require('express')
const router = Router()
const AuthMiddleware = require('../middlewares/auth')
const admin = require('firebase-admin')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

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

router.post('/list', AuthMiddleware, async (req, res, next) => {
    let NextCreateTime = ''
    let Client = admin.firestore().collection('Clients').doc(req.body.project).collection('Shipment')
    const Counts = await admin.firestore().collection('Clients').doc(req.body.project).get().then((doc) => {
       if (!doc.exists) {
           return 0
       }
       return doc.data().ShipmentCount
    })
    if (typeof req.body.ShipmentNo !== 'undefined') {
        Client = Client.where('ShipmentNo', '==', req.body.ShipmentNo)
    }
    if (typeof req.body.Location !== 'undefined') {
        Client = Client.where('Location', '==', req.body.Location)
    }
    if (typeof req.body.Operator !== 'undefined') {
        Client = Client.where('Operator', '==', req.body.Operator)
    }
    Client = Client.orderBy('CreateTime', 'desc')
    if (typeof req.body.NextCreateTime !== 'undefined') {
        NextCreateTime = admin.firestore.Timestamp.fromMillis(req.body.NextCreateTime._seconds * 1000)
        switch (req.body.Action) {
            case 'Prev':
                Client = Client.endBefore(NextCreateTime)
                break
            case 'Next':
                Client = Client.startAfter(NextCreateTime)
                break
        }
    }
    return Client.limit(req.body.PerPage || 10).get().then((qs) => {
        const ResponseData = []
        qs.forEach((doc) => {
            ResponseData.push(doc.data())
        })
        return res.send({
            Code: '200',
            Message: 'Success',
            Data: ResponseData,
            Counts,
            NextCreateTime: ResponseData.length > 0 ? ResponseData[(ResponseData.length - 1)].CreateTime : null
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
        if (!['text/csv', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.mimetype)) {
            return cb(new Error('僅支援CSV、XLS、XLSX或TXT檔'))
        }

        return cb(null, true)
    }
})
router.post('/import', FileMulter.single('upload'), AuthMiddleware, async (req, res, next) => {
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
                if (typeof CurrentLine[j] !== 'undefined') {
                    TempObject[Schema[Headers[j].replace(/"/g, '').replace(/\r/g, '').trim()]] = CurrentLine[j].replace(/"/g, '').replace(/\r/g, '')
                }
            }
            Result.push(TempObject)
        }
    } else {
        let XLSXData = xlsx.read(req.file.buffer, {type: 'buffer', cellDates: true})
        XLSXData = xlsx.utils.sheet_to_json(XLSXData.Sheets[XLSXData.SheetNames[0]]) || []
        XLSXData.forEach(item => {
            Result.push({
                ShipmentNo: item['貨件號碼'].toString(),
                Location: item['到貨站']
            })
        })
    }
    let Client = admin.firestore().collection('Clients').doc(req.body.project).collection('Shipment')
    let ImportData = Result.filter(item => item.ShipmentNo !== '' && typeof item.ShipmentNo !== 'undefined') || []

    // 先判斷是否存在
    const ExecuteIsExists = ImportData.map(item => {
        return Client.doc(item.ShipmentNo).get().then((doc) => {
            if (!doc.exists) {
                return item
            } else {
                throw 'Data is exists.'
            }
        }).catch((error) => {
            throw error
        })
    })

    ImportData = await Promise.allSettled(ExecuteIsExists).then((result) => {
        return result.filter(item => item.status === 'fulfilled').map(data => data.value)
    })

    const Batch = admin.firestore().batch()
    ImportData.forEach((item, index) => {
        const Reference = Client.doc(item.ShipmentNo)
        return Batch.set(Reference, {
            ...item,
            CreateTime: admin.firestore.Timestamp.fromMillis((dayjs().tz('Asia/Taipei').unix() + index) * 1000)
        }, {
            merge: true
        })
    })
    Batch.set(admin.firestore().collection('Clients').doc(req.body.project), {
        ShipmentCount: admin.firestore.FieldValue.increment(ImportData.length)
    }, {
        merge: true
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
    console.log(req.body.StartTime)
    console.log(req.body.EndTime)
    const StartTime = admin.firestore.Timestamp.fromMillis(dayjs(req.body.StartTime).tz('Asia/Taipei').unix() * 1000)
    const EndTime = admin.firestore.Timestamp.fromMillis(dayjs(req.body.EndTime).tz('Asia/Taipei').unix() * 1000)
    return Client.orderBy('UpdateTime').startAt(StartTime).endAt(EndTime).get().then((qs) => {
        const Result = []
        const Headers = ['ShipmentNo', 'Location', 'CreateTime', 'Operator', 'UpdateTime']
        const Sheet = [
            {
                ShipmentNo: '貨件號碼',
                Location: '到貨站',
                CreateTime: '匯入時間',
                Operator: '作業人員',
                UpdateTime: '最後作業時間',
            }
        ]
        qs.forEach((doc) => {
            Result.push(doc.data())
            Sheet.push({
                ShipmentNo: doc.data().ShipmentNo,
                Location: doc.data().Location,
                CreateTime: dayjs(doc.data().CreateTime._seconds * 1000).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'),
                Operator: doc.data().Operator,
                UpdateTime: dayjs(doc.data().UpdateTime._seconds * 1000).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss')
            })
        })

        const WorkBook = xlsx.utils.book_new()
        const WorkSheet = xlsx.utils.json_to_sheet(Sheet, {header: Headers, skipHeader: true})
        xlsx.utils.book_append_sheet(WorkBook, WorkSheet)

        return res.send({
            Code: '200',
            Message: 'Success',
            Data: Result,
            CsvData: xlsx.write(WorkBook, {type: 'base64', bookType: 'csv'})
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
        project: '38511707'
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
