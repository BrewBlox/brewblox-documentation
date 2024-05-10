# Removing things

It's possible to remove blocks without removing widgets, and vice versa.
For an in-depth explanation of why this can happen, see [this page](./blocks_architecture.md).

This guide explains how and where to remove widgets, blocks, services, or your entire system.

There are multiple options. We'll go from least to most drastic.

## Remove a block widget

![Widget actions](../images/widget-actions.png)

When you click the action menu on a widget, you'll see this menu.
Among other options, you can choose to remove the widget.

![Removing a widget](../images/removing-widget.png)

Whenever you remove a block widget from a dashboard, this dialog appears.

If you leave the second box unchecked, the widget will disappear from the dashboard, but the block will still exist on the controller. You can find it again on the spark service page.
Check the box to also remove the block on the controller - it will automatically disappear from the service page.

## Remove a block

![Removing a block](../images/removing-block.png)

On the spark service page, you'll notice that the action menu is somewhat different.
The option to remove the widget is gone, and instead you can immediately remove the block.

This will remove the block from the controller. If you have a block widget for this block on a dashboard, it will now show an error.

## Spark service actions

![Service actions](../images/spark-actions.png)

On the spark service page, you can find a dropdown menu with service actions. Many of these are useful for managing blocks on the controller.

## Remove all blocks

In the spark service actions, you can choose to remove all blocks. This does as promised: it removes all blocks on your controller, and all block names from the datastore.

It will not remove any widgets or Builder parts linked to those blocks.

## Import/Export blocks

![Import/Export blocks](../images/import-export-blocks.png)

Accessed from the spark service actions, you can use this menu to download or upload a JSON file containing all blocks.

If you import blocks, all blocks will be removed before importing those from the file. If you export blocks, the blocks on the controller will not be changed.

## Remove Spark service

![brewblox-ctl service remove](../images/removing-service-ctl.png)

There are two steps to removing a Spark service: removing it on the Pi, and removing it in the UI.

To remove it on the Pi, run `brewblox-ctl service remove -n <SERVICE_NAME>`.
To remove it in the UI, navigate to the admin page, expand the service, and select `Remove service`.

This will remove the service, but not the blocks on the controller. For that to happen, remove all blocks before removing the service.

## Reinstall Brewblox from scratch

To completely wipe all blocks, history data, dashboards, and widgets:

First **remove all blocks** (spark service page, action menu).
Then run the following commands in the brewblox directory on your Pi:

(Assuming you chose the default install directory name `brewblox/`)

```sh
brewblox-ctl down
cd ..
sudo rm -rf ./brewblox/
```

You can then use `brewblox-ctl install` and `brewblox-ctl setup` to reinstall your system.
