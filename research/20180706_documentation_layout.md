# Documentation Layout

Date: 2018/07/06


## Context

During the BrewBlox project, a lot of documentation has been written, both in the `brewblox-dev-docs` repository, and in source code.

In order to improve accessibility, this should be properly categorized and published.


## Audiences

Documentation is generated for many purposes and audiences.
There is some overlap between groups, but we should keep the following "users" in mind:


**People completely unfamiliar with BrewBlox**

A common pitfall of software libraries is that when it comes to introducing the library, they skip straight to "why should you use this particular library (and not the competitor)".

This leaves readers guessing as to what purpose the library serves to begin with. A clear and concise statement of purpose should be front and center in any documentation website.

[Good Example](https://tox.readthedocs.io/en/latest/).

[Bad Example]() todo


**End users getting started with the product.**

This category can be split into two sub-categories: people who want an estimate of how much effort it is to get started, and people who have just received the hardware, and want to get started.

Both want the same thing: the user manual equivalent of 

```c++
#import <iostream>

int main()
{
    std::cout << "Hello world!";
}
```
[Good Example](https://docs.pytest.org/en/latest/)

[Bad Example](https://www.ansible.com/resources/get-started)


**End users already using the product, and wishing to modify it.**

For the majority of users, a Hello World application is not enough.
They have some idea of their requirements, and want to find a way to implement them.

Feature discovery becomes important at this point: directing users to a list of feature descriptions, with short examples of how to enable them.

This can be done in the form of a FAQ, but only if it's clear what questions are actually frequently asked.


**Developers getting started contributing to the source code.**

Developers can be considered a subset of users: they are aware of how to operate the software, but also must know how to build and change it.

Getting Started guides are the equivalent of a Hello World application here: they describe the steps required to make and build the simplest change to the code base.


**Developers familiar with the source code.**

Even after extensive experience developing the software, documentation remains relevant. Implementation details, and motivation behind design decisions is volatile information: quickly forgotten when not relevant.

Findability and accuracy become more important than discoverability here: the audience knows what they're looking for, and they value completeness over brevity.


## Categories

In order to satisfy all audiences, the documentation must consist of:

* **Vision statement**: what problem does the application solve.
* **Product description**: one or two sentences description of the application.
* **Getting Started**: installation and Hello World guide. Shorter is better.
* **Feature Guide**: what can you do with the software? Hello World examples for each feature.
* **Getting Started: Developing**: installation guide for the build environment. Description of how to use the boilerplate repository.
* **References**
    * Design decisions
    * Code examples
    * API documentation
    * Issue Tracker
    * Communication channels
    * Repository links
    * Changelog