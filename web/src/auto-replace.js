const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (fullPath.includes('authFetch') || fullPath.includes('serverFetch') || fullPath.includes('supabase')) continue;

      let modified = false;
      const isClient = content.includes("'use client'") || content.includes('"use client"');

      // Add authFetch import if it has fetch( API_URL ... or /api
      if (content.includes('fetch(') && (content.includes('API_URL') || content.includes('/api/'))) {
        
        const fetchImport = isClient 
          ? "import { authFetch as fetch } from '@/utils/authFetch';"
          : "import { serverFetch as fetch } from '@/utils/serverFetch';";
        
        if (!content.includes('authFetch') && !content.includes('serverFetch')) {
          const lines = content.split('\n');
          let insertIdx = 0;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('use client') || lines[i].startsWith('import ')) {
              insertIdx = i + 1;
            } else if (lines[i].trim() !== '' && !lines[i].startsWith('//')) {
              break;
            }
          }
          lines.splice(insertIdx, 0, fetchImport);
          content = lines.join('\n');
          modified = true;
        }

        // Clean up supabaseUid manually from params
        const oldContent = content;
        content = content.replace(/\?supabaseUid=\$\{.*?\}/g, '');
        content = content.replace(/\?supabaseUid=[a-zA-Z0-9_-]+/g, '');
        content = content.replace(/\&supabaseUid=\$\{.*?\}/g, '');
        content = content.replace(/supabaseUid:\s*[^,]+,?\s*/g, '');

        if (content !== oldContent) modified = true;

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log('Updated:', fullPath);
        }
      }
    }
  }
}

processDir('web/src');
