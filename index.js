#! /usr/bin/env node

var PTPClient = require('./lib/ptp_client.js'),
    SCPConnection = require('./lib/scp_connection.js'),
    CommandExecutor = require('./lib/command_executor.js'),
    Commands = require('./lib/command_builder.js'),
    configWriter = require('./lib/config_writer.js'),
    cli = require('cli').setUsage('PTP run <Path to file> [options...]' + 
      '\n      Runs the selected file on PTP' +
      '\n  PTP sshdeploy <Project Directory> [options...]' +
      '\n      Deploys the selected project to PTP over SSH' +
      '\n  PTP gitdeploy <git repo> [options...]' + 
      '\n      Deploys the selected project to PTP over github' +
      '\n  PTP config' +
      '\n      Sets the config settings for PTP' ),
    options = cli.parse({
      verbose: ['v', 'verbose'],
    });

cli.main(function (args, options) {
  // Configure PTP
  if (args[0] == "config") {
    configWriter.config();
  } else {

  // Create a remote connection service (scpConn) and a shell command service (commandExecutor)
    var config = require('./config.json'),
        scpConn = new SCPConnection(config.host, config.username, config.password, config.remoteDirectory),
        commandExecutor = new CommandExecutor(config.host, config.username, config.sshPub);

    if (args[0] == "run") {
      var ptpClient = new PTPClient(scpConn, commandExecutor);
      var re = new RegExp("([^\/]*\/+)(.*)");
      var scriptPath = args[1];
      var localDirectory = scriptPath.match(re)[1]
      var scriptPath = scriptPath.match(re)[2]
      
      ptpClient.shell(Commands.runScript(localDirectory, config.remoteDirectory, scriptPath), {verbose:options.verbose})
    }

    else if (args[0] == "sshdeploy") {
      var ptpClient = new PTPClient(scpConn, commandExecutor);
      var re = new RegExp("([^\/]*\/+)(.*)");
      var scriptPath = args[1];
      var localDirectory = scriptPath.match(re)[1]

      ptpClient.send(localDirectory, config.projectArchive, function () {
        ptpClient.shell(Commands.sshDeploy(localDirectory, config.projectArchive, config.remoteDirectory, scriptPath), {verbose:options.verbose})
      })
    }

    // You can also deploy with git
    else if (args[0] == "gitdeploy") {
      var ptpClient = new PTPClient(null, commandExecutor);
      var re = new RegExp(".*\/(.*).git$")
      var giturl = args[1];
      var repo = giturl.match(re)[1];
      var deploy = ptpClient.shell(Commands.gitDeploy(giturl, repo, config.remoteDirectory), {verbose:options.verbose});
    }
  }
});