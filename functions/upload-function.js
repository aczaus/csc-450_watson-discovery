const admin = require('firebase-admin');

async function uploadFileToFirebaseAndIBM(file, uid) {
    return new Promise(async (resolve, reject) => {
        const filename = file.filename;
        const text = file.text;
        const timestamp = admin.firestore.Timestamp.now();
        const userRef = admin.firestore().collection("Users").doc(uid);
        return userRefPromise(userRef, timestamp)
        .then(data => {
            return ibmPromise(text, data.counter);
        })
        .then(data => {
            return firebasePromise(userRef, data.discover, data.counter, filename, timestamp);
        })
        .then(data => {
            return resolve(data);
        })
        .catch(error => {
            return reject(error)
        })
    })
}

async function userRefPromise(userRef, timestamp) {
    return new Promise((resolve, reject) => {
        userRef.get().then(doc => {
            let counter = doc.get('uploadCounter') || 0;
            const lastUpload = doc.get('lastUpload') || new admin.firestore.Timestamp(0,0);
            const waitTime = 3600;
            const difference = timestamp.seconds - lastUpload.seconds;
            if(difference > waitTime) {
                counter = 0;
            }
            if(counter >= 10) {
                const timeLeft = waitTime - difference;
                const counterDate = new Date(0,0,0,0,0,0,0);
                counterDate.setSeconds(timeLeft);
                return reject(new Error("The amount of uploads for this account has exceeded the limit.  Try again in " + counterDate.getMinutes() + " minutes"));
            }
            else{
                return resolve({counter: counter});
            }
        }).catch(err => {
            return reject(err.message);
        });
    });
}

async function ibmPromise(text, counter) {
    return new Promise((resolve, reject) => {
        global.discoveryClient.addDocument({
            environmentId: global.keys.environmentId, 
            collectionId: global.keys.collectionId, 
            file: text 
        })
        .then(discover => {
            return resolve({discover: discover, counter: counter});
        })
        .catch(_ => {
            return reject(new Error("An error occured while adding files to IBM"));
        });
    });
}

async function firebasePromise(userRef, discover, counter, filename, timestamp) {
    return new Promise((resolve, reject) => {
        const discoverId = discover.result.document_id;
        const batch = admin.firestore().batch();
        batch.set(userRef, {uploadCounter: counter + 1, lastUpload: timestamp}, {merge: true});
        batch.set(userRef.collection("history").doc(), {discoveryId: discoverId, filename: filename, date: timestamp});
        batch.commit().then(_ => {
            return resolve("File Uploaded Successfully!");
        }).catch(_ => {
            return reject(new Error("An error occured while adding files to Firebase"));
        });
    });
}

exports.uploadFileToFirebaseAndIBM = uploadFileToFirebaseAndIBM;