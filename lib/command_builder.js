function CommandBuilder () {
/**
Builds up a string of commands to run on the host e.g. cd dev && ls dev 
**/
  this._command;
}

CommandBuilder.prototype.getCommandString = function () {
  return this._command;
}

CommandBuilder.prototype.addCommand = function (command) {
  if (this._command) {
    this._command += " && " + command;
  } else {
    this._command = command;
  }
  return this;
}

function extract_tar (remoteDirectory, projectArchive) {
  return 'tar -xf ' + remoteDirectory + projectArchive + ' -C ' + remoteDirectory;
}

function ls () {
  return 'ls'
}

function npmInstall () {
  return 'npm install'
}

function run (scriptName) {
  return 'node ' + scriptName;
}

function cd (dir) {
  return 'cd ' + dir;
}

function mv (src, dest) {
  return 'mv ' + src + ' ' + dest;
}

function gitClone (giturl) {
  return 'git clone ' + giturl;
}

function clean (remoteDirectory, removeTar) {
  if (removeTar) {
    return 'rm -rf ' + remoteDirectory + '*';
  } else {
    return cd(remoteDirectory) + ' && ls | grep -v .tar | xargs rm -rf && ' + cd('..');
  }
}

function sshDeploy(localDirectory, projectArchive, remoteDirectory, scriptPath) {
  var command = new CommandBuilder();
  command.addCommand(clean(remoteDirectory, false));
  command.addCommand(extract_tar(remoteDirectory, projectArchive));
  command.addCommand(cd(remoteDirectory + localDirectory));
  command.addCommand(npmInstall());
  return command.getCommandString();
}

function gitDeploy (giturl, repo, remoteDirectory) {
  var command = new CommandBuilder();
  command.addCommand(clean(remoteDirectory, true));
  command.addCommand(cd(remoteDirectory));
  command.addCommand(gitClone(giturl));
  command.addCommand(cd(repo));
  command.addCommand(npmInstall());
  return command.getCommandString();
}

function runScript (localDirectory, remoteDirectory, scriptPath) {
  var command = new CommandBuilder();
  command.addCommand(cd(remoteDirectory + localDirectory));
  command.addCommand(run(scriptPath));
  return command.getCommandString();
}

module.exports.sshDeploy = sshDeploy;
module.exports.gitDeploy = gitDeploy;
module.exports.runScript = runScript;