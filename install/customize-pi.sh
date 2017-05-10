#!/bin/bash

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# default values for config var
NEW_USER=pi
NEW_HOSTNAME=cyborgberry
LOG_DIR="$HERE/log"
DOWNLOAD_DIR="$HERE/download"
AP_SSID=Zboub
AP_PASSWORD=zboub974

source $HERE/config

CLR_BLACK="\033[30;01m"
CLR_RED="\033[31;01m"
CLR_GREEN="\033[32;01m"
CLR_YELLOW="\033[33;01m"
CLR_BLUE="\033[34;01m"
CLR_MAGENTA="\033[35;01m"
CLR_CYAN="\033[36;01m"
CLR_WHITE="\033[37;01m"
CLR_RESET="\033[0m"


function system_config() {
	echo "KEYMAP=fr-latin1" > /etc/vconsole.conf
	sed -i 's/#\(Color\)/\1/' /etc/pacman.conf
	sed -i 's/#\(TotalDownload\)/\1/' /etc/pacman.conf
	sed -i 's|#NoExtract   =|NoExtract = usr/share/help/* !usr/share/help/en* !usr/share/help/fr*\nNoExtract = usr/share/locale/* !usr/share/locale/en/* !usr/share/locale/en_US/* !usr/share/locale/fr* !usr/share/locale/locale.alias\nNoExtract = usr/share/man/* !usr/share/man/man* !usr/share/man/fr*\nNoExtract = usr/share/doc/HTML/* !usr/share/doc/HTML/en/* !usr/share/doc/HMTL/fr/*\nNoExtract = usr/share/X11/locale/* !usr/share/X11/locale/compose.dir !usr/share/X11/locale/locale* !usr/share/X11/locale/en_US.UTF-8/*\n|' /etc/pacman.conf
	unlink /etc/localtime
	ln -s /usr/share/zoneinfo/Europe/Paris /etc/localtime
	sed -i 's/#\(en_US\.UTF-8\)/\1/' /etc/locale.gen
	sed -i 's/#\(fr_FR\.UTF-8\)/\1/' /etc/locale.gen
	gunzip --keep /usr/share/i18n/charmaps/UTF-8.gz
	locale-gen
	cat <<EOF > /etc/locale.conf
LANG=en_US.UTF-8
LANGUAGE=en_US.UTF-8
LC_ADDRESS=en_US.UTF-8
LC_COLLATE=en_US.UTF-8
LC_CTYPE=en_US.UTF-8
LC_IDENTIFICATION=en_US.UTF-8
LC_MEASUREMENT=fr_FR.UTF-8
LC_MESSAGES=en_US.UTF-8
LC_MONETARY=fr_FR.UTF-8
LC_NAME=en_US.UTF-8
LC_NUMERIC=fr_FR.UTF-8
LC_PAPER=fr_FR.UTF-8
LC_TELEPHONE=en_US.UTF-8
LC_TIME=fr_FR.UTF-8
LC_ALL=
EOF
}

function update_and_install_packages() {
	pacman -Sy --noconfirm
	pacman-key --init
	pacman -S --needed archlinux-keyring --noconfirm
	pacman-key --populate archlinux
	pacman -Syu --noconfirm
	pacman -S --needed $(< "$HERE/packages.list") --noconfirm
}

function create_new_user() {
	chsh -s /bin/zsh
	echo "root:$NEW_USER" | chpasswd
	if [ ! "$(id $NEW_USER)" ]; then
		useradd -m -g users -G wheel -s /bin/zsh $NEW_USER
		echo "$NEW_USER:$NEW_USER" | chpasswd
	fi
	if [ "$(id alarm)" ]; then
		userdel alarm || echo -e $CLR_RED"oops... try to ssh as $NEW_USER then run 'userdel alarm' ><"$CLR_RESET
		rm -rf /home/alarm
	fi
	sed -i 's/^\(%wheel ALL=(ALL) ALL\)/# \1/' /etc/sudoers
	sed -i 's/# \(%wheel ALL=(ALL) NOPASSWD: ALL\)/\1/' /etc/sudoers
	echo $NEW_HOSTNAME > /etc/hostname
}

function install_yaourt() {
	package_url=https://aur.archlinux.org/cgit/aur.git/snapshot
	mkdir -p $DOWNLOAD_DIR
	for package in package-query yaourt; do
		cd $DOWNLOAD_DIR
		test -e $DOWNLOAD_DIR/$package.tar.gz \
			|| wget $package_url/$package.tar.gz \
					-O $DOWNLOAD_DIR/$package.tar.gz
		tar -xvzf $DOWNLOAD_DIR/$package.tar.gz
		chown -R $NEW_USER:users $DOWNLOAD_DIR/$package
		mv $DOWNLOAD_DIR/$package /tmp/$package
		cd /tmp/$package
		su $NEW_USER -c "makepkg -si --noconfirm"
		cd
		rm -rf /tmp/$package
	done
	rm -rf $DOWNLOAD_DIR
	unset package_url
}

function create_wifi_access_point() {
	cat <<EOF > /etc/systemd/system/create_ap.service
[Unit]
Description=Create AP at startup
After=network.target

[Service]
ExecStart=/usr/bin/create_ap wlan0 wlan0 $AP_SSID $AP_PASSWORD

[Install]
WantedBy=multi-user.target
EOF
	systemctl enable create_ap.service
}

function custom_hooks() {
	cd $HERE/custom-hooks
	for hook in $(ls *.sh); do
		log="$LOG_DIR/install-pi_$hook.log"
		if [ -f "$log" ]; then
			echo -e $CLR_GREEN"$hook already done!"$CLR_RESET
		else
			set -ex
			bash $hook |& tee $log.tmp
			test ${PIPESTATUS[0]} -eq 0
			mv "$log.tmp" "$log"
			set +ex
		fi
	done
}

function clean() {
	orphans=$(pacman -Qdtq || true)
	test $orphans && pacman -Rns $orphans --noconfirm
	pacman -Scc --noconfirm
	pacman-optimize
	updatedb
}


if (( EUID != 0 )); then
	echo -e $CLR_RED"This script should be run as root!"$CLR_RESET >& 2
	exit 1
fi
if ! $(uname -a | grep -q arm); then
	echo -e $CLR_RED"This script should be run FROM the raspberry! (chroot'ed or over ssh)"$CLR_RESET >& 2
	exit 1
fi


FUN_LIST="system_config
update_and_install_packages
create_new_user
install_yaourt
create_wifi_access_point
custom_hooks
clean"

source $HERE/config
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

echo -e $CLR_GREEN"All good!"$CLR_WHITE
cat <<EOF
You can now access your raspberry trough his own wifi access point.
(SSID:'$AP_SSID' password:'$AP_PASSWORD')
(user:'$NEW_USER' password:'$NEW_USER' root-password:'$NEW_USER')
You might need to reboot...
EOF
echo -ne $CLR_RESET
