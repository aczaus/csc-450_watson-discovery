const admin = require('firebase-admin');

/**
 * Allows for the upload of files to Firabse and IBM
 * @param {{filename: String, file: Buffer}} fileObject Object with filename and buffer
 * @param {String} uid users UID
 */
async function uploadFileToFirebaseAndIBM(fileObject, uid) {
    return new Promise(async (resolve, reject) => {
        const timestamp = admin.firestore.Timestamp.now();
        const userRef = admin.firestore().collection("Users").doc(uid);
        return admin.firestore().runTransaction(transaction => {
            return userRefPromise(transaction, userRef,timestamp)
            .then(data => {
                return ibmPromise(data.transaction, fileObject.file, data.counter);
            })
            .then(data => {
                return firebasePromise(data.transaction, userRef, data.discover, data.counter, fileObject.filename, timestamp);
            });
        }).then(data => {
            return resolve(data);
        }).catch(error => {
            return reject(error);
        });
    });
}

/**
 * Generates the Ref Promise 
 * @param {Promise} transaction Transaction Promise from admin.firestore().runTransaction()
 * @param {FirebaseFirestore.DocumentReference} userRef The firebase document that references user
 * @param {firestore.Timestamp} timestamp The current timestamp that is to be inserted upon completion
 */
async function userRefPromise(transaction, userRef, timestamp) {
    return new Promise((resolve, reject) => {
        transaction.get(userRef).then(doc => {
            let counter = doc.get('uploadCounter') || 0;
            const lastUpload = doc.get('lastUpload') || new admin.firestore.Timestamp(0,0);
            const waitTime = 3600;
            const difference = timestamp.seconds - lastUpload.seconds;
            if(difference > waitTime) {
                counter = 0;
            }
            if(counter >= 10) {
                const timeLeft = waitTime - difference;
                const counterDate = new Date(0,0,0,0,0,timeLeft,0);
                return reject(new Error("The amount of uploads for this account has exceeded the limit.  Try again in " + counterDate.getMinutes() + " minutes"));
            }
            else{
                return resolve({transaction: transaction, counter: counter});
            }
        }).catch(error => {
            console.error(error);
            return reject(new Error("An error occured while retrieving data from Firebase"));
        });
    });
}

/**
 * Generates the promise for IBM
 * @param {Promise} transaction Transaction Promise from admin.firestore().runTransaction()
 * @param {Buffer} file Buffer to be used for upload to IBM
 * @param {Number} counter A Counter to be passed to the next Promise
 */
async function ibmPromise(transaction, file, counter) {
    console.log(file);
    return new Promise((resolve, reject) => {
        global.discoveryClient.addDocument({
            environmentId: global.keys.environmentId, 
            collectionId: global.keys.collectionId, 
            file: file 
        })
        .then(discover => {
            return resolve({transaction: transaction, discover: discover, counter: counter});
        })
        .catch(error => {
            console.error(error);
            return reject(new Error("An error occured while adding files to IBM"));
        });
    });
}

/**
 * Generates the Firabse Promise
 * @param {Promise} transaction Transaction Promise from admin.firestore().runTransaction()
 * @param {FirebaseFirestore.DocumentReference} userRef The firebase document that references user
 * @param {Promise<DiscoveryV1.Response<DiscoveryV1.DocumentAccepted>>} discover The Discovery Object returned from addDocument()
 * @param {Number} counter The main Counter Number
 * @param {String} filename Name of File to be Uploaded
 * @param {firestore.Timestamp} timestamp The current timestamp that is to be inserted upon completion
 */
async function firebasePromise(transaction, userRef, discover, counter, filename, timestamp) {
    return new Promise((resolve, reject) => {
        const discoverId = discover.result.document_id;
        transaction.set(userRef, {uploadCounter: counter + 1, lastUpload: timestamp}, {merge: true});
        transaction.set(userRef.collection("history").doc(), {discoveryId: discoverId, filename: filename, date: timestamp});
        return resolve("File Uploaded Successfully!");
    });
}

exports.uploadFileToFirebaseAndIBM = uploadFileToFirebaseAndIBM;