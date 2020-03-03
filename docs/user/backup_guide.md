# Configuration backups

It is often useful to create backups of your settings. You may wish to migrate Brewblox to a different host, or simply be prepared for possible SD card failures.

For these scenarios, it is possible to create and load backups of your Brewblox settings and databases.

## How to

Backups are both made and loaded using the brewblox-ctl commandline tool.

To create a backup, use the `backup save` command.

```
brewblox-ctl backup save
```

This will create a new zip archive in the `backups/` directory inside your Brewblox directory. The file name includes the current date and time.

To load settings from a backup, use the `backup load [ARCHIVE]` command,
and run brewblox-ctl update to migrate any outdated settings.

```
brewblox-ctl backup load /home/pi/brewblox/backup/brewblox_backup_20200303_1433.zip
brewblox-ctl update
```

## Content

The backup archive includes the following:
- .env
- docker-compose.yml
- Datastore databases
  - Dashboards
  - Widgets
  - Block names
  - Builder layouts
- Exported Spark blocks

**NOT** included in the backup archive:
- History data
- Docker images

## Transferring backup files (Windows)

The easiest way to transfer files from your Pi to your own computer is to use SCP.
Windows users can use [this guide](https://it.cornell.edu/managed-servers/transfer-files-using-putty) to install PuTTY SCP.

To copy all backup archives from the Pi to your computer, run the following commands in CMD:

``` bash
cd %userprofile%/documents
mkdir brewblox_backup

pscp pi@RASPBERRY_IP:/home/pi/brewblox/backup/* ./brewblox_backup/
```

This will copy all files to the Documents directory in Windows.

## Transferring backup files (Mac/Linux)

SCP comes pre-installed on Mac and Linux computers.

To copy all backup archives, run the following command:

```
cd ~/Documents
mkdir brewblox_backup

scp pi@RASPBERRY_IP:/home/pi/brewblox/backup/* ./brewblox_backup/
```

## Limitations

Backups make a copy of your settings, not a snapshot of your entire system. Backups cannot be used to revert to an earlier Brewblox release.

After loading an old backup, it is advisable to run `brewblox-ctl update` to migrate your configuration to the latest version.


## Automatically creating backups

You can use [cron](https://www.cyberciti.biz/faq/how-do-i-add-jobs-to-cron-under-linux-or-unix-oses/) to automatically run scripts daily/weekly/hourly.

For example, to create weekly backups:

```
crontab -u $USER -e
```

Choose Nano as editor, and append the following line to the file:

```
@weekly (cd $HOME/brewblox; /usr/bin/python3 -m brewblox_ctl backup save)
```

Press ctrl+X to save and exit.

If you now run `crontab -l`, you should see the file, including the line you just added.
