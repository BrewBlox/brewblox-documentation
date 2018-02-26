# Project division

**Note:** See `service_components.txt` for diagrams.

Current state of affairs is that all relevant code is spread over a set of repositories, contained in various accounts.

It needs a more organized setup, but there are some considerations.
* Functionality is logically spread over multiple loosely coupled parts:
    * The controller firmware (C++)
    * The controller <-> service communication layer - multiple variants (Python)
    * (Future) plugins for external hardware not routed through the controller (Python)
    * Various service-side functionality such as object / measurement databases (Pythyon)
    * The Server-Side Events API (Python)
    * The REST API (Python)
    * The GUI (HTML/JS using the Vue/Vuex framework)
    * (Future) Application wrappers around the GUI, making it a mobile or desktop app.
* The platform should stay open for domains other than brewing. Brewing specific implementations should be avoided where generics are possible.
* Current naming themes include easily confused terms as "blocks", "blox" and "box".
* It is very likely that future evolutions and spinoffs of the product will want to mix and match the various software components, while adding their own thing.

The C++ controller firmware can continue as is: it has a well-defined interface and set of responsibilities. 
Likewise for the GUI: it is the most specific component, and can easily be swapped out.

This leaves the service layer, which currently has five separate responsibilities, some of which communicate.
* The backend services (controlbox, legacy, and external) register endpoint handlers with the REST API.
* The backend services publish events to the shared event bus.
* The logging database (InfluxDB) registers endpoints with the REST API.
* InfluxDB subscribes to events published to the event bus.

REST, and the event bus are core components of the service layer: everything else can assume these are present.

InfluxDB has no implementation-specific dependencies, and will simply log whatever is published on relevant event bus topics. Data input is as simple as logging all published events. REST requests for data queries can also be directly forwarded, without needing an abstraction layer.

The various backend service implementations only share endpoints for service health checks, and OpenAPI specs. These are implemented in the generic `brewblox_service`. Everything else they should implement themselves.


## Splitting up

An alternative is to take all components identified above, and split them into micro-services.
The following components would be separate:
* Each backend
* The event bus
* InfluxDB / History service
* (New) A data collation reporting module, that stores more complex grouping of data sets from the history service.
* (New) A deployment supervisor, responsible for starting services, and rewriting Gateway configuration.
* A router/reverse proxy, acting as a gateway for all REST services

The datastore is specific for each backend, and can be integrated in each separate backend service.

Controller services react to REST queries, and firmware events. Data from firmware events is pushed to the event bus, where it can be collected by whomever subscribed to those events.

The primary advantage to this approach is that it is very easy to add new controller services. Additional features are that complexity of each service can be kept down: they offer a REST interface, and do one thing. No complex integration patterns required.
