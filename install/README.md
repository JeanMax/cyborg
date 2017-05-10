# Raspberry Install

* Edit the *config* file according to your needs
* Packages listed in *packages.list* will be installed, you can edit that file too
* You can add custom *.sh* scripts in the *custom-hooks* folder, they will be run at the end of the customization. See existing files in that folder for example
* If you are installing from archlinux, the customization will be done inside chroot. Otherwise, you'll have to finish the customization over ssh (*install-pi.sh* will explain you what to do). *arch-chroot*, *binfmt-support* and *qemu-user-static* are required for chroot install.

> Good luck!


## TL;DR

* ./install-pi.sh
* no arch-chroot?
	* ssh
	* su
	* cd /root/cyborg/install
	* ./customize-pi.sh
