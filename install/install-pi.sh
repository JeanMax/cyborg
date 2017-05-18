#!/bin/bash

# https://archlinuxarm.org/platforms/armv7/broadcom/raspberry-pi-2
# https://wiki.archlinux.org/index.php/Raspberry_Pi#QEMU_chroot

# optional dependencies: arch-chroot binfmt-support qemu-user-static

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# default values for config var
PI_DEVICE=/dev/mmcblk0
PI_VERSION=1
LOG_DIR="$HERE/log"
DOWNLOAD_DIR="$HERE/download"
MOUNT_DIR=/mnt
# unused in this script, except for begining confirmation
NEW_USER=pi
NEW_HOSTNAME=cyborgberry
AP_SSID=Zboub
AP_PASSWORD=zboub974

source "$HERE/config"
PI="$MOUNT_DIR/pi_root"

CLR_BLACK="\033[30;01m"
CLR_RED="\033[31;01m"
CLR_GREEN="\033[32;01m"
CLR_YELLOW="\033[33;01m"
CLR_BLUE="\033[34;01m"
CLR_MAGENTA="\033[35;01m"
CLR_CYAN="\033[36;01m"
CLR_WHITE="\033[37;01m"
CLR_RESET="\033[0m"


function mount_filesystem() {
	if ! $(mount | grep -q $PI_DEVICE); then
		mkdir -p $PI

		mount "$PI_DEVICE"p2 $PI
		mount "$PI_DEVICE"p1 $PI/boot
	fi
}

function umount_filesystem() {
	sync
	umount -R $PI
	rmdir $PI
}


function create_filesystem() {
	dd if=/dev/zero of=$PI_DEVICE bs=512 count=63
	#TODO: do we need to erase the partitions if the next command fails?
	sfdisk --delete $PI_DEVICE || true # --delete doesn't exist on debian...
	sfdisk $PI_DEVICE <<EOF
start=2048, size=204800, type=c
start=206848, type=83
EOF
	mkfs.vfat "$PI_DEVICE"p1
	mkfs.ext4 "$PI_DEVICE"p2
}

function download_and_extract() {
	mkdir -p $MOUNT_DIR/{pi_boot,pi_root}

	mount "$PI_DEVICE"p2 $MOUNT_DIR/pi_root
	mount "$PI_DEVICE"p1 $MOUNT_DIR/pi_boot

	if [ "$PI_VERSION" == "1" ]; then
		archive=ArchLinuxARM-rpi-latest.tar.gz
	else
		archive=ArchLinuxARM-rpi-2-latest.tar.gz
	fi
	archive_url=http://os.archlinuxarm.org/os

	mkdir -p $DOWNLOAD_DIR
	test -e $DOWNLOAD_DIR/$archive || wget $archive_url/$archive -O $DOWNLOAD_DIR/$archive
	#TODO: the next command throw weird errors on debian, but works... it would be nice to catch if it actually fails
	bsdtar -xpf $DOWNLOAD_DIR/$archive -C $MOUNT_DIR/pi_root || true
	sync

	mv $MOUNT_DIR/pi_root/boot/* $MOUNT_DIR/pi_boot
	sync
	umount $MOUNT_DIR/pi_boot
	rmdir $MOUNT_DIR/pi_boot
	mount "$PI_DEVICE"p1 $MOUNT_DIR/pi_root/boot
}

function customize() {
	mount_filesystem

	cyborg_dir=/root/cyborg
	install_dir=install #TODO: grep $HERE or something?
	customize_script=customize-pi.sh
	if [ ! -e $PI/$cyborg_dir ]; then
		# inception
		git clone https://github.com/jeanmax/cyborg $PI/$cyborg_dir
		rm -rf $PI/$cyborg_dir/$install_dir
		cp -a $HERE $PI/$cyborg_dir/$install_dir
		chmod 755 $PI/$cyborg_dir/$install_dir/$customize_script
		test -e /usr/bin/qemu-arm-static \
			&& cp /usr/bin/qemu-arm-static $PI/usr/bin
		sync
	fi

	if $(hash arch-chroot) && [ -e $PI/usr/bin/qemu-arm-static ]; then
		arch-chroot $PI $cyborg_dir/$install_dir/$customize_script
	else
		echo -e $CLR_RED"arch-chroot and/or qemu-arm-static not found.
"$CLR_WHITE"The $customize_script script has been copied to your raspberry in $cyborg_dir/$install_dir folder. Run it over ssh!
(user:'alarm' password:'alarm' root-password:'root')"$CLR_RESET
		#TODO: hook the script in systemd with netword dep?
	fi

	rm -rf $DOWNLOAD_DIR
	umount_filesystem
}


if (( EUID != 0 )); then
	echo -e $CLR_RED"This script should be run as root!"$CLR_RESET >& 2
	exit 1
fi


echo -e "Here's a little lsblk, so everybody knows what we're talking about:"$CLR_WHITE
lsblk

echo -e $CLR_RESET"
Config:
-hardware stuffs (cf. lsblk for PI_DEVICE)
"$CLR_BLUE"PI_VERSION:"$CLR_WHITE$PI_VERSION$CLR_RESET"
"$CLR_BLUE"PI_DEVICE:"$CLR_WHITE$PI_DEVICE$CLR_RESET"

-username/hostname to create on the raspberry
"$CLR_BLUE"NEW_USER:"$CLR_WHITE$NEW_USER$CLR_RESET"
"$CLR_BLUE"NEW_HOSTNAME:"$CLR_WHITE$NEW_HOSTNAME$CLR_RESET"

-wifi access point (the one we'll create)
"$CLR_BLUE"AP_SSID:"$CLR_WHITE$AP_SSID$CLR_RESET"
"$CLR_BLUE"AP_PASSWORD:"$CLR_WHITE$AP_PASSWORD$CLR_RESET"

-where stuffs happen
"$CLR_BLUE"LOG_DIR:"$CLR_WHITE$LOG_DIR$CLR_RESET"
"$CLR_BLUE"DOWNLOAD_DIR:"$CLR_WHITE$DOWNLOAD_DIR$CLR_RESET"
"$CLR_BLUE"MOUNT_DIR:"$CLR_WHITE$MOUNT_DIR$CLR_RESET"

We'll basically "$CLR_RED"nuke"$CLR_RESET" the PI_DEVICE, you've been warn.
Continue? (y/N)"

read -p "> " ANSWER;
case "$ANSWER" in
	[Yy]|[Yy][Ee][Ss] ) ;;
	* ) exit ;;
esac;


FUN_LIST="create_filesystem
download_and_extract
customize"

mkdir -p $LOG_DIR
for fun in $FUN_LIST; do
	log="$LOG_DIR/install-pi_$fun.log"
	if [ -f "$log" ]; then
		echo -e $CLR_GREEN"$fun already done!"$CLR_RESET
	else
		set -ex
		$fun |& tee $log.tmp
		test ${PIPESTATUS[0]} -eq 0
		mv "$log.tmp" "$log"
		set +ex
	fi
done
