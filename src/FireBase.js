const { initializeApp, cert }   = require('firebase-admin/app');
const { getFirestore }          = require('firebase-admin/firestore');
const dotenv                    = require('dotenv');

dotenv.config();

initializeApp({
  credential: cert({
    "type"                          : "service_account",
    "project_id"                    : process.env.PROJECT_ID,
    "private_key_id"                : process.env.PRIVATE_KEY_ID,
    "private_key"                   : process.env.PRIVATE_KEY,
    "client_email"                  : process.env.CLIENT_EMAIL,
    "client_id"                     : process.env.CLIENT_ID,
    "auth_uri"                      : process.env.AUTH_URI,
    "token_uri"                     : process.env.TOKEN_URI,
    "auth_provider_x509_cert_url"   : process.env.AUTH_PROVIDER_X506_CERT_URL,
    "client_x509_cert_url"          : process.env.CLIENT_X509_CERT_URL
  }
  ),
  authDomain: "react-app-15a52.firebaseapp.com",
});

const db = getFirestore();

const addUser = async(params = "") => {
    if(params.length === 0) {
        throw 'Параметры пусты'; 
    }

    const aTuringRef = db.collection('users').doc(`${params.id}`);
    return await aTuringRef.set(params);
};

class Firebase {
    addUser() {

    }
}

module.exports = {
    addUser
}