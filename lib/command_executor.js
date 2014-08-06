var sshConn = require('ssh2')

function CommandExecutor (host, username, sshPub) {
  /**
  CommandExecutor is a service which executes a command on a remote server
  **/
  this._host = host;
  this._username = username;
  this._sshPub = sshPub;
}

CommandExecutor.prototype._newConnection = function (callback) {
  var sshConnection = new sshConn();

  sshConnection.connect({
    host: this._host,
    port: 22,
    username: this._username,
    privateKey: require('fs').readFileSync(this._sshPub)
  });

  sshConnection.on('ready', function () {
    callback(sshConnection);
  }.bind(this));
};

CommandExecutor.prototype.execCommand = function(command, options, callback) {
  /**
  Takes in a string and executes it on the host e.g. `ls` prints the home directory of host
  **/
  if (typeof options == 'function' || typeof options == 'undefined') {
    callback = options;
    options = {};
  };

  function execute (conn, command, callback) {
    conn.exec(command, {pty: true}, function(err, stream) {
      if (err) throw err;
      stream.on('close', function() {
        if (callback) {
          callback();
        }
        conn.end();
      }).on('data', function(data) {
        if (options.verbose)
          console.log(data.toString());
      }).stderr.on('data', function(data) {
        if (options.verbose)
          console.log(data.toString());
      });
    }.bind(this))
  };

  this._newConnection(function (conn) {
    execute(conn, command, callback);
  })
};

module.exports = CommandExecutor;