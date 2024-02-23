# Microservice Design Adjustments for Brewblox

Date: 2018/02/15

## Introduction

In recent years the "microservice" architecture design pattern has gained popularity.
The general concept is to split a single large application (monolith) into many small applications (microservices).
Advertised advantages are scalability and flexibility.

Intuitively, its separation of functionality is a good fit for a modular system.

As with any other design pattern, microservices are not a silver bullet. The Brewblox system also does not match the original use case for microservices: a large web application that needs significant horizontal scaling.

**Which benefits and drawbacks of the microservice pattern are relevant to Brewblox?**

## (Relevant) microservice advantages

Microservices.io has a nice overview on [when to implement microservices][microservice_io].

We'll look at each listed benefit, and evaluate whether it applies to the Brewblox context.

### Better testability - services are smaller and faster to test

This point is pretty much always relevant. Basic combinatorics indicate that the total number of code paths grows exponentially with application size.

This does not eliminate the need for integration and system tests, but it does create a well-defined boundary for the tested system.

### Better deployability - services can be deployed independently

This may be nice, but is not strictly required for Brewblox. Each user has a separate installation, greatly reducing the cost of bringing the system down for an update.

### It enables you to organize the development effort around multiple, auto teams

While Brewpi itself does not have multiple teams, it does actively encourage open-source contributors. Active contributors can take responsibility for one or more services, without having to be involved in everything else.

### Small microservices are easier for a developer to understand

This is always useful - especially for open-source contributors, who do not have the time or inclination to familiarize themselves with the entire system.

### The IDE is faster for a small application

Unless either Brewpi revenue, or open-source contributions go stratospheric, it is extremely unlikely that this will ever be an issue.

There simply are not enough FTE associated with the project to generate that much code.

### Small applications start faster, making developers more productive

See: previous point.

### Improved fault isolation

This is certainly useful. If a non-critical service crashes, the impact is limited.

Brewblox governs real-world processes of significant duration. Robustness is important when controlling brews over a period of days or weeks.

### Eliminates long-term commitment to a technology stack

Easy and incremental refactoring allows utilization of new and innovative frameworks. Being able to isolate bad experiments reduces the inherent risk of using unproven technology.

Hopefully, this also makes the project more attractive to contributors.

### Summary (advantages)

All benefits that revolve around isolation of functionality are useful regardless of the scope of the project.

The significant difference between Brewblox and the monolith envisioned by the microservice pattern is scale.
Individual Brewblox systems see very little traffic, and Brewpi is unlikely to employ multiple teams of software developers.

## (Relevant) microservice drawbacks

Again we'll be referring to [when to implement microservices][microservice_io] on microservices.io.

This time, each listed drawback is evaluated on relevancy for the Brewblox project.

### Developer tools don't provide explicit support for distributed applications

This one is hard to evaluate. Of note is that the backend language of choice (Python) is not typically developed using large, feature-rich IDE's such as Visual Studio, Netbeans, or Eclipse.

### Testing is more difficult for distributed systems

As noted in the benefits, unit tests that do not use external services are easier. Integration and system tests become more complex as they need to manage distributed applications.

This is an issue that partially falls under the larger header of "deployment/dependency management", but should certainly not be overlooked.

### Developers must implement inter-service communication mechanisms

This is a valid point. By default, any inter-service communication will be more complex than calling a function in the same process.

### Implementing use cases that span services require coordination between teams

As noted before: Brewpi simply isn't big enough to have multiple teams. Implementation still requires coordination between services, but they likely are all under the purview of the same developers.

### Deployment complexity

This is probably the biggest issue, even for a relatively small, low-traffic system. Specific solutions must be found and used to automate this.

### Increased memory consumption

This can be an issue depending on deployment target, and number of services. Individual Python applications don't take much memory, but their isolation containers or environment might.

### Summary (drawbacks)

The biggest issue here is that deployment is much more complicated for microservices. Significant effort will have to be spent finding solutions.

A secondary issue is the increased memory overhead. Any isolation using containers, virtual environments, or VM's will add significant memory overhead.

## Conclusion

Many benefits and drawbacks of microservices still hold for Brewblox. The big exceptions are the ones that become relevant for large companies.

Brewpi does not and will not have a MLoC sized code base. Any solutions pertaining to inter-team communication are only relevant if external contributors are considered "teams".

[microservice_io]: https://microservices.io/patterns/microservices.html

## References

* <https://microservices.io/patterns/microservices.html>
