const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: '.env' });

/**
 * @typedef {Object} TargetConfig
 * @property {string} prefix - The prefix for the target URL.
 * @property {string} domain - The domain for the target URL.
 * @property {number} port - The port number for the target server.
 * @property {string} subdomain - The subdomain for the target URL.
 */

/**
 * Normalizes the URL by removing the protocol (http:// or https://) from it.
 * @param {string} url - The original URL.
 * @returns {string} - The normalized URL.
 */
const normalizeUrl = (url) => {
    return url.replace(/https?:\/\//, '');
};

/**
 * Creates and configures the Express proxy server.
 */
const createProxyServer = () => {
    const app = express();

    /**
     * Adds a health check route to verify the server's state.
     */
    app.get('/ping', (req, res) => {
        res.status(200).json({ message: 'pong' });
    });

    // Read environment variables
    const ENV = process.env.ENVIRONMENT;
    const ROOT_PORT = process.env.ROOT_PORT;
    const ROOT_URL = process.env.ROOT_URL;
    const PREFIX = process.env.PREFIX;
    const DOMAIN = process.env.DOMAIN;
    const PORTS = process.env.PORTS.split(',');
    const SUBDOMAINS = process.env.SUBDOMAINS.split(',');
    const IS_SUBDOMAIN = process.env.IS_SUBDOMAIN === 'true';

    /**
     * @type {Object.<string, string>}
     * Object to store routing rules for the proxy server.
     */
    const routers = {};

    PORTS.forEach((port, index) => {
        const prefix = PREFIX;
        const domain = DOMAIN;
        const subdomain = SUBDOMAINS[index];
        let key = null;
        let value = null;

        if (IS_SUBDOMAIN) {
            key = `${prefix}${subdomain}.${domain}`;
        } else {
            key = `${prefix}${domain}:${port}`;
        }

        value = `http://localhost:${port}`;

        routers[normalizeUrl(key)] = value;
    });

    // Setup proxy middleware
    app.use('/', createProxyMiddleware({
        target: ROOT_URL,
        changeOrigin: true,
        router: routers
    }));

    // Start the proxy server
    app.listen(ROOT_PORT, () => {
        console.log(`Node Proxy server listening at port ${ROOT_PORT} on ${ENV} environment`);
    });
};

// Start the proxy server
createProxyServer();