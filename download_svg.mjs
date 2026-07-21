import fs from 'fs';
import https from 'https';

const url = 'https://www.telkom.co.id/images/logo_horizontal.svg';
const dest = 'public/telkom-logo.svg';

https.get(url, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download completed');
    });
  } else {
    console.error('Failed to download: ' + res.statusCode);
  }
}).on('error', (err) => {
  console.error('Error: ' + err.message);
});
