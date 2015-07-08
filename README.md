# opened-files package

A view of all opened files and other useful additions.

List:

![opened-files-list](https://cloud.githubusercontent.com/assets/1881921/8344463/62cb82d4-1ae2-11e5-8dfe-991c09798d97.png)

Tree:

![opened-files-tree](https://cloud.githubusercontent.com/assets/1881921/8344445/0b957ac4-1ae2-11e5-9b51-e5619d780d6a.png)


 - foldernames in tabs was sourced out: [foldername-tabs](https://atom.io/packages/foldername-tabs)

## Features
 - Pinned tabs (save list)
 - close all but saved files (`ctrl+alt+w`)
 - Tree-view and list-view of opened files
 - Highlight tab on hover of file
 - Saves pinned tabs in project file (needs project-manager package)
 - works together with [color-tabs](https://atom.io/packages/color-tabs) and [color-picker-service](https://atom.io/packages/color-picker-service) to color individual tabs

## Known issues

 - [double clicking on a preview file doesn't clear the preview](https://github.com/paulpflug/opened-files/issues/12)
 - [preview tabs shouldn't be added to the list of opened files](https://github.com/paulpflug/opened-files/issues/11)

## Discuss

Let me hear your ideas for improvement [here](https://discuss.atom.io/t/announce-opened-files)

## Where to find the settings

![opened-settings](https://cloud.githubusercontent.com/assets/1881921/8569100/457d7db2-2574-11e5-96b0-a6ed026090d7.png)

## Developing

Run `npm install` in the package directory.

Open it in atom in dev mode.

For debugging set the debug field in package settings to the needed debug level.

Should autoreload the package on changes in `lib` and `styles` folders

## License
Copyright (c) 2015 Paul Pflugradt
Licensed under the MIT license.
