const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: '.env' });

// Process env port variables
const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PROXY_PORT;
const TCT_BINARY_PRO_PORT = process.env.TCT_BINARY_PRO_PORT;

// Process env url variables
const ROOT_URL = process.env.ROOT_URL;
const TCT_BINARY_PRO_URL = process.env.TCT_BINARY_PRO_URL;

const app = express();

// Remove https and http from url to put in router object
const normalizeUrl = (url) => {
    if (url.includes('https')) return url.replace('https://', '')
    else if (url.includes('http')) return url.replace('http://', '')
    else return url
}

// Set router object
const routers = {};
routers[normalizeUrl(TCT_BINARY_PRO_URL)] = `http://localhost:${TCT_BINARY_PRO_PORT}`;

// Setup proxy
app.use('/', createProxyMiddleware({
    target: ROOT_URL,
    changeOrigin: true,
    router: routers
}))

// App listen
app.listen(PORT, () => {
    console.log(`Node Proxy server listening at port ${PORT} on ${ENV} enviroment`)
});