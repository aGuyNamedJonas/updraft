'use strict';
const path = require('path')

// Stolen from:
// https://hackernoon.com/how-to-host-a-single-page-application-with-aws-cloudfront-and-lambda-edge-39ce7b036da2
exports.handler = (event, context, callback) => {
    const {request} = event.Records[0].cf

    if (!path.extname(request.uri)) {
        request.uri = '/index.html'
    }

    callback(null, request)
}