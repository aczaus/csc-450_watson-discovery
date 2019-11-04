const admin = require('firebase-admin');
const cookieParser = require('cookie-parser')();

async function validateFirebaseIdToken (req, res, next) {
  console.log('Check if request is authorized with Firebase ID token');

  const idToken = await getIdTokenFromRequest(req, res);
  if (idToken) {
    await addDecodedIdTokenToRequest(idToken, req);
  }
  next();
}

function getIdTokenFromRequest(req, res) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    return Promise.resolve(req.headers.authorization.split('Bearer ')[1]);
  }
  return new Promise((resolve, reject) => {
    cookieParser(req, res, () => {
      if (req.cookies && req.cookies.__session) {
        console.log('Found "__session" cookie');
        resolve(req.cookies.__session);
      } else {
        resolve();
      }
    });
  });
}

async function addDecodedIdTokenToRequest(idToken, req) {

  return admin.auth().verifyIdToken(idToken).then(decodedIdToken => {
    return admin.auth().getUser(decodedIdToken.uid);
  }).then(user => {
    req.user = user;
    return;
  }).catch(error => {
    return;
  })

  /*
    return admin.auth().verifyIdToken(idToken).then(decodedIdToken => {
      return admin.auth().getUser(decodedIdToken.uid).then(user => {
        req.user = user;
        return;
      }).catch(error => {
        return;
      });
    }).catch(error => {
      return;
    });
    */
}

exports.validateFirebaseIdToken = validateFirebaseIdToken;