import fs from 'node:fs';
import https from 'node:https';

const downloads = [
  {
    name: 'homepage',
    url: 'https://export-download.canva.com/DbsLg/DAHWzSDbsLg/-1/0-3944545026063617952.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261001%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261001T121632Z&X-Amz-Expires=39943&X-Amz-Signature=cb415443682f2a942d04e4a67545faeda10cdaf32cf59b54b983820f0500f51c&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Thu%2C%2001%20Oct%202026%2023%3A22%3A15%20GMT',
    dest: 'f:/Seedly/design-ref/homepage.pdf',
  },
  {
    name: 'shop-all',
    url: 'https://export-download.canva.com/FLiYE/DAHWzXFLiYE/-1/0-3163170491708571296.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261001%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261001T104048Z&X-Amz-Expires=43543&X-Amz-Signature=f626800d6f6faf1326838bb7c130c93c0a41c7702cab7d68c86e4508c010b5e5&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Thu%2C%2001%20Oct%202026%2022%3A46%3A31%20GMT',
    dest: 'f:/Seedly/design-ref/shop-all.pdf',
  },
];

async function downloadFile(item) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(item.dest);
    https.get(item.url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed with status ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const stat = fs.statSync(item.dest);
        console.log(`Downloaded ${item.name} (${stat.size} bytes) -> ${item.dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(item.dest);
      reject(err);
    });
  });
}

async function run() {
  for (const item of downloads) {
    await downloadFile(item);
  }
}

run().catch(console.error);
