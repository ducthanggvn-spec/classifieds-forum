const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

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

const files = walk(dir);

const oldRegex = /const API_URL = process\.env\.NEXT_PUBLIC_API_URL \|\| \(process\.env\.NODE_ENV === "production" \? "https:\/\/classifieds-forum\.onrender\.com\/api" : "http:\/\/localhost:5000\/api"\);/g;
const newStr = 'const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");';

let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.match(oldRegex)) {
    content = content.replace(oldRegex, newStr);
    fs.writeFileSync(f, content, 'utf8');
    count++;
    console.log("Updated", f);
  }
});

console.log(`Updated ${count} files.`);
