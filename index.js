#! /usr/bin/env node

var PTPClient = require('./lib/ptp_client.js'),
    SCPConnection = require('./lib/scp_connection.js'),
    CommandExecutor = require('./lib/command_executor.js'),
    Commands = require('./lib/command_builder.js'),
    config = require('./config.js'),
    cli = require('cli').setUsage('PTP run/gitdeploy/sshdeploy <Path To Script Relative To Project Directory>'),
    options = cli.parse({
      verbose: ['v', 'verbose'],
    });

// Create a remote connection service (scpConn) and a shell command service (commandExecutor)
var scpConn = new SCPConnection(config.host, config.username, config.password, config.remoteDirectory);
var commandExecutor = new CommandExecutor(config.host, config.username, config.sshPub);

cli.main(function (args, options) {
  // Main 
  if (args.length < 2) {
    console.log("PTP Requires At Least Three Arguments. Type PTP -h To See Usage");
    return;
  };

  // By Default PTP deploys a tarball via SSH
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
    var scriptPath = scriptPath.match(re)[2]

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
});