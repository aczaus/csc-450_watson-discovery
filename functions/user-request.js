const admin = require('firebase-admin');
const cookieParser = require('cookie-parser')();

/**
 * Validation Method
 * @param {Request} req Request Object
 * @param {Response} res Response Object
 * @param {Function} next Next Function
 */
async function validateFirebaseUser (req, res, next) {
    const uid = await getUidFromRequest(req, res);
    if (uid) {
      await addUserToRequest(uid, req);
    }
    next();
}

/**
 * Gets UID From Request
 * @param {Request} req Request Object
 * @param {Response} res Response Object
 */
function getUidFromRequest(req, res) {
    return new Promise((resolve, reject) => {
        cookieParser(req, res, () => {
        if (req.cookies && req.cookies.__session) {
            resolve(req.cookies.__session);
        } else {
            resolve();
        }
        });
    });
}
/**
 * Adds User to Request as req.user
 * @param {String} uid UID of user
 * @param {Request} req Request Object
 */
async function addUserToRequest(uid, req) {
    return admin.auth().getUser(uid).then(user => {
        req.user = user;
        return;
    }).catch(error => {
        console.log(uid + " : " + error);
        return;
    });
}

exports.validateFirebaseUser = validateFirebaseUser;