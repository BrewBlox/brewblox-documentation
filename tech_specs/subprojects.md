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
* The long-term vision for the product includes it evolving into a generic industrial controller - without a brewery in sight.
* Current naming themes include easily confused terms as "blocks", "blox" and "box".
* It is very likely that future evolutions and spinoffs of the product will want to mix and match the various software components, while adding their own thing.

The C++ controller firmware can continue as is: it has a well-defined interface and set of responsibilities. 
Likewise for the GUI: it is the most specific component, and can easily be swapped out.

This leaves the service layer, which currently has five separate responsibilities, some of which communicate.
* The backend plugins (controlbox, legacy, and external) register endpoint handlers with the REST API.
* The backend plugins publish events to the application event handler.
* The logging database (InfluxDB) registers endpoints with the REST API.
* InfluxDB subscribes to events published to the event handler.
* SSE registers endpoints with the REST API.
* SSE subscribes to events published to the event handler.

REST, SSE, and the event handler are core components of the service layer: everything else can assume these are present.

InfluxDB has no implementation-specific dependencies, and will simply log whatever is given to him. Data input is as simple as logging all published events. REST requests for data queries can also be directly forwarded, without needing an abstraction layer.

The various backends are not sufficiently similar to warrant a shared interface. They should register their own endpoints, and assume that the GUI supports their specific functionality.

Dependency injection of the core components ensures that multiple backends can coexist: the application does not need specific dependencies on plugins - they merely need to implement interface functions for injecting the REST, SSE, and event handler objects.

`flask-plugin` offers generic plugin capability: anything in a defined plugin directory is imported. If it implements the required interfaces, it is available as a plugin component.

## Splitting up

An alternative is to take all components identified above, and split them into micro-services.
The following components would be separate services:
* Each backend.
* The event bus
* InfluxDB
* A router/reverse proxy, acting as a gateway for all REST services

The datastore is specific for each backend, and can be integrated in each separate backend service.

Controllers only need to be aware of the event bus. They have no need for cross-controller communication, and do not directly push data to Influx.

The primary advantage to this approach is that it is very easy to add new controller services. Additional features are that complexity of each service can be kept down: they offer a REST interface, and do one thing. No complex integration patterns required.