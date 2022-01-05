const fs = require('fs');
const crypto = require('crypto');
const KEY_CHANGE = 518400; // 6 days


function generateKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 2048,
    });

    fs.writeFileSync('./private.pem', privateKey.export({ 
        format: 'pem',
        type: 'pkcs8'
    }));
    fs.writeFileSync('./public.pem', publicKey.export({
        type: 'spki',
        format: 'pem'
    }));
}
if (!fs.existsSync('./private.pem')) {
    generateKeys();

    if (!fs.existsSync('./timer')) {
        fs.writeFileSync('./timer', Date.now().toString());
    }
}

const timer = +fs.readFileSync('./timer').toString();

if (Date.now() - timer > KEY_CHANGE) {
    console.log('Changing keys')
    fs.writeFileSync('./timer', Date.now().toString());
    
    generateKeys();
}

// encrypting message
const message = 'secret';
console.log(`Encrypting message: ${message}`);

const publicK = fs.readFileSync('./public.pem').toString();
const privateK = fs.readFileSync('./private.pem').toString();

const encryptedData = crypto.publicEncrypt(
    {
      key: publicK,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    // We convert the data string to a buffer using `Buffer.from`
    Buffer.from(message)
    );

console.log(`Encrypted message: ${encryptedData.toString('base64')}`);

const decryptedData = crypto.privateDecrypt(
    {
        key: privateK,
        // In order to decrypt the data, we need to specify the
        // same hashing function and padding scheme that we used to
        // encrypt the data in the previous step
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    },
    encryptedData
    );
    
// The decrypted data is of the Buffer type, which we can convert to a
// string to reveal the original data
console.log("Decrypted message: ", decryptedData.toString());
