// Script to zip extension for store submission
const fs = require('fs');
const archiver = require('archiver');

// Zip src folder for Chrome Web Store
const output = fs.createWriteStream('dist/chrome-extension.zip');
const archive = archiver('zip');

archive.pipe(output);
archive.directory('src/', false);
archive.finalize();
console.log('Extension zipped successfully to dist/chrome-extension.zip');