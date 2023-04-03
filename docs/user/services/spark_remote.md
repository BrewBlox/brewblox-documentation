# (Experimental) Remote Spark connections

- Remote connections: what if Spark is in a different building?
- Controllers call in to the server -> only need to open port there.
- SSL + password login on server side.
- MQTT for centralized communication
- Setup:
  - Discover Spark using mDNS
  - Generate password for MQTT login
  - Set username + password for MQTT login on eventbus side
  - Send eventbus address and generated password to Spark
