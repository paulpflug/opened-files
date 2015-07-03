
<template>

    <ol class="full-menu list-tree has-collapsable-children" tabindex="-1"
    v-on="mouseenter: hover, mouseleave: unhover"
    >
    <div v-class="hidden: !isHovered" class="save icon icon-bookmark" v-on="click: save">
    </div>
      <folder
        v-repeat="entry: filesTree"
        track-by="path"
        >
      </folder>
    </ol>
</template>

<script lang="coffee">
wherePath = (array,path) ->
  for obj in array
    if obj.path == path
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
getElementFromTree = (tree, path, sort, createElement) ->
  element = wherePath tree, path
  if createElement?
    unless element?
      element = createElement()
      tree.push element
      sortByName tree if sort
  return [element,tree]
addFileToTree = (tree, path, name) ->
  pathIdentifier = ""
  sort = true
  unless name? # list view
    sort = false
    result = atom.project.relativizePath path
    splittedPath = result[1].split(sep)
    name = splittedPath.pop()
    if result[0]?
      projectPaths = atom.project.getPaths()
      if projectPaths.length > 1
        pathIdentifier += "#{projectPaths.indexOf(result[0])+1}"
        pathIdentifier += sep if splittedPath.length > 0
    pathIdentifier += splittedPath.join(sep)
  [element, tree] = getElementFromTree tree, path, sort, ->
    return {
      name: name
      path: path
      pathIdentifier: pathIdentifier
    }
  return tree
addFolderToTree = (tree, splittedPath, index, path) ->
  calculatedPath = splittedPath.slice(0,index+1).join("/")
  [element, tree] = getElementFromTree tree, calculatedPath, true, ->
    return {
      name: splittedPath[index]
      folders: []
      files: []
      path: calculatedPath
    }
  if splittedPath.length == index+2
    element.files = addFileToTree element.files, path, splittedPath[index+1]
  else
    element.folders = addFolderToTree element.folders, splittedPath,index+1, path
  return tree
module.exports =
  data: ->
    filesTree: []
    colors: {}
    expanded: false
    saving: false
    savedSettings: []
    isHovered:false
  methods:
    hover: (e) ->
      @isHovered = true
    unhover: (e) ->
      @isHovered = false
    addFile: (path) ->
      @log "adding #{path}",2
      if atom.config.get("opened-files.asList")
        rootElement = @filesTree[0]
        unless rootElement?
          rootElement =
            name: "Opened files"
            path: ""
            folders: []
            files: []
            isRoot: true
          @filesTree.push rootElement

        rootElement.files = addFileToTree rootElement.files, path
      else
        result = atom.project.relativizePath path
        if result?[0]?
          rootName = result[0].split(sep).pop()
          rootElement = wherePath @filesTree, result[0]
          unless rootElement?
            rootElement =
              name: rootName
              path: result[0]
              folders: []
              files: []
            @filesTree.push rootElement
            sortByName @filesTree
          splittedPath = result[1].split(sep)
          if splittedPath.length == 1
            rootElement.files = addFileToTree rootElement.files, path, splittedPath[0]
          else
            rootElement.folders = addFolderToTree rootElement.folders, splittedPath, 0, path
    selected: (path) ->
      @$broadcast "selected", path
    resize: ->
      treeManager.autoHeight()
    colorChangeCb: (path, color) ->
      if @? and @colors?
        @log "colorChangeCb called", 2
        @colors[path] = color
        @$broadcast "color", path
    redraw: ->
      @filesTree = []
      for path in settings
        @addFile path
    removePath: (path) ->
      i = settings.indexOf(path)
      if i > -1
        settings.splice(i, 1)
    save: ->
      if @saving == false
        @saving = true
        @log "saving",2
        projectManager.addToProjectSetting settings
        @savedSettings = settings.slice()
        @saving = false
      else
        @log "delaying save", 2
        setTimeout (=>@saving = false), 90
        setTimeout @save, 100
    closeUnsaved: ->
      for path in settings
        if @savedSettings.indexOf(path) == -1
          @$broadcast "close", path
  beforeCompile: ->
    sep = require("path").sep
    projectManager ?= require("./../lib/project-manager")
    treeManager ?= require("./../lib/tree-manager")
    settings = projectManager.getProjectSetting()
    settings = [] unless Array.isArray settings
    @savedSettings = settings.slice()
    @log "beforeCompile",2
  created: ->
    @$on "removeFolder", (entry) =>
      @filesTree.$remove entry
      return false
  compiled: ->
    for path in settings
      @addFile path
    @addDisposable atom.workspace.observeTextEditors (editor) =>
      if editor?.getPath?
        path = editor.getPath()
        if path? and settings.indexOf(path) == -1
          @addFile path
          settings.push path
    @addDisposable atom.commands.add 'atom-workspace',
      'opened-files:close-all-but-saved': @closeUnsaved
    @addDisposable atom.config.onDidChange 'opened-files.asList', @redraw
    @addDisposable atom.config.onDidChange 'opened-files.highlightOnHover', @redraw
    @addDisposable atom.config.onDidChange 'opened-files.debug', @redraw
    @addDisposable atom.config.observe 'opened-files.colorStyle', @redraw
    @log "compiled",2
  ready: ->
    @log "ready",2
  attached: ->
    @log "attached",2
</script>
