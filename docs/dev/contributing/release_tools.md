# Brewblox dev deployment tools

`brewblox-dev` contains some tools for mainline development. Some of these require write access to the mainline repositories.

## brewblox-dev delta

This shows the number of commits between various release tracks.

```bash
steersbob@BrewBox:~/git/brewblox-documentation$ brewblox-dev delta
repository                develop > edge > tag
----------------------------------------------
brewblox-devcon-spark     7         138    -
brewblox-history          0         40     -
brewblox-ui               21        696    -
brewblox-ctl-lib          0         37     -
brewblox-firmware         9         251    -
```

`brewblox-devcon-spark` develop is 7 commits ahead of edge. The edge branch is 138 commits ahead of the latest tag.

## brewblox-dev release-edge

This asks to create a Pull request from develop to edge for each released Brewblox repository.

```bash
steersbob@BrewBox:~/git/brewblox-documentation$ brewblox-dev release-edge
Do you want to create a develop -> edge PR for brewblox-devcon-spark? [Y/n]

https://github.com/Brewblox/brewblox-devcon-spark/pull/269
Do you want to create a develop -> edge PR for brewblox-history? [Y/n]

Error creating pull request: Unprocessable Entity (HTTP 422)
No commits between edge and develop
Do you want to create a develop -> edge PR for brewblox-ui? [Y/n]

```

`brewblox-devcon-spark` develop was ahead of edge, and could create a pull request. `brewblox-history` develop was not ahead of edge, and got an error message. There's nothing wrong with that: the tool continued anyway.


## Pulling firmware binaries

`brewblox-devcon-spark` is responsible for building the firmware flasher images, and deploys the firmware binaries created by `brewblox-firmware`.

`brewblox-firmware` creates the `brewblox/firmware-bin` Docker image, which contains the firmware build results, along with utility scripts.

These files should be committed in the devcon repository. They can be updated using the `pull-binaries.sh` script.

```bash
steersbob@BrewBox:~/git/brewblox-devcon-spark$ bash pull-binaries.sh
Using brewblox/firmware-bin:develop
develop: Pulling from brewblox/firmware-bin
Digest: sha256:c9299298026bfb1595ecc6237310c22e7a794c30beefda04b44660fcc4c7f379
Status: Image is up to date for brewblox/firmware-bin:develop
bf06240c99ec7719c55474442c94cf2ad5877bd1cdb7ca376e5ee3db4c68c2a7
```

```bash
steersbob@BrewBox:~/git/brewblox-devcon-spark$ git status
On branch develop
Your branch is up to date with 'upstream/develop'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   binaries/brewblox-p1.bin
        modified:   binaries/brewblox-photon.bin
        modified:   binaries/firmware.ini

no changes added to commit (use "git add" and/or "git commit -a")
```

The `pull-binaries.sh` script accepts a single argument: the `brewblox/firmware-bin` image tag it should pull. By default it uses `develop`.
