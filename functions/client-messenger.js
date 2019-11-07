function resolve(response) {
    return result(true, response);
}

function reject(response) {
    return result(false, response)
}

function result(success=true, response) {
    return {success: success, response: response};
}

exports.resolve = resolve;
exports.reject = reject;