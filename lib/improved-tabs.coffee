
log = require("./log")(atom.inDevMode(),"improved-tabs")
{CompositeDisposable} = require 'atom'
paths = {}

parsePath = (path) ->
  result = {}
  relativePath = atom.project.relativizePath path
  if relativePath?[0]
    splitted = relativePath[1].split("/")
    result.filename = splitted.pop()
    last = ""
    if splitted.length > 0
      last = splitted.pop()
    last += "/"
    if splitted.length > 0
      result.foldername = splitted.map(-> return "...").join("/")+"/"+last
    else
      result.foldername = last
  else
    splitted = path.split("/")
    result.filename = splitted.pop()
    result.foldername = "/.../"+splitted.pop()+"/"
  return result

improveAllTabs = ->
  log "improving all tabs"
  paneItems = atom.workspace.getPaneItems()
  for paneItem in paneItems
    if paneItem.getPath?
      path = paneItem.getPath()
      log "working with tab #{path}"
      tabs = document.querySelectorAll ".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='#{path}']"
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
        setTimeout improveAllTabs, 100
      @disposables.add atom.workspace.onDidDestroyPaneItem improveAllTabs

  destroy: ->
    @disposables?.dispose()
    @disposables = null
