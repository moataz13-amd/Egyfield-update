const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      if (content.includes('EgyField')) {
        content = content.replace(/EgyField/g, 'Delta Harvest');
        modified = true;
      }
      if (content.includes('egyfield')) {
        content = content.replace(/egyfield/g, 'deltaharvest');
        modified = true;
      }
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'server'));
