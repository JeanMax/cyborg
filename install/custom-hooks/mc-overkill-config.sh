
source ../config

if [ "$NEW_USER" == "mc" ]; then
	pacman -S --needed $(< mc-extra-packages.list) --noconfirm
	pacman -Rns man-db man-pages --noconfirm
	rm -rf /usr/lib/python3.6/test /usr/share/{doc,info,man}/*

	rm -f /{home/$NEW_USER,root}/.bashrc
	git clone https://github.com/jeanmax/config-files \
		/root/config-files
	/root/config-files/install.sh --no-private

	emacs -nw --kill || true
	cp -r /root/config-files /home/$NEW_USER/config-files
	chown -R $NEW_USER:users /home/$NEW_USER/config-files
	su $NEW_USER -c \
	   "/home/$NEW_USER/config-files/install.sh --no-private"
	rm -rf /root/config-files
	ln -sv /home/$NEW_USER/config-files /root/config-files
fi
