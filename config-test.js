'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/blog-app';
exports.PORT = process.env.PORT || 8080;
exports.TEST_DATABASE_URL = 'mongodb://Tester1:password@ds239412.mlab.com:39412/blog-mongoose';