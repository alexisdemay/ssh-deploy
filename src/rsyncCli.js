const { sync: commandExists } = require('command-exists');
const { get: nodeCmd } = require('node-cmd');
const { os } = require('./helpers');

const cmdInstallRsync = () => {
  if (os.mac) {
    return 'brew install rsync';
  }

  if (os.linux) {
    return 'sudo apt-get --no-install-recommends install rsync';
  }

  return '';
};

const validateRsync = (callback = () => {}) => {
  const rsyncCli = commandExists('rsync');

  if (!rsyncCli) {
    const command = cmdInstallRsync();
    if (!command) {
      console.error('⚠️ [CLI] Rsync is not installed. Please install `rsync` and try again. Aborting ... ');
      process.abort();
    }

    nodeCmd(
      command,
      (err, data, stderr) => {
        if (err) {
          console.error('⚠️ [CLI] Rsync installation failed. Aborting ... ', err.message);
          process.abort();
        } else {
          console.log('✅ [CLI] Rsync installed. \n', data, stderr);
          callback();
        }
      }
    );
  } else {
    callback();
  }
};

const validateInputs = (inputs) => {
  const inputKeys = Object.keys(inputs);
  const validInputs = inputKeys.filter((inputKey) => {
    const inputValue = inputs[inputKey];

    if (!inputValue) {
      console.error(`⚠️ [INPUTS] ${inputKey} is mandatory`);
    }

    return inputValue;
  });

  if (validInputs.length !== inputKeys.length) {
    console.error('⚠️ [INPUTS] Inputs not valid, aborting ...');
    process.abort();
  }
};

module.exports = {
  validateRsync,
  validateInputs
};
