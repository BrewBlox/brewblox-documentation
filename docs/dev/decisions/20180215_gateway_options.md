# Options for gateway services in a microservice architecture

Date: 2018/02/15

## Business Case

In the top-level microservice [architecture](./20180206_subprojects) for Brewblox, there are some supporting services.

One of them is the gateway. This gateway should function as a unifying API, reverse-proxying all calls to the relevant services.

A quick stab at implementing it ourselves revealed that doing so would be non-trivial. That means we're looking at option two: finding a library or application that has already done this.

## Requirements

Options will be shortlisted based on the must haves, and then compared on could have, and non-functional requirements.

### Must haves
* support encrypted traffic.
* reverse proxy calls to known services
* configuration hot reload or runtime registration
* support HTTP communication
* free (as in beer)
* actively maintained
* support multiple instances of services at different end points

### Could haves
* support multiple instances of services (load balancing)
* service auto-discovery
* login redirection for authorized endpoints
* Docker container version
* automatic traffic logging
* endpoint simulation
* open source
* add CORS headers
* rate limiting
* support a heterogenous set of services
* service health checking

### Nonfunctional requirements
* easy to set up
* easy to configure
* easy to debug
* good examples
* lightweight
* works equally well in and outside docker context
* scalability
* Actively developed by a large community or company

## Candidates

### Discarded
These options did not meet must-have requirements
* Caddy: paid for business users


### [Janus](https://www.gitbook.com/book/hellofresh/janus/details)

Supports every single requirement.

### [Istio](https://istio.io/)

Seems capable, but documentation needs some more detailed attention.

### [Tyk](https://tyk.io)

* Free up to 50 000 API calls per day.
* Only hosts the gateway, not the services
* Bad documentation - low on technical info, high on sales pitches

### [OpenResty](https://openresty.org/en/)

* Nginx based.
* Seems to lack auto service discovery.
