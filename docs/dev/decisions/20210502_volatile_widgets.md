# Handling volatile widgets

Date: 2021/05/02

- Scenarios:
  - Dashboard widget (persistent widget)
  - Dashboard block (persistent widget, persistent block)
  - Service page block widget (volatile widget, persistent block)
  - Dialog widget (persistent widget)
  - Dialog block (volatile widget, persistent block)
  - Dialog block widget (persistent widget, persistent block)
  - Wizard widget (volatile widget)
  - Wizard block (volatile widget, volatile block)
  - Wizard block widget (volatile widget, persistent or volatile block)
- Store API
  - setVolatile
  - removeVolatile
  - create
  - remove
  - findById
  - save
- Owner handles set/remove, composition function uses the same API for persistent/volatile
- Components must be aware of volatile flag to show/hide UI buttons
