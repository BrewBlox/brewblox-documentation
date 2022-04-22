# Plaato Digital Airlock

The [Plaato](https://plaato.io) airlock tracks your fermentation by measuring the gases that pass up through the airlock.

The Plaato service periodically polls the Plaato servers for available data, and pushes values to the Brewblox history database.

## Installation

For the service to access your Plaato data, you'll need an authentication token.

See <https://plaato.io/apps/help-center#!hc-auth-token> on how to get one.

When you have that, run:

```sh
brewblox-ctl add-plaato --name plaato --token {TOKEN}
```

After a minute, you will see the `plaato` fields appear in the Graph widget selection menu.
