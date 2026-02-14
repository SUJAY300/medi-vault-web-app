// index.js
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

// Replace with your Pinata API keys
const pinata = pinataSDK('8f41f6c3ba9038662f58', '857e41c835780990ec49696c1ebfb441b08dd8752c97540bf0985fb4f795157d');

// File to upload
const filePath = './file-to-upload.txt';

// Check if file exists
if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
}

const readableStreamForFile = fs.createReadStream(filePath);

pinata.pinFileToIPFS(readableStreamForFile)
    .then((result) => {
        console.log("✅ File uploaded to Pinata/IPFS!");
        console.log("IPFS Hash:", result.IpfsHash);
    })
    .catch((err) => {
        console.error("❌ Upload failed:", err);
    });
