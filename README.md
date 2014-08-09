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
To configure an existing tessel module to run on the PTP, you'll need to make some small modifications to your module code. I went ahead and made a BLE example advertisement project which uses the Portable Tessel Platform. 

First, download the example project
```sh
git clone https://github.com/nlintz/PTP-modules-ble-advertise
```

The only differences between this project and your typical tessel project is in the package.json. Instead of requiring 'tessel' you need to require 'ptp-tessel'. In addition, you need to add a line to the "scripts" section of the package.json specifying which script you want to run on the board. Since my script was called index.js, my package.json's scripts attribute looks like this:

```json
"scripts" : {
  "start": "sudo node index.js"
}
```

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

First make sure you are in a parent directory of your project directory. For example, if you cloned the ble-advertisement example to ~/Desktop, cd into ~/Desktop. Now run:

```sh
PTP deploy <Project Directory Name>/ -v
```

The v flag stands for verbose. It will let us see the output of the PTP client as it deploys our code. If you are using the ble example, you would have written the command.

```sh
PTP deploy PTP-modules-ble-advertise/ -v
```

You should be seeing your project load onto your Tessel now. After its done loading, it will run the script you specified in your package.json.

Congratulations, you have PTP setup and you're ready to go. If you hate deploying code over ssh for some reason and would rather use git, it's no problem. Instead of deploying over ssh, you can instead run

```sh
PTP deploy <git clone url> -v
``` 

If we wanted to run the ble example project, you could run ```PTP deploy https://github.com/nlintz/PTP-modules-ble-advertise.git``` -v .

Once you have your project deployed to your board, you can restart the program without uploading your code again by running:

```
PTP restart -v
```