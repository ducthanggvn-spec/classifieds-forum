const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('web/src');
const target = 'process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"';
const replacement = 'process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api")';

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes(target)) {
    content = content.split(target).join(replacement);
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
  }
});
