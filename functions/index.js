const functions = require('firebase-functions')
const admin = require('firebase-admin')

if (!admin.apps.length) {
    admin.initializeApp()
    // admin.initializeApp({
    //     credential: admin.credential.cert({
    //         projectId: process.env.VUE_APP_FIREBASE_PROJECTID,
    //         private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    //         client_email: process.env.FIREBASE_CLIENT_EMAIL
    //     }),
    //     databaseURL: process.env.VUE_APP_FIREBASE_DATABASEURL
    // })
}

exports.DoLogin = functions.region('asia-east1').https.onRequest(async (req, res) => {
    if (!req.body.Project) {
        return res.status(401).send({
            Code: 'L-001',
            Message: '請輸入公司代號'
        })
    }

    if (!req.body.Account) {
        return res.status(401).send({
            Code: 'L-002',
            Message: '請輸入帳號'
        })
    }

    const UserData = await admin.firestore().collection('Clients').doc(req.body.Project).collection('Member').doc(req.body.Account).get().then((doc) => {
       if (!doc.exists) {
           return null
       }
        return doc.data()
    }).catch((error) => {
        console.log(error)
        return null
    })

    if (UserData === null) {
        return res.status(401).send({
            Code: 'L-003',
            Message: '用戶不存在'
        })
    }

    return res.send({
        Code: 'Success',
        Message: '成功取得會員資訊',
        UserData: {
            Email: UserData.Email,
            Name: UserData.Name,
            Permission: UserData.Permission
        }
    })
})

// exports.EditAdmin = functions.region('asia-east1').https.onRequest(async (req, res, next) => {
//     // const db = admin.firestore()
//     const auth = admin.auth()
//
//     const userRecord = await auth.getUser(req.query.id).then((userRecord) => {
//         console.log(userRecord)
//         return userRecord
//     }).catch((err) => {
//         next(err)
//     })
//
//     const setClaims = await auth.setCustomUserClaims(userRecord.uid, {
//         ...userRecord.customClaims,
//         project: 'GINTEN'
//     }).then((r) => {
//         console.log('yy')
//         console.log(r)
//         console.log('xx')
//         return true
//     }).catch((err) => {
//         throw err
//     })
//
//     return Promise.all([
//         setClaims,
//         // Edit,
//         // setPermission
//     ]).then((r) => {
//         return res.send("success!")
//     }).catch((err) => {
//         return res.send("error: " + err)
//     })
// })
