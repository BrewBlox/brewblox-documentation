# Event handling

## Requirements

* message topics
* reverse proxy support
* security
* Python clients
* JS clients
* multi-channel
* easy to set up
* future scalability

## Considerations

### AMQP 
AMQP is a protocol for message communication. In the OSI stack, it is on the same level as HTTP/HTTPS.

This does add the difficulty that our current gateway (Janus) does not seem to support reverse-proxying AMQP.

### STOMP
STOMP is a further abstraction of messaging. RabbitMQ supports it using a plugin.
It serves as a good abstraction for messaging, but still operates natively in its own protocol.

### STOMP over WS?
Some libraries offer this. Advantages: we can reverse proxy. Disadvantages: what are we even doing at this point?

### Don't reverse proxy?
Consequences:
* We open more ports
* Everyone needs to remember two hosts: the MQ, and the gateway
* Two separate security implementations
