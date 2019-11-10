const admin = require('firebase-admin');

async function uploadFileToFirebaseAndIBM(file, uid) {
    return new Promise(async (resolve, reject) => {
        const filename = file.filename;
        const text = file.text;
        const timestamp = admin.firestore.Timestamp.now();
        const userRef = admin.firestore().collection("Users").doc(uid);
        return admin.firestore().runTransaction(transaction => {
            return userRefPromise(transaction, userRef,timestamp)
            .then(data => {
                return ibmPromise(data.transaction, text, data.counter);
            })
            .then(data => {
                return firebasePromise(data.transaction, userRef, data.discover, data.counter, filename, timestamp);
            });
        }).then(data => {
            return resolve(data);
        }).catch(error => {
            return reject(error);
        });
    });
}

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
        }).catch(_ => {
            console.log(_);
            return reject(new Error("An error occured while retrieving data from Firebase"));
        });
    });
}

async function ibmPromise(transaction, text, counter) {
    return new Promise((resolve, reject) => {
        global.discoveryClient.addDocument({
            environmentId: global.keys.environmentId, 
            collectionId: global.keys.collectionId, 
            file: text 
        })
        .then(discover => {
            return resolve({transaction: transaction, discover: discover, counter: counter});
        })
        .catch(_ => {
            return reject(new Error("An error occured while adding files to IBM"));
        });
    });
}

async function firebasePromise(transaction, userRef, discover, counter, filename, timestamp) {
    return new Promise((resolve, reject) => {
        const discoverId = discover.result.document_id;
        transaction.set(userRef, {uploadCounter: counter + 1, lastUpload: timestamp}, {merge: true});
        transaction.set(userRef.collection("history").doc(), {discoveryId: discoverId, filename: filename, date: timestamp});
        return resolve("File Uploaded Successfully!");
    });
}

exports.uploadFileToFirebaseAndIBM = uploadFileToFirebaseAndIBM;