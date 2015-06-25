# opened-files package

A view of all opened files and other useful additions.

List:

![opened-files-list](https://cloud.githubusercontent.com/assets/1881921/8344463/62cb82d4-1ae2-11e5-8dfe-991c09798d97.png)

Tree:

![opened-files-tree](https://cloud.githubusercontent.com/assets/1881921/8344445/0b957ac4-1ae2-11e5-9b51-e5619d780d6a.png)


 - foldernames in tabs was sourced out: [foldername-tabs](https://atom.io/packages/foldername-tabs)

## Features
 - Pinned tabs
 - Tree-view and list-view of opened files
 - Highlight tab on hover of file
 - Saves pinned tabs in project file (needs project-manager package)
 - works together with [color-tabs](https://atom.io/packages/color-tabs) and [color-picker-service](https://atom.io/packages/color-picker-service) to color individual tabs

## Known issues

 - needs a restart (`ctrl+alt+r`) when `color-tabs`/`color-picker-service` are added or removed at runtime

## Discuss

Let me hear your ideas for improvement [here](https://discuss.atom.io/t/announce-opened-files)

## Developing

You can play with the package by running `npm install` in its directory.
Two dependencies will be fetched, which will do the vue -> js compiling and the package reloading on change.
Both will only be active in dev mode.

## License
Copyright (c) 2015 Paul Pflugradt
Licensed under the MIT license.
