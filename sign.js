const fs = require('fs');
const crypto = require('crypto');
const KEY_CHANGE = 518400; // 6 days
const timer = +fs.readFileSync('./timer').toString();

if (Date.now() - timer > KEY_CHANGE) {
    console.log('Changing keys')
    fs.writeFileSync('./timer', Date.now().toString());
    
    generateKeys();
}

const publicK = fs.readFileSync('./public.pem').toString();
const privateK = fs.readFileSync('./private.pem').toString();

const verifiableData = "this needs to be verified";


console.log(`Verifying: ${verifiableData}`)

const signature = crypto.sign("sha256", Buffer.from(verifiableData), {
  key: privateK,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
});

console.log(`Signature: ${signature.toString("base64")}`);

const isVerified = crypto.verify(
  "sha256",
  Buffer.from(verifiableData),
  {
    key: publicK,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  },
  signature
);

// isVerified should be `true` if the signature is valid
console.log("Signature verified: ", isVerified);