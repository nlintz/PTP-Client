var sshConn = require('ssh2'),
    scpConn = require('scp2')


function SCPConnection (host, username, password, projectDirectory) {
  this._host = host;
  this._username = username;
  this._password = password;
  this._projectDirectory = projectDirectory;
}

SCPConnection.prototype.sendFile = function (fileName, callback) {
  scpConn.scp(fileName, {
      host: this._host,
      username: this._username,
      password: this._password,
      path: this._projectDirectory
  }, callback);
}

module.exports = SCPConnection;