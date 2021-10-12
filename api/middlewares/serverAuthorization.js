const {Axios, AdminPanelRequest} = require('../module/Request')

const Token = function (ReceivingServiceURL, FirebaseIdToken) {
  let Instance
  if (process.env.NODE_ENV === 'development') {
    Instance = AdminPanelRequest.request({
      url: '/token',
      method: 'post',
      headers: {
        'xx-csrf-token': FirebaseIdToken
      },
      data: {
        ReceivingServiceURL
      }
    })
  } else {
    Instance = Axios.request({
      baseURL: 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=' + ReceivingServiceURL,
      method: 'get',
      headers: {
        'Metadata-Flavor': 'Google'
      }
    })
  }
  return Instance.then(function (Response) {
    return Response.data
  }).catch(function (Error) {
    throw Error
  })
}

module.exports = {
  // Return Token to Request Server
  GetToken: function (req, res, next) {
    return Token((req.body.ReceivingServiceURL || 'https://mpwei-service-api-kxnw4gb5uq-de.a.run.app'), (req.headers['xx-csrf-token'] || req.query.token || req.query.Token)).then(function (Token) {
      return res.send(Token)
    }).catch(function (err) {
      console.log('GetToken:' + JSON.stringify(err))
      return next({
        Code: 'Token/Unauthorized',
        Status: 403,
        Message: 'Forbidden.'
      })
    })
  },
  // Request Other Cloud Run Server
  ServerAuthMiddleware: function (req, res, next) {
    return Token((req.body.ReceivingServiceURL || 'https://mpwei-service-api-kxnw4gb5uq-de.a.run.app'), (req.headers['xx-csrf-token'] || req.query.token || req.query.Token)).then(function (Token) {
      req.body.ServerToken = Token
      return next()
    }).catch(function (err) {
      console.log('ServerAuthMiddleware:' + JSON.stringify(err))
      return next({
        Code: 'Token/Unauthorized',
        Status: 403,
        Message: 'Forbidden.'
      })
    })
  },
  PayCenterAuthMiddleware: function (req, res, next) {
    return Token((req.body.PayCenterServiceURL || 'https://pay-app-xljmty2qaa-de.a.run.app'), req.headers['xx-csrf-token']).then(function (Token) {
      req.body.PayCenterToken = Token
      return next()
    }).catch(function (err) {
      console.log('PayCenterAuthMiddleware:' + JSON.stringify(err))
      return next({
        Code: 'Token/Unauthorized',
        Status: 403,
        Message: 'Forbidden.'
      })
    })
  }
}
