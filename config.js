'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://Tester1:password1@ds161322.mlab.com:61322/my-blog-app-final'
exports.PORT = process.env.PORT || 8080;
exports.TEST_DATABASE_URL = 'mongodb://localhost/blog-app';