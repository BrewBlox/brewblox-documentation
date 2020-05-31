# Stable Releases

Date: 2019/01/29

## Context

So far, development has been using the simplified git-flow process described in [this decision document][automated-release].

This works well when iterations are very short, and there are only a handful of users. The more users the software is released to, the more stable it should be.

## Issues

There are two major deficiencies in the current work flow:
- There is no `release` or `edge` branch where new features undergo high-level testing.
- Features often require simultaneous releases in multiple repositories.

## Release / Edge deployment

The purpose of an `edge` deployment track is to periodically pull a set of new features from `develop`, and then test those.
Apart from the periodic pulls, no new features should be merged into this branch - only bug fixes.

All bug fixes are merged both into this branch, and into `develop`.

When the change set is sufficiently tested, the code is publicly released, and a new set of features is pulled from `develop`.

## Simultaneous releases

Various repositories have different build times, and occasionally a release build may fail.
This would make `stable` releases very unstable for whomever decided to pull updates in the middle of a software release.

A better approach is to first publish all Docker images to an intermediate tag, and then re-tag and push all images at once.
This will not upload any new images to Docker Hub - the layer hashes will be recognized, and simply made available under a new tag.

## User perspective

Using this release strategy, the user can choose one of three tracks:
- `develop`: new features are immediately available, but will break regularly.
- `edge`: new features are available quickly, and in more coherent groups. May contain some bugs.
- `stable`: new features are tested, and released together.

## Automated triggers

Travis can support this workflow by using two rules for deployment:

**Any push to a `brewblox` repository triggers building Docker images tagged as the branch name**
Example: a push to `edge` will result in:
- `brewblox/repository-name:edge`
- `brewblox/repository-name:rpi-edge`

**Pushed Git tags trigger building Docker images tagged as `newest-tag`, and as the Git tag**
Example: adding the Git tag `0.2.3` will result in: 
- `brewblox/repository-name:0.2.3`
- `brewblox/repository-name:newest-tag`
- `brewblox/repository-name:rpi-0.2.3`
- `brewblox/repository-name:rpi-newest-tag`

## Manual actions

Using the automated triggers, `develop` and `edge` are released automatically.
The requirement was for `stable` to be released together, when all builds triggered by Git tags were successful.

This can be accomplished by a simple bash script, implementing the following logic:

```bash
for repo in ${DOCKER_REPOS}; do
    
    docker pull ${repo}:newest-tag
    docker pull ${repo}:rpi-newest-tag

    docker tag ${repo}:newest-tag ${repo}:stable
    docker tag ${repo}:rpi-newest-tag ${repo}:rpi-stable

    docker push ${repo}:stable
    docker push ${repo}:rpi-stable

done
```

Ideally, immediately after releasing stable images, `develop` is merged into `edge` to allow testing of a new set of features.
Whether this is always relevant in practice remains to be seen: BrewPi is a small company, with more repositories than developers.



[automated-release]: ./20180306_automated_release
