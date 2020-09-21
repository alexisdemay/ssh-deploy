const { existsSync, mkdirSync, writeFileSync } = require('fs');

const {
  GITHUB_WORKSPACE
} = process.env;

const validateDir = (dir) => {
  if (!existsSync(dir)) {
    console.log(`[SSH] Creating ${dir} dir in `, GITHUB_WORKSPACE);
    mkdirSync(dir);
    console.log('✅ [SSH] dir created.');
  } else {
    console.log(`[SSH] ${dir} dir exist`);
  }
};

const validateFile = (filePath) => {
  if (!existsSync(filePath)) {
    console.log(`[SSH] Creating ${filePath} file in `, GITHUB_WORKSPACE);
    try {
      writeFileSync(filePath, '', {
        encoding: 'utf8',
        mode: 0o600
      });
      console.log('✅ [SSH] file created.');
    } catch (e) {
      console.error('⚠️ [SSH] writeFileSync error', filePath, e.message);
      process.abort();
    }
  } else {
    console.log(`[SSH] ${filePath} file exist`);
  }
};

const os = {
  win: process.platform === 'win32',
  linux: process.platform === 'linux',
  mac: process.platform === 'darwin'
};

module.exports = {
  os,
  validateDir,
  validateFile
};
