const functions = require('firebase-functions')
const admin = require('firebase-admin')

if (!admin.apps.length) {
    admin.initializeApp()
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
            Name: UserData.Name
        }
    })
})