PTP-Client
==========

Client for the Portable Tessel Platform. This client allows you to run tessel modules on various other platforms such as the cubieboard and the raspberry pi. 

###Installation
```sh
npm install -g ptp-client
```

###Uninstallation
```sh
npm -g rm ptp-client
```

###Getting started
####Preparing module for PTP
To configure an existing tessel module to run on the PTP, you'll need to make some small modifications to the driver. You will have to update the package.json to use ptp-tessel, update any files that reference tessel to use ptp-tessel, and you will need to modify any code which runs on tessel but does not run on V8. We will now modify the [ble-ble113a](https://github.com/tessel/ble-ble113a) module to run on PTP.

First, download the module
```sh
git clone https://github.com/tessel/ble-ble113a.git && cd ble-ble113a
```

Next, open up the module. Lets start by modifying the package.json file so the dependencies section by replacing tessel with ptp-tessel. It should now look like this
```json
"dependencies": {
    "bglib" : "^0.0.6",
    "async" : "^0.9.0",
    "ptp-tessel" : "*"
  },
```

Modify ble-dfu.js and ble-advertise.js my replacing ```require('tessel')``` with ```require('ptp-tessel')``` and run npm install.

We're all done modifying the module to run on PTP. Now we just need to setup ssh to deploy and run scripts to the board.

####Setup SSH Keys
You need to setup a public ssh key to send commands to the PTP. Since you're using github, its likely that you already have ssh keys setup. If not go [here](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2) to learn how to setup your public ssh key. 

Once you have your public ssh key, run the following command with user set to the username of your board e.g. cubie for cubieboards and set <ip> to the ip address of your board.

```sh
ssh-copy-id user@<ip>
```

If you don't have ssh-copy-id installed, go [here](https://github.com/beautifulcode/ssh-copy-id-for-OSX) to install the command line tool.

Great, you have SSH keys setup with your board. All we need to do now is configure the PTP client and we're good to go.

####Configure PTP
To configure the PTP client all you need to do is run 
```sh
PTP config
```

It will prompt you for the following information:
* host: The ip address of the board you want to deploy to.
* username: The username for the board. For example, on the cubieboard, the username would be cubie.
* password: The password for the board. For example, on the cubieboard, the password is probably also cubie.
* sshPub: The absolute path to your public ssh key. For example, my path is /Users/nlintz/.ssh/id_rsa . You should probably replace nlintz with your own username.

####Deploy and Run
Now that we have a script ready to deploy and we have our ssh keys setup we can easily deploy our project using the PTP client.

First make sure you are in a parent directory of where you cloned the ble module. For example, if the ble module was cloned to ~/Desktop, cd into ~/Desktop. Now run 
```sh
PTP sshdeploy ble-ble113a/ -v
```
The v flag stands for verbose. It will let us see the output of the PTP client as it deploys our code. Now that our code is on the board, its easy to run. Type
```sh
PTP run ble-ble113a/examples/ble-advertise.js -v
```
This will run the ble-advertise example script, again with the verbose flag set so we can see the stdout on the board as the code runs.

Congratulations, you have PTP setup and you're ready to go. If you hate deploying code over ssh for some reason and would rather use git, its no problem. Instead of using the sshdeploy command you can run

```sh
PTP gitdeploy <git clone url> -v
``` 

If we wanted to run the ambient-attx module, for example, we would run PTP gitdeploy https://github.com/tessel/ambient-attx4.git -v.