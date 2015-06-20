
<template>
    <ol class="full-menu list-tree has-collapsable-children" tabindex="-1">
      <folder
        v-repeat="entry: filesTree"
        track-by="name"
        >
      </folder>
    </ol>
</template>

<script lang="coffee">
whereName = (array,name) ->
  for obj in array
    if obj.name == name
      return obj
  return null
sortByName = (array) ->
  array.sort (a,b) ->
    return -1 if a.name < b.name
    return 1 if a.name > b.name
    return 0
sep = null
projectManager = null
settings = null
treeManager = null
getElementFromTree = (tree, name, createElement) ->
  element = whereName tree, name
  if createElement?
    unless element?
      element = createElement()
      tree.push element
      sortByName tree
  return [element,tree]
addFileToTree = (tree, name, path) ->
  [element, tree] = getElementFromTree tree, name, ->
    return {
      name: name
      pinned: settings[path]?.pinned ? false
      color: settings[path]?.color ? false
      path: path
    }
  return tree
addFolderToTree = (tree, splittedPath, index, path) ->
  [element, tree] = getElementFromTree tree, splittedPath[index], ->
    return {
      name: splittedPath[index]
      folders: []
      files: []
      path: splittedPath.slice(0,index+1).join("/")
    }
  if splittedPath.length == index+2
    element.files = addFileToTree element.files, splittedPath[index+1], path
  else
    element.folders = addFolderToTree element.folders, splittedPath,index+1, path
  return tree
module.exports =
  data: ->
    filesTree: []
    colors: {}
    expanded: false
  methods:
    addFile: (path) ->
      result = atom.project.relativizePath path
      if result?[0]?
        rootName = result[0].split(sep).pop()
        rootElement = whereName @filesTree, rootName
        unless rootElement?
          rootElement =
            name: rootName
            path: result[0]
            folders: []
            files: []
          @filesTree.push rootElement
          sortByName @filesTree
        if atom.config.get("opened-files.asList")
          rootElement.files = addFileToTree rootElement.files, result[1], path
        else
          splittedPath = result[1].split(sep)
          if splittedPath.length == 1
            rootElement.files = addFileToTree rootElement.files, splittedPath[0], path
          else
            rootElement.folders = addFolderToTree rootElement.folders, splittedPath, 0, path
    closeUnpinned: ->
      @$broadcast "close"
    pin: (path) ->
      @$broadcast "pin", path
    pinned: (path, pinned) ->
      newSetting = settings[path] ? {}
      newSetting.pinned = pinned
      settings[path] = newSetting
      projectManager.addToProjectSetting settings, false
    selected: (path) ->
      @$broadcast "selected", path
    resize: ->
      treeManager.autoHeight()
    colorChangeCb: (path, color) ->
      @log "colorChangeCb called", 2
      @colors[path] = color
      @$broadcast "color", path
  beforeCompile: ->
    sep = require("path").sep
    projectManager ?= require("./../lib/project-manager")
    treeManager ?= require("./../lib/tree-manager")
    settings = projectManager.getProjectSetting()
    @log "beforeCompile",2
  created: ->
    @$on "removeFolder", (entry) =>
      @filesTree.$remove entry
      return false
  compiled: ->
    for path,obj of settings
      if obj.pinned
        @addFile path
    @addDisposable atom.workspace.observeTextEditors (editor) =>
      if editor?.getPath?
        path = editor.getPath()
        if path?
          @log "adding #{path}",2
          @addFile path
    @addDisposable atom.commands.add 'atom-workspace',
      'opened-files:close-all-but-pinned': @closeUnpinned
      'opened-files:pin-current-tab': =>
        te = atom.workspace.getActiveTextEditor()
        if te?.getPath?
          @pin te.getPath()
    @log "compiled",2
  ready: ->
    @log "ready",2
  attached: ->
    @log "attached",2
</script>
