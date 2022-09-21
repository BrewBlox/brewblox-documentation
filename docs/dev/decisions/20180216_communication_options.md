# Microservice Communication

Date: 2018/02/16

## Context

Where cross-module calls in a monolith would still be implemented as function calls, in a microservice architecture (MSA) they require inter-process communication.

This is a choice that cannot be easily changed: it must be assumed that changing the communication protocol will require changing every single service.

Due to the popularity of distributed systems, there is ample choice as to what protocol can be used.

## Assumptions

* The default for GUI -> Service communication is [REST][rest-wiki]
* Service -> device communication can be unique for each type of service/device. This is not a system-wide protocol
* The current language of choice for services is Python, but this is not a requirement. Contributors are free to pick a language.

## Requirements

* Supported by the top 5 [popular backend languages][language-popularity]
  * JavaScript
  * Java
  * Python
  * C#
  * C++
* Language-agnostic
* Graceful degradation if target application not running
* Fault-tolerant
* Generic - should support all kinds of hypothetical services down the line
* Scalable

## What is the most popular solution?

[This article][communication-patterns], and [this one][dzone-msa-communication], and [this one][is-rest-best] prescribe a combination of **commands** and **events** for communication in an MSA. Both come with specific advantages and drawbacks, but combined they cover all but the most extreme edge cases.

[This overview of MSA patterns][msa-patterns] has another name for commands: [remote procedure invocation (RPI)][rpi-pattern].

[REST][rest-wiki] communication is considered the de facto standard for synchronous commands / RPI, but [gRPC][grpc] and [Apache Thrift][thrift] are also mentioned.

Honorable mention to [this ancient article][implementing-rpc] for its insights in RPC communication - many of these points are still valid concerns.

## Can we apply this?

The concerns named in sources so far match our requirements: communication patterns must be very generic and flexible.
We have no pressing reason to deviate from the norm.

## RPI implementation

Services already implement REST endpoints for consumption by the GUI, and sources so far indicate that it is the standard choice for RPI by a wide margin.

Named alternatives (gRPC, Thrift) require the additional overhead of a shared interface file. Their advertised advantages (speed, scalability) are less important to our system than the flexibility this would sacrifice.

## Event implementation

Specific implementations for an event bus are often not named. For full flexibility of the system we should support asynchronous event-based communication, but further research is required to choose a protocol and vendor.

## Conclusion

Our proposed use of microservices does not have unique requirements mandating devation from the norm.

The suggested norm is to use the RPI pattern for synchronous communication, and an event bus for asynchronous or event-driven communication.

The industry default for RPI is REST, but more research is required to determine the most suitable event bus protocol and vendor.

[language-popularity]: https://insights.stackoverflow.com/survey/2018/#technology-programming-scripting-and-markup-languages
[communication-patterns]: https://medium.com/@diogo.lucas/communication-patterns-in-a-microservice-world-af07192b12d3
[is-rest-best]: https://capgemini.github.io/architecture/is-rest-best-microservices/
[dzone-msa-communication]: https://dzone.com/articles/communicating-between-microservices
[rest-wiki]: https://en.wikipedia.org/wiki/Representational_state_transfer
[msa-patterns]: https://microservices.io/patterns/microservices.html
[rpi-pattern]: https://microservices.io/patterns/communication-style/rpi.html
[grpc]: https://grpc.io/
[thrift]: https://thrift.apache.org/
[implementing-rpc]: https://pages.cs.wisc.edu/~sschang/OS-Qual/distOS/RPC.htm

## References

* <https://insights.stackoverflow.com/survey/2018/#technology-programming-scripting-and-markup-languages>
* <https://medium.com/@diogo.lucas/communication-patterns-in-a-microservice-world-af07192b12d3>
* <https://capgemini.github.io/architecture/is-rest-best-microservices/>
* <https://dzone.com/articles/communicating-between-microservices>
* <https://en.wikipedia.org/wiki/Representational_state_transfer>
* <https://microservices.io/patterns/microservices.html>
* <https://microservices.io/patterns/communication-style/rpi.html>
* <https://grpc.io/>
* <https://thrift.apache.org/>
* <https://pages.cs.wisc.edu/~sschang/OS-Qual/distOS/RPC.htm>
