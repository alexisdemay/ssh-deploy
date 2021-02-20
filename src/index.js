#!/usr/bin/env node
const nodeRsync = require('rsyncwrapper');

const { validateRsync, validateInputs } = require('./rsyncCli');
const { addSshKey } = require('./sshKey');
const { isExistingFileOrDir } = require('./helpers');

const {
  REMOTE_HOST, REMOTE_USER,
  REMOTE_PORT, SSH_PRIVATE_KEY, DEPLOY_KEY_NAME,
  SOURCE, TARGET, ARGS,
  GITHUB_WORKSPACE
} = require('./inputs');

const defaultOptions = {
  ssh: true,
  sshCmdArgs: ['-o StrictHostKeyChecking=no'],
  recursive: true
};

console.log('[general] GITHUB_WORKSPACE: ', GITHUB_WORKSPACE);

const sshDeploy = (() => {
  const rsync = ({ privateKey, port, src, dest, args }) => {
    const hardcodedTarget = '/home/velocity';
    console.log(`[Rsync] Starting Rsync Action: ${src} to ${dest}`);
    console.log(`[Rsync] Starting Rsync Action: ${src} to ${hardcodedTarget}`);

    try {
      // RSYNC COMMAND
      nodeRsync({
        src, hardcodedTarget, args, privateKey, port, ...defaultOptions
      }, (error, stdout, stderr, cmd) => {
        if (error) {
          console.error('⚠️ [Rsync] error: ', error.message);
          console.log('⚠️ [Rsync] stderr: ', stderr);
          console.log('⚠️ [Rsync] stdout: ', stdout);
          console.log('⚠️ [Rsync] cmd: ', cmd);
          process.abort();
        } else {
          console.log('✅ [Rsync] finished.', stdout);
        }
      });
    } catch (err) {
      console.error('⚠️ [Rsync] command error: ', err.message, err.stack);
      process.abort();
    }
  };

  const init = ({ src, dest, args, host = 'localhost', port, username, privateKeyContent }) => {
    console.log(`Check that src file/directory exists: ${src}`);
    const srcFileOrDirExists = isExistingFileOrDir(src);
    if (!srcFileOrDirExists) {
      process.abort();
    }

    validateRsync(() => {
      const privateKey = addSshKey(privateKeyContent, DEPLOY_KEY_NAME || 'deploy_key');
      const remoteDest = `${username}@${host}:${dest}`;

      rsync({ privateKey, port, src, dest: remoteDest, args });
    });
  };

  return {
    init
  };
})();

const run = () => {
  validateInputs({ SSH_PRIVATE_KEY, REMOTE_HOST, REMOTE_USER });

  sshDeploy.init({
    src: `${GITHUB_WORKSPACE}/${SOURCE || ''}`,
    dest: TARGET || `/home/${REMOTE_USER}/`,
    args: ARGS ? [ARGS] : ['-rltgoDzvO'],
    host: REMOTE_HOST,
    port: REMOTE_PORT || '22',
    username: REMOTE_USER,
    privateKeyContent: SSH_PRIVATE_KEY
  });
};

run();
