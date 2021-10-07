const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app, host = 'local') {
    if (host == 'local') {
        app.use(
            '/api',
            createProxyMiddleware({
                target: 'http://local:3001',
                changeOrigin: true,
            })
        );
    } else {
        app.use(
            '/api',
            createProxyMiddleware({
                target: 'http://server:3001',
                changeOrigin: true,
            })
        );
    }
};