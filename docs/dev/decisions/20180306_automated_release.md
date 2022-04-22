# Automated software release

Date: 2018/03/06

## Context

Part of an efficient software development pipeline is automatic deployment and release.
This is best implemented relatively early on, because it makes later development easier and more stable.

Current development pipeline has the following steps:

* Create task (task now in Inbox)
* Accept task (task now in Backlog)
* Schedule task (task now in Next)
* Pick up task (task now In Progress)
* Create new branch from Develop branch
* Implement task
* **Increment version number in `setup.py`**
* Create pull request from new branch back to Develop branch
* Task is done when pull request is merged
* **Manually build develop branch, and use Twine to upload to PyPi (assuming Python task)**

The steps in bold are now done manually, and should be automated.

## Requirements

* Releases must have a meaningful version number
* Version number must adhere to the most common convention
* The deployment and release process must be using the same pipeline as the existing review process.
* Releases must only be done from stable branches
* Only one release may be done per version
* Credentials for uploading to deployment / release must be kept confidential (can't be in source code)
* Deployment must be done by currently used tools as much as possible (GitHub + Travis)

## Git Flow

[Git Flow][1] is currently one of the more popular implementations of a distributed workflow.

It proscribes two long-lived branches, with other, shorter, branches forking from one, and merging back into one, or both.

The `develop` branch is the core branch for development. A new `feature` branch is branched from here for each task. When the task is done, the branch is merged back into develop.

In theory, this branch interaction model is sufficient for multiple programmers to cooperatively develop software. In practice, develop is not sufficiently stable for release to end users.

`master` is the branch intended for stable software releases. This branch should only receive code that is thoroughly tested, and does not contain partially finished features.

In order to verify that code on `develop` is ready for primetime, new `release` branches are created regularly. These branch from `develop` either after a set interval (end of Scrum sprint), or when a feature is complete.

At this point developers can continue to add new features to `develop`, while the `release` branch is used to verify that its frozen set of features are bug-free, and meet requirements.

Bug fixes made on `release` branches should also be merged into develop. No new functionality should be added to `release`.

When the software on `release` passes all checks, it is merged into `master`.

Occasionally, despite best efforts, `master` will have bugs. For the most critical of them, `hotfix` branches are branched directly from `master` to fix the issue.
When ready, these branches are merged both into `master`, and `develop`.

Brewblox as a project has no special requirements that mandate any changes to this model. At time of writing, we do still need to implement meaningful and automatic regression tests that should be run against `release` software.

We do need to formulate a standard approach for conditions not described explicitly by Git Flow:

* Contributors working on forked repositories
* Pull Requests

## Git Flow: Forked

The default Git Flow model does not describe forked repositories making upstream pull requests. The forked model is attractive to projects with open-source contributors, as it allows contributions without granting write access to strangers.

Contributors fork the base repository on GitHub into their own. At that point they can create their own branches, or use their local version of `develop` - the upstream repository doesn't care. When they are done, they make a pull request to the correct target branch on the base repository. Pull requests can be commented on by many, but only merged by somebody with write access to the base repository.

We'll refer to the base repository as `upstream`, and to the contributor repository as `downstream`.

In a forked Git Flow repository, there will be no `feature` or `hotfix` branches in `upstream`. This is all done in `downstream`.

Contributors branch new `downstream/feature` branches from `upstream/develop`, and when ready, make a pull request back into `upstream/develop`.

`release` branches are created in `upstream`. If any fixes need to be made, these are directly done in `downstream/release` (or a forked branch), and merged back in through pull request.

The same goes for `hotfix` branches: `downstream/hotfix` is branched from `upstream/master`, and merged back into `upstream/master`.

Normally, only 3 branches will exist in `upstream`: `master`, `develop`, and (when active) `release`.

 Exceptions are:

* Long running feature branches that involve multiple developers. They can use a feature branch on `upstream` to synchronize work. They could do pull requests to the `upstream/feature` branch.
* Multiple release branches can exist in parallel, for example the latest stable release and a new release candidate for the next major version.

In general: small features do not require a feature branches on the upstream repo.

## Semantic Versioning

In order to avoid "dependency hell" in a project using many third-party libraries, [Semantic Versioning][3] was introduced.

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
>    1. MAJOR version when you make incompatible API changes,
>    2. MINOR version when you add functionality in a backwards-compatible manner, and
>    3. PATCH version when you make backwards-compatible bug fixes.
>
> Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

This can be used without any adjustments or special cases by the Brewblox project.

## Tagging

Git itself supports [tags][12]. These can provide extra information about the repository. Specifically, they can be used to mark where releases were done, so that the HEAD can easily be set at that point.

GitHub offers additional functionality for tags with [GitHub Releases][13].

We don't particularly need the package distribution offered by GitHub Releases, as we release our Python code to PyPi.

More useful is the easy display/editing of tag descriptions. These can be used as release change logs.

## Travis Deployment

Automated tests are currently run by [Travis][9] whenever a pull request is made. Travis supports deployment to multiple providers, among them [PyPi][10]. ([documentation][4])

Deployment credentials (PyPi requires a username and password) can be kept private by adding [environment variables][11] to the brewblox (`upstream`) runner configuration. `downstream` builds can't access the value of these variables. Any attempt to check in code exposing credentials would need to be approved in a pull request.

## Version Bumping

Every release to PyPi should be using a new (semantic) version number, and each version number should be released to PyPi.

Version numbers should be set in repository tags, in source code, and in `setup.py` (determining python package version). Version numbers in all these places should match, and 'bumping' (adding +1 to MAJOR/MINOR/PATCH) should be a single action. This makes the process less error-prone.

Bumping can be automated by using [bump2version][5], which will take care of both the tag, and the version in source code.

## When to bump

If multiple `release` and `bugfix` branches are active simultaneously, bumping the version inside those branches would create race conditions in version numbering.

Therefore, version numbers should only be increased on the `master` branch. Multiple `bugfix` branch results can then also be grouped in a single release, or combined with commits from a `release` branch.

When the version is bumped, Travis should automatically deploy it. This can be accomplished by setting the `on: tags` [condition][14] in the `travis-ci.yaml` file.

## Deferred Features

Some features will possibly be relevant in the future, but are not specified or implemented at this time.

* Releasing Dev/Alpha/Beta/Gamma/rc versions to PyPi.
* Automatically setting dev version in Python package when building locally.
* Automating version bumping + release after `release` or `bugfix` branches are merged
  * Requires automatic determination of whether the release is MAJOR/MINOR/PATCH

[1]: https://jeffkreeftmeijer.com/git-flow
[3]: https://semver.org/
[4]: https://docs.travis-ci.com/user/deployment/pypi/
[5]: https://github.com/c4urself/bump2version
[6]: https://packaging.python.org/guides/single-sourcing-package-version/
[7]: https://github.com/michaeljoseph/changes
[8]: https://zestreleaser.readthedocs.io/en/latest/
[9]: https://travis-ci.org/
[10]: https://pypi.python.org/pypi
[11]: https://docs.travis-ci.com/user/environment-variables/
[12]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
[13]: https://help.github.com/articles/creating-releases/
[14]: https://docs.travis-ci.com/user/deployment#Conditional-Releases-with-on%3A

## References

* <https://jeffkreeftmeijer.com/git-flow>
* <https://semver.org/>
* <https://docs.travis-ci.com/user/deployment/pypi/>
* <https://github.com/c4urself/bump2version>
* <https://packaging.python.org/guides/single-sourcing-package-version/>
* <https://github.com/michaeljoseph/changes>
* <https://zestreleaser.readthedocs.io/en/latest/>
* <https://travis-ci.org/>
* <https://pypi.python.org/pypi>
* <https://docs.travis-ci.com/user/environment-variables/>
* <https://git-scm.com/book/en/v2/Git-Basics-Tagging>
* <https://help.github.com/articles/creating-releases/>
* <https://docs.travis-ci.com/user/deployment#Conditional-Releases-with-o>*
