# Cbox ReadMode

Date: 2024/05/10

## Context

- already split between read and read_stored
- desired: higher frequency data updates for logging / UI
- merge read functions, and add mode as argument
- add "logged" mode, to include smaller subset of measured data
- mode as separate argument allows firmware to dynamically include/exclude fields
- future implementation:
  - push logged fields on change
  - include user-defined or slow-changing fields only every X messages
