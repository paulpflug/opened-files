
<template>
    <ol class="full-menu list-tree has-collapsable-children" tabindex="-1">
      <template
        v-component="folder"
        v-repeat="entry: filesTree"
        track-by="name"
        class="directory list-nested-item project-root"
        >
      </template>
    </ol>
<div class="hr icon" v-class="icon-triangle-up:expanded,icon-triangle-down:!expanded" v-on="click:toggle"></div>
</template>

<script lang="coffee">
Lazy = null
log = null
CompositeDisposable = null
projectManager = null
settings = null
getElementFromTree = (tree, name, createElement) ->
  element = Lazy(tree).where(name: name).first()
  if createElement?
    unless element?
      element = createElement()
      tree.push element
      tree = Lazy(tree).sortBy("name").toArray()
  return [element,tree]
addFileToTree = (tree, name, path) ->
  [element, tree] = getElementFromTree tree, name, ->

    pinned = settings[path]?.pinned ? false
    color = settings[path]?.color ? false
    {name: name, path: path, pinned: pinned, color: color}
  return tree
addFolderToTree = (tree, splittedPath, path) ->
  [element, tree] = getElementFromTree tree, splittedPath[0], ->
    {name: splittedPath[0], folders: [], files: []}
  if splittedPath.length == 2
    element.files = addFileToTree element.files, splittedPath[1], path
  else
    element.folders = addFolderToTree element.folders, splittedPath.slice(1), path
  return tree
removeFileFromTree = (tree, name) ->
  [element, tree] = getElementFromTree tree, name
  if element? and not element.pinned
    tree.$remove element
  return tree
removeFolderFromTree = (tree, splittedPath) ->
  [element, tree] = getElementFromTree tree, splittedPath[0]
  if splittedPath.length == 2
    element.files = removeFileFromTree element.files, splittedPath[1]
  else
    element.folders = removeFolderFromTree element.folders, splittedPath.slice(1)
  if element.folders.length == 0 and element.files.length == 0
    tree.$remove element
  return tree
module.exports =
  data: ->
    filesTree: []
    disposables: null
    expanded: false
  methods:
    toggle: (e) ->
      @expanded = !@expanded
      treeView = document.querySelector "div.tree-view-resizer>div.tree-view-scroller"
      @$el
      if @expanded
        @$el.setAttribute "style", "height:50%;"
        treeView.setAttribute "style","height:50%;"
      else
        @$el.removeAttribute "style"
        treeView.removeAttribute "style"
      e.stopPropagation()
    addFile: (path) ->
      result = atom.project.relativizePath path
      if result?[0]?
        rootName = result[0].split("/").pop()
        rootElement = Lazy(@filesTree).where(name: rootName).first()
        unless rootElement?
          rootElement = {name: rootName, path: result[0], folders: [], files: []}
          @filesTree.push rootElement
          @filesTree = Lazy(@filesTree).sortBy("name").toArray()
        splittedPath = result[1].split("/")
        if splittedPath.length == 1
          rootElement.files = addFileToTree rootElement.files, splittedPath[0], path
        else
          rootElement.folders = addFolderToTree rootElement.folders, splittedPath, path
    removeFile: (path) ->
      result = atom.project.relativizePath path
      if result?[0]?
        rootName = result[0].split("/").pop()
        rootElement = Lazy(@filesTree).where(name: rootName).first()
        if rootElement?
          splittedPath = result[1].split("/")
          if splittedPath.length == 1
            rootElement.files = removeFileFromTree rootElement.files, splittedPath[0]
          else
            rootElement.folders = removeFolderFromTree rootElement.folders, splittedPath
          if rootElement.folders.length == 0 and rootElement.files.length == 0
            @filesTree.$remove rootElement
    getUnpinned: (cb) ->
      @$on "isUnpinned", (path) ->
        log "recieved #{path}"
        cb(path)
      @$broadcast "getUnpinned"
      setTimeout (=>@$off("isUnpinned")),200
  beforeCompile: ->
    Lazy ?= require "lazy.js"
    log ?= require("./../lib/log")(atom.inDevMode(),"app-comp")
    projectManager ?= require("./../lib/project-manager")
    settings = projectManager.getProjectSetting()

    CompositeDisposable ?= require('atom').CompositeDisposable
    @disposables = new CompositeDisposable
  beforeDestroy: ->
    @disposables?.dispose()
  created: ->
    @$on "notifySelect", (path) =>
      log "event - selected #{path}"
      @$broadcast "selected", path
    @$on "notifyColor", (path, color) ->
      log "event - color #{path}"
      newSetting = settings[path] ? {}
      newSetting.color = color
      settings[path] = newSetting
      projectManager.addToProjectSetting settings, false
    @$on "notifyPinned", (path, pinned) ->
      log "event - (un)pinned #{path}"
      newSetting = settings[path] ? {}
      newSetting.pinned = pinned
      settings[path] = newSetting
      projectManager.addToProjectSetting settings, false
  compiled: ->
    for path,obj of settings
      if obj.pinned
        @addFile path
</script>
