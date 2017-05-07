#!/bin/bash

# https://archlinuxarm.org/platforms/armv7/broadcom/raspberry-pi-2

# DEPS: arch-chroot binfmt-support qemu-user-static

NEW_USER=gui
DEVICE=/dev/mmcblk0
TARGET=/mnt
LOG_FOLDER=/tmp

PI=$TARGET/pi_root

function mount_filesystem() {
	if ! $(mount | grep -q $DEVICE); then
		mkdir -p $PI

		mount "$DEVICE"p2 $PI
		mount "$DEVICE"p1 $PI/boot
	fi
}

function umount_filesystem() {
	sync
	umount -R $PI
	rmdir $PI
}


function create_filesystem() {
	# hahah sorry
	dd if=/dev/zero of=$DEVICE bs=1M count=32 iflag=fullblock
	echo 'o
p
n
p
1

+100M
t
c
n
p
2


w' | fdisk $DEVICE

	mkfs.vfat "$DEVICE"p1
	mkfs.ext4 "$DEVICE"p2
}

function download_and_extract() {
	mkdir -p $TARGET/{pi_boot,pi_root}

	mount "$DEVICE"p2 $TARGET/pi_root
	mount "$DEVICE"p1 $TARGET/pi_boot

	if [ "$NEW_USER" == "mc" ]; then
		archive=ArchLinuxARM-rpi-latest.tar.gz
	else
		archive=ArchLinuxARM-rpi-2-latest.tar.gz
	fi
	archive_url=http://os.archlinuxarm.org/os

	test -e $TARGET/$archive || wget $archive_url/$archive -O $TARGET/$archive
	bsdtar -xpf $TARGET/$archive -C $TARGET/pi_root
	cp /usr/bin/qemu-arm-static $TARGET/pi_root/usr/bin
	sync

	mv $TARGET/pi_root/boot/* $TARGET/pi_boot
	sync
	umount $TARGET/pi_boot
	rmdir $TARGET/pi_boot
	mount "$DEVICE"p1 $TARGET/pi_root/boot
}

function customize() {
	mount_filesystem

	if [ "$NEW_USER" == "mc" ]; then
		packages="emacs-nox zsh zsh-completions zsh-syntax-highlighting clang llvm make gdb grc git peda beep mlocate patch zip unzip dwdiff rsync ruby sudo traceroute autoconf automake bc cmake ctags colorgcc gcc rlwrap base-devel diffutils openssh nfs-utils wget create_ap"
	else
		packages="zsh zsh-completions mlocate patch zip unzip rsync sudo bc base-devel diffutils openssh nfs-utils wget create_ap"
	fi

	arch-chroot $PI pacman -Sy --noconfirm
	arch-chroot $PI pacman-key --init
	arch-chroot $PI pacman -S --needed archlinux-keyring --noconfirm
	arch-chroot $PI pacman-key --populate archlinux
	arch-chroot $PI pacman -Syu --noconfirm
	arch-chroot $PI pacman -S --needed $packages --noconfirm

	# misc system config
	# arch-chroot $PI loadkeys fr
	echo "KEYMAP=fr-latin1" > $PI/etc/vconsole.conf
	sed -i 's/#\(Color\)/\1/' $PI/etc/pacman.conf
	rm $PI/etc/localtime
	arch-chroot $PI ln -s /usr/share/zoneinfo/Europe/Paris /etc/localtime
	# arch-chroot $PI timedatectl set-local-rtc 0
	sed -i 's/#\(en_US\.UTF-8\)/\1/' $PI/etc/locale.gen
	# arch-chroot $PI locale-gen

	# create new user
	arch-chroot $PI useradd -m -g users -G wheel -s /bin/zsh $NEW_USER
	arch-chroot $PI chsh -s /bin/zsh
    echo "$NEW_USER:$NEW_USER" | arch-chroot $PI chpasswd
    echo "root:$NEW_USER" | arch-chroot $PI chpasswd
	arch-chroot $PI userdel alarm
	rm -rf $PI/home/alarm
	sed -i 's/^\(%wheel ALL=(ALL) ALL\)/# \1/' $PI/etc/sudoers
	sed -i 's/# \(%wheel ALL=(ALL) NOPASSWD: ALL\)/\1/' $PI/etc/sudoers
	# arch-chroot $PI hostnamectl set-hostname "cyborgberry"

	# mc's overkill config
	if [ "$NEW_USER" == "mc" ]; then
		arch-chroot $PI rm -f /{home/$NEW_USER,root}/.bashrc
		arch-chroot $PI git clone https://github.com/jeanmax/config-files \
					/root/config-files
		arch-chroot $PI /root/config-files/install.sh --no-private

		arch-chroot $PI emacs -nw --kill || true
		arch-chroot $PI cp -r /root/config-files /home/$NEW_USER/config-files
		arch-chroot $PI chown -R $NEW_USER:users /home/$NEW_USER/config-files
		arch-chroot $PI su $NEW_USER -c \
					"/home/$NEW_USER/config-files/install.sh --no-private"
		arch-chroot $PI rm -rf /root/config-files
		arch-chroot $PI ln -sv /home/$NEW_USER/config-files /root/config-files
	fi

	# create wifi access-point
	cat <<EOF > $PI/etc/systemd/system/create_ap.service
[Unit]
Description=Create AP at startup
After=network.target

[Service]
ExecStart=/usr/bin/create_ap wlan0 wlan0 Zboub zboub974

[Install]
WantedBy=multi-user.target
EOF
	arch-chroot $PI systemctl enable create_ap.service


	# yaourt
	# wget https://aur.archlinux.org/cgit/aur.git/snapshot/package-query.tar.gz
	# tar -xvzf package-query.tar.gz
	# cd package-query
	# makepkg -si
	# cd ..
	# wget https://aur.archlinux.org/cgit/aur.git/snapshot/yaourt.tar.gz
	# tar -xvzf yaourt.tar.gz
	# cd yaourt
	# makepkg -si

	# cd ../
	# rm -rf package-query/ package-query.tar.gz yaourt/ yaourt.tar.gz
}

function kthxbye() {
	mount_filesystem

	orphans=$(arch-chroot $PI pacman -Qdtq || true)
	test $orphans && arch-chroot $PI pacman -Rns $orphans --noconfirm
	arch-chroot $PI pacman -Sc --noconfirm
	umount_filesystem

	echo "NOOT NOOT!"
}


echo -e "-Target: $TARGET"
du -csh $TARGET
echo -e "\n-Device: $DEVICE"
lsblk

echo -e "\nNoot? (y/N)";
read -p "> " ANSWER;
case "$ANSWER" in
    [Yy]|[Yy][Ee][Ss] ) ;;
    * ) exit ;;
esac;


FUN_LIST="create_filesystem
download_and_extract
customize
kthxbye"

for fun in $FUN_LIST; do
	log="$LOG_FOLDER/install-pi_$fun.log"
	if [ -f "$log" ]; then
		echo "$fun already done!"
	else
		set -ex
		$fun |& tee $log.tmp
		test ${PIPESTATUS[0]} -eq 0
		mv "$log.tmp" "$log"
		set +ex
	fi
done
