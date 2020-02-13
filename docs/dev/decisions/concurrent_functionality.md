# Concurrent Functionality

## Context

Individual services can communicate using two protocols: REST for direct communication, and AMQP for event-driven communication.

In order to use these protocols passively (receive a call), they must be listened to. In a traditional software application, listening to network activity is a blocking call. Listening to both requires concurrent functionality.

Another source of concurrent execution are long-running background tasks services might require.

Note: A clear and simple explanation of the differences between concurrency, multi-threading, and asynchronicity can be found [here][conc-vs-multi-vs-async]. A more in-depth comparison of threading and event-based models is available [here][threads-vs-events].

This document expects the reader to be familiar with the various approaches to concurrency. 

## Requirements

Must: 

* Can be combined in one application
* Supported by Python

Solutions are ranked by:

* Simplicity of implementation
* Performance
* Memory use

## Assumptions

When evaluating options, it is done on the basis of multiple assumptions we make about our future application:

**Individual service tasks are not CPU-limited**: Brewblox is the implementation of a classic three-tier system: GUI, service layer, I/O backend (database, device, file). No excessively CPU-heavy tasks are expected, so the default rules hold: I/O is the primary bottleneck.

**Services are not expected to always run at max load**: We are not Netflix [citation needed]. Most services in any given Brewblox system are expected to only receive a few calls per second at most.
Efficient performance when at low load is a serious consideration.

**Services are already efficiently split up**: The microservice architecture (MSA) already solves the concurrency problem on a high level, by dividing functionality over different services.
We have to assume here that the division was done well, and there are valid reasons why multiple call stacks are grouped in a single application.

## Multi-process

The multi-processing approach solves the concurrency issue by creating a new (sub)process for concurrent functionality.

Each individual process has a task set it can execute synchronously. For our use case this would mean that there are three processes:

* Process 1 (p1) starts process 2 and 3, and exits
* Process 2 (p2) listens and responds to REST calls
* Process 3 (p3) listens and responds to received AMQP events

The benefit is that implementation can be simple. Each process does its own thing, and is isolated from its peers. Code complexity is comparable to two non-concurrent applications.

The disadvantage is that this solution is optimal for heavily stratified applications, where the two call stacks (p2 and p3) don't need to share resources.

Each process will also need its own memory space, making this solution memory-intensive.

As a side note: the microservice architecture pattern itself is a multi-process architecture.

## Multi-thread

Multi-threading approaches create multiple call stacks that share resources.

In this case, the solution would be:

* Process 1 (p1): the service
    * Thread 1 (t1): listens and responds to REST calls
    * Thread 2 (t2): listens and responds to received AMQP events

The benefit is that t1 and t2 can use shared resources without having to resort to inter-process communication protocols.

The disadvantage is that implementation of multi-threaded solutions is notoriously hard. Every use of shared resources must be guarded to avoid race conditions or data corruption.

Each thread has some duplication of objects, but memory use is expected to be less than when multi-processing.

## Single-thread Asynchronous

A third option is to use an event-driven task scheduler. Here tasks get exclusive access to resources, but are expected to yield it whenever they need to wait for something.

In this scenario, there is one process that listens to both REST and AMQP. Instead of polling for data, they receive a callback when data is available.

Note that "asynchronous" implementation details vary between languages and frameworks. Per the requirements, we'll focus on the Python implementation: [asyncio][asyncio-introduction]. See [here][asyncio-tutorial] for a tutorial.

Asyncio can optionally use multiple threads, but its default implementation is to use a single event loop on a single thread.

The advantage of this approach is that it allows sharing resources without having to worry about thread safety: only one call stack is active at any given time.

Memory use is also expected to be less than either multi-processing or multi-threading, as at the OS level only one thread requires memory space.

The disadvantages are that the CPU load can't be shared over multiple cores, and that it demands asyncio-compatibility from any dependency that makes I/O calls.

Code complexity (assuming asyncio) is more than a fully isolated multi-process approach, but much less than multi-threading, or multi-process using IPC.

## Performance

Benchmarks [here][asyncio-benchmarks] [here][async-looking-glass], and [here][asyncio-benchmark-2] are overwhelmingly in favor of asyncio for web applications. Asyncio and aiohttp (its primary REST framework) routinely outperform multi-process and multi-thread implementations when it comes to handling requests.

[This comparison of memory consumption][memory-benchmark] also favored asyncio: it had the memory consumption of a single-threaded application, with performance equal to the multi-threaded approach.

## Conclusion

Given the assumption that functionality grouping in services is already optimized, the multi-process approach adds little: we'd be building microservices in microservices.

For I/O constrained applications, the asynchronous implementation is simpler, and performs much better than threads.



[conc-vs-multi-vs-async]: https://codewala.net/2015/07/29/concurrency-vs-multi-threading-vs-asynchronous-programming-explained/
[asyncio-introduction]: https://www.datacamp.com/community/tutorials/asyncio-introduction
[asyncio-tutorial]: https://hackernoon.com/asyncio-for-the-working-python-developer-5c468e6e2e8e
[asyncio-benchmarks]: https://github.com/python/asyncio/wiki/Benchmarks
[asyncio-benchmark-2]: https://eng.paxos.com/python-3s-killer-feature-asyncio
[async-looking-glass]: https://hackernoon.com/async-through-the-looking-glass-d69a0a88b661
[threads-vs-events]: https://berb.github.io/diploma-thesis/original/043_threadsevents.html
[memory-benchmark]: https://code.kiwi.com/memory-efficiency-of-parallel-io-operations-in-python-6e7d6c51905d


## References

* https://codewala.net/2015/07/29/concurrency-vs-multi-threading-vs-asynchronous-programming-explained/
* https://www.datacamp.com/community/tutorials/asyncio-introduction
* https://hackernoon.com/asyncio-for-the-working-python-developer-5c468e6e2e8e
* https://github.com/python/asyncio/wiki/Benchmarks
* https://eng.paxos.com/python-3s-killer-feature-asyncio
* https://hackernoon.com/async-through-the-looking-glass-d69a0a88b661
* https://berb.github.io/diploma-thesis/original/043_threadsevents.html
* https://code.kiwi.com/memory-efficiency-of-parallel-io-operations-in-python-6e7d6c51905d