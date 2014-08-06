var tar = require('tar'),
    fstream = require("fstream"),
    fs = require("fs"),
    path = require("path"),
    config = require('../config.js')

function PTPClient (remoteConnection, commandExecutor) {
  /**
  PTPClient consumes a remote connection to send files to the host and 
  a command executor to run commands on the remote host. This class is responsible
  for compressing the target directory and run the project on the host
  **/
  this._remoteConnection = remoteConnection;
  this._commandExecutor = commandExecutor;
};

PTPClient.prototype._compressProject = function (inputDir, outputFile, callback) {
  /**
  Packages the project directory as a tarbal
  **/
  var inPath = path.dirname(fs.realpathSync(inputDir))
  var out = fs.createWriteStream(outputFile);
  var stream = fstream.Reader({ path: path.resolve('.', inputDir), type: "Directory" })
    .pipe(tar.Pack({ noProprietary: true }))
    .pipe(out)
  stream.on('close', function () {
    if (callback) {
      callback(); 
    }
  });
};

PTPClient.prototype.send = function (projectDirectory, projectArchive, callback) {
  /**
  Sends a projectDirectory as projectArchive. Runs the command after copying the tarball.
  **/
  console.log("Compressing Project");
  this._compressProject(projectDirectory, projectArchive, function () {
    console.log("Transfering Project");
    this._remoteConnection.sendFile(projectArchive, function (err) {
      if (err) {
        console.log(err)
      }
      if (callback) {
        callback();
      }
    }.bind(this))
  }.bind(this))
};

PTPClient.prototype.shell = function (command, options, callback) {
  this._commandExecutor.execCommand(command, options, callback);
};

module.exports = PTPClient;