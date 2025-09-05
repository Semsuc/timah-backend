// middlewares/stripeRawBody.js

const express = require('express');

/**
 * Stripe requires the raw body to verify webhook signatures.
 * This middleware captures the raw body buffer for the Stripe webhook route.
 */
const stripeRawBodyMiddlewares = express.raw({ type: 'application/json' });

module.exports = stripeRawBodyMiddlewares;
