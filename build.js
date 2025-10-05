const fs = require('fs');
const path = require('path');

// Создаем папку public если её нет
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Функция для копирования файлов и папок
function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Копируем все необходимые файлы
const filesToCopy = [
  'index.html',
  'tonconnect-manifest.json'
];

const foldersToCopy = [
  'css',
  'js', 
  'images',
  'fonts',
  'assets'
];

// Копируем файлы
filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('public', file));
    console.log(`Copied: ${file}`);
  }
});

// Копируем папки
foldersToCopy.forEach(folder => {
  if (fs.existsSync(folder)) {
    copyRecursiveSync(folder, path.join('public', folder));
    console.log(`Copied folder: ${folder}`);
  }
});

console.log('Build completed successfully!');
