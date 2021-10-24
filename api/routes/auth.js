const { Router } = require('express')
const router = Router()
const admin = require('firebase-admin')

router.post('/login', async (req, res, next) => {
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

module.exports = router
