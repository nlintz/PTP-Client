var fs = require('fs'),
    path = require('path'),
    prompt = require('prompt');

function getConfigOptions () {
  var options = {
    host: '', 
    username:'', 
    password: '', 
    sshPub: ''
  };

  prompt.start();

  prompt.get(Object.keys(options), function (err, result) {
    if (err) { return onErr(err); }
    result.remoteDirectory = 'ptp_tessel_projects/';
    result.projectArchive = 'project.tar'
    writeConfigOptions(result);
  });
}

function writeConfigOptions (options) {
  var data = JSON.stringify(options);

  fs.writeFile(path.resolve(__dirname, '../config.json'), data, function (err) {
    if (err) {
      console.log('There has been an error saving your configuration data.');
      console.log(err.message);
      return;
    }
    console.log('Configuration saved successfully.')
  });
}

module.exports.config = getConfigOptions;