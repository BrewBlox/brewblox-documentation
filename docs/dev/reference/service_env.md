# Service Env Options

Brewblox Python services are configured using environment options, prefixed with the service type.
For backwards compatibility, the `command:` section in `docker-compose.yml` is still parsed,
but all newly added options are only available through the environment.

Environment options are case-insensitive, and always have a default value.

`timedelta` types are set in seconds.

Example:

```yaml
services:
  spark-one:
    image: ghcr.io/brewblox/brewblox-devcon-spark:${BREWBLOX_RELEASE}
    environment:
      - BREWBLOX_SPARK_DISCOVERY=lan
      - BREWBLOX_SPARK_DEVICE_ID=c4dd5766bb18
      - BREWBLOX_SPARK_CONNECT_INTERVAL=5
```

## brewblox-devcon-spark

**Prefix: brewblox_spark_**

```py
# Generic options
name: str = ''  # autodetect if not set
debug: bool = False
trace: bool = False
debugger: bool = False

# MQTT options
mqtt_protocol: Literal['mqtt', 'mqtts'] = 'mqtt'
mqtt_host: str = 'eventbus'
mqtt_port: int = 1883

state_topic: str = 'brewcast/state'
history_topic: str = 'brewcast/history'
datastore_topic: str = 'brewcast/datastore'
blocks_topic: str = 'brewcast/spark/blocks'

# HTTP client options
http_client_interval: timedelta = timedelta(seconds=1)
http_client_interval_max: timedelta = timedelta(minutes=1)
http_client_backoff: float = 1.1

# Datastore options
datastore_host: str = 'history'
datastore_port: int = 5000
datastore_path: str = '/history/datastore'

datastore_fetch_timeout: timedelta = timedelta(minutes=5)
datastore_flush_delay: timedelta = timedelta(seconds=5)
datastore_shutdown_timeout: timedelta = timedelta(seconds=2)

# Device options
device_id: str | None = None
discovery: DiscoveryType = DiscoveryType.all

device_host: str | None = None
device_port: int = 8332
device_serial: str | None = None

mock: bool = False

simulation: bool = False
simulation_port: int = 0  # any free port
simulation_display_port: int = 0  # any free port
simulation_workdir: Path = Path('./simulator')

# Connection options
connect_interval: timedelta = timedelta(seconds=2)
connect_interval_max: timedelta = timedelta(seconds=30)
connect_backoff: float = 1.5

discovery_interval: timedelta = timedelta(seconds=5)
discovery_timeout: timedelta = timedelta(minutes=2)
discovery_timeout_mqtt: timedelta = timedelta(seconds=3)
discovery_timeout_mdns: timedelta = timedelta(seconds=20)

subprocess_connect_interval: timedelta = timedelta(milliseconds=200)
subprocess_connect_timeout: timedelta = timedelta(seconds=10)

handshake_timeout: timedelta = timedelta(minutes=2)
handshake_ping_interval: timedelta = timedelta(seconds=2)

# Command options
command_timeout: timedelta = timedelta(seconds=20)

# Broadcast options
broadcast_interval: timedelta = timedelta(seconds=5)

# Firmware options
skip_version_check: bool = False

# Backup options
backup_interval: timedelta = timedelta(hours=1)
backup_retry_interval: timedelta = timedelta(minutes=5)
backup_root_dir: Path = Path('./backup')

# Time sync options
time_sync_interval: timedelta = timedelta(minutes=15)
time_sync_retry_interval: timedelta = timedelta(seconds=10)

# Firmware flash options
flash_ymodem_timeout: timedelta = timedelta(seconds=30)
flash_disconnect_timeout: timedelta = timedelta(seconds=20)
```

## brewblox-history

**Prefix: brewblox_history_**

```py
name: str = 'history'
debug: bool = False
debugger: bool = False

mqtt_protocol: Literal['mqtt', 'mqtts'] = 'mqtt'
mqtt_host: str = 'eventbus'
mqtt_port: int = 1883

redis_host: str = 'redis'
redis_port: int = 6379

victoria_protocol: Literal['http', 'https'] = 'http'
victoria_host: str = 'victoria'
victoria_port: int = 8428
victoria_path: str = Field(default='/victoria', pattern=r'^(|/.+)$')

history_topic: str = 'brewcast/history'
datastore_topic: str = 'brewcast/datastore'

ranges_interval: timedelta = timedelta(seconds=10)
metrics_interval: timedelta = timedelta(seconds=10)
minimum_step: timedelta = timedelta(seconds=10)

query_duration_default: timedelta = timedelta(days=1)
query_desired_points: int = 1000
```

## brewblox-auth

**Prefix: brewblox_auth_**

```py
name: str = 'auth'
debug: bool = False
enabled: bool = True
ignore: str = ''
valid_duration: timedelta = timedelta(days=7)
```

## brewblox-tilt

**Prefix: brewblox_tilt_**

```py
name: str = 'tilt'
debug: bool = False

mqtt_protocol: Literal['mqtt', 'mqtts'] = 'mqtt'
mqtt_host: str = 'eventbus'
mqtt_port: int = 1883

lower_bound: float = 0.5
upper_bound: float = 2
scan_duration: float = 5
inactive_scan_interval: float = 5
active_scan_interval: float = 10
simulate: list[str] = Field(default_factory=list)
```

## brewblox-hass

**Prefix: brewblox_hass_**

```py
name: str = 'hass'
debug: bool = False
debugger: bool = False

mqtt_protocol: Literal['mqtt', 'mqtts'] = 'mqtt'
mqtt_host: str = 'eventbus'
mqtt_port: int = 1883

hass_mqtt_protocol: Literal['mqtt', 'mqtts'] = 'mqtt'
hass_mqtt_host: str = 'eventbus'
hass_mqtt_port: int = 1883

state_topic: str = 'brewcast/state'
```

For backwards compatibility, two **non-prefixed** environment values are supported:

```py
mqtt_username: str | None = None
mqtt_password: str | None = None
```
