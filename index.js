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

    function run (localDirectory) {
      var ptpClient = new PTPClient(scpConn, commandExecutor);      
      ptpClient.shell(Commands.runScript(config.remoteDirectory), {verbose:options.verbose})
    }

    function deploySSH(localDirectory) {
      var ptpClient = new PTPClient(scpConn, commandExecutor);

      ptpClient.send(localDirectory, config.projectArchive, function () {
        ptpClient.shell(Commands.sshDeploy(localDirectory, config.projectArchive, config.remoteDirectory), 
          {verbose:options.verbose}, run.bind(null, config.remoteDirectory))
      })
    }

    // You can also deploy with git
    function deployGit(giturl, repo) {
      var ptpClient = new PTPClient(null, commandExecutor);
      var re = new RegExp(".*\/(.*).git$")
      var giturl = args[1];
      var repo = giturl.match(re)[1];
      ptpClient.shell(Commands.gitDeploy(giturl, repo, config.remoteDirectory), 
        {verbose:options.verbose}, run.bind(null, config.remoteDirectory));
    }

    if (args[0] == "deploy") {
      var gitRegex = new RegExp(".*\/(.*).git$");
      var sshRegex = new RegExp("([^\/]*\/+)(.*)");
      var project = args[1];

      if (project.match(gitRegex)) {
        var repo = project.match(gitRegex)[1];
        deployGit(project, repo);
      } else {
        var localDirectory = project.match(sshRegex)[1];
        deploySSH(localDirectory)
      }
    }

    else if (args[0] == "restart") {
      run(config.remoteDirectory);
    }
  }
});