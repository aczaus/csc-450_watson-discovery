const admin = require('firebase-admin');
const cookieParser = require('cookie-parser')();

async function validateFirebaseUser (req, res, next) {
    const uid = await getUidFromRequest(req, res);
    if (uid) {
      await addUserToRequest(uid, req);
    }
    next();
}

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