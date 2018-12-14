'use strict';
require('dotenv').config();

const Arrow = require('arrowjs');
const application = new Arrow();

application.start({
    passport: true,
    role: true
});