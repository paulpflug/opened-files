sep = require("path").sep
log = require("./log")("improved-tabs")

{CompositeDisposable} = require 'atom'
paths = {}

parsePath = (path) ->
  result = {}
  relativePath = atom.project.relativizePath path
  if relativePath?[0]
    splitted = relativePath[1].split(sep)
    result.filename = splitted.pop()
    last = ""
    if splitted.length > 0
      last = splitted.pop()
    last += sep
    if splitted.length > 0
      result.foldername = splitted.map(-> return "...").join(sep)+sep+last
    else
      result.foldername = last
  else
    splitted = path.split(sep)
    result.filename = splitted.pop()
    result.foldername = "#{sep}...#{sep}"+splitted.pop()+sep
  return result

improveAllTabs = ->
  log "improving all tabs"
  paneItems = atom.workspace.getPaneItems()
  for paneItem in paneItems
    if paneItem.getPath?
      path = paneItem.getPath()
      if path?
        #log "working with tab #{path}"
        tabs = document.querySelectorAll ".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='#{path.replace(/\\/g,"\\\\")}']"
        for tab in tabs
          unless tab.querySelector ".folder"
            paths[path] ?= parsePath path
            tab.innerHTML = ""
            container = document.createElement("div")
            container.classList.add "improved-tabs"
            foldernameElement = document.createElement("span")
            foldernameElement.classList.add "folder"
            foldernameElement.innerHTML = paths[path].foldername
            container.appendChild foldernameElement
            filenameElement = document.createElement("span")
            filenameElement.classList.add "file"
            filenameElement.innerHTML = paths[path].filename
            container.appendChild filenameElement
            tab.appendChild container
module.exports =
class ImprovedTabs

  disposables: null
  constructor: (serializedState) ->
    log "loading improved tabs"
    improveAllTabs()
    unless @disposables?
      @disposables = new CompositeDisposable
      @disposables.add atom.workspace.onDidAddTextEditor ->
        setTimeout improveAllTabs, 10
      @disposables.add atom.workspace.onDidDestroyPaneItem ->
        log "pane Item destroyed"
        setTimeout improveAllTabs, 10

  destroy: ->
    @disposables?.dispose()
    @disposables = null
