import fs from 'fs';
import https from 'https';

const url = 'https://logo.clearbit.com/telkom.co.id';
const dest = 'public/telkom-logo.png';

https.get(url, (res) => {
  if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
    if (res.statusCode !== 200) {
      https.get(res.headers.location, (res2) => {
        const file = fs.createWriteStream(dest);
        res2.pipe(file);
        file.on('finish', () => file.close());
      });
    } else {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close());
    }
  }
});
