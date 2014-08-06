var scpConn = require('scp2')

function SCPConnection (host, username, password, projectDirectory) {
  /**
  Instance of remote connection
  Implements the sendFile method which sends a file to the host server
  **/
  this._host = host;
  this._username = username;
  this._password = password;
  this._projectDirectory = projectDirectory;
}

SCPConnection.prototype.sendFile = function (fileName, callback) {
  /**
  Sends the selected file to the project directory
  **/
  scpConn.scp(fileName, {
      host: this._host,
      username: this._username,
      password: this._password,
      path: this._projectDirectory
  }, callback);
}

module.exports = SCPConnection;