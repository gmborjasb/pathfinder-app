import fs from 'fs';
import https from 'https';

const data = JSON.parse(fs.readFileSync('datos_becas_peru_real.json', 'utf8'));

const checkUrl = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    
    const req = https.get(url, { timeout: 3000 }, (res) => {
      // 200s and 300s are generally okay
      if (res.statusCode >= 200 && res.statusCode < 400) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.abort();
      resolve(false);
    });
  });
};

async function main() {
  let changed = 0;
  for (let b of data) {
    if (b.url_oficial) {
      const isGood = await checkUrl(b.url_oficial);
      if (!isGood) {
        console.log(`Broke/Invalid URL: ${b.url_oficial}`);
        b.url_oficial = null;
        changed++;
      } else {
        console.log(`Good URL: ${b.url_oficial}`);
      }
    }
  }
  
  if (changed > 0) {
    fs.writeFileSync('datos_becas_peru_real.json', JSON.stringify(data, null, 2));
    console.log(`Removed ${changed} bad URLs.`);
  } else {
    console.log('All URLs are good!');
  }
}

main();
