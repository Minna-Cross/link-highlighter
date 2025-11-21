const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

require('./generate-icons');

const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const outputPath = path.join(distDir, 'link-highlighter.zip');
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Extension zipped successfully to ${outputPath} (${archive.pointer()} bytes).`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.file(path.join(__dirname, '..', 'manifest.json'), { name: 'manifest.json' });
archive.directory(path.join(__dirname, '..', 'src'), 'src');
archive.finalize();
