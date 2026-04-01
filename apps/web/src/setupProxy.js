// CRA devServer proxy to avoid CORS issues during local development.
// This proxies same-origin requests like http://localhost:3001/v1/** to https://api.xrtech.it.com/v1/**

const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/v1',
    createProxyMiddleware({
      target: 'https://api.xrtech.it.com',
      changeOrigin: true,
      secure: false
    })
  )
}
