/**
 * Resolve with response
 * @param {Object} response Resolution Response
 */
function resolve(response) {
    return result(true, response);
}

/**
 * Reject with response
 * @param {Object} response Rejection Response
 */
function reject(response) {
    return result(false, response)
}

/**
 * Create Result
 * @param {Boolean} success Whether result was successful or not
 * @param {Object} response Response to result
 */
function result(success=true, response) {
    return {success: success, response: response};
}

exports.resolve = resolve;
exports.reject = reject;