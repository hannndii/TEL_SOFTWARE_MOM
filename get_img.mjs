import fs from 'fs';

fetch('https://www.telkom.co.id/sites/news-resources/en_US/page/brand-guideline-logo-telkom-indonesia-659')
  .then(r => r.text())
  .then(t => {
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    const urls = [];
    while ((match = regex.exec(t)) !== null) {
      urls.push(match[1]);
    }
    console.log(urls.join('\n'));
  });
