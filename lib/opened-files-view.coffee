compile = null
load = null
log = require("./log")(atom.inDevMode())
{CompositeDisposable} = require 'atom'

packageName = "opened-files"
compNames = ["tree-entry","app"]
compTree = {
  app:
    "tree-entry": null
}

module.exports =
class OpenedFilesView
  element: null
  comps: null
  disposables: null
  constructor: (serializedState) ->

  load: (reload) ->
    log "loading view"
    unless @element?
      @element = document.createElement('div')
      @element.classList.add('tree-view-scroller')
      @element.classList.add(packageName)
    unless @comps?
      load ?= require "atom-vue-component-loader"
      @comps = load compTree,
        cwd: "#{atom.packages.resolvePackagePath(packageName)}/components_compiled/"
        reload: reload
      @comps.app.$mount(@element)
    unless @disposables?
      @disposables = new CompositeDisposable
      @disposables.add atom.workspace.observeTextEditors (editor) =>
        path = editor.getPath()
        relativePath = atom.project.relativizePath path
        if relativePath?[0]
          relativePath = relativePath[1].split("/")
          filename = relativePath.pop()
          lastFolder = relativePath.pop()+"/"
          relativePath = relativePath.map -> return "..."
          if relativePath.length > 0
            lastFolder = relativePath.join("/")+"/"+lastFolder
        else
          lastFolder = path.split("/")
          filename = lastFolder.pop()
          lastFolder = lastFolder.pop()+"/ "
        tabs = document.querySelectorAll ".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='#{path}']"
        for tab in tabs
          tab.innerHTML = ""
          lastFolderElement = document.createElement("span")
          lastFolderElement.classList.add "folder"
          lastFolderElement.setAttribute "style", "color:#777;position:absolute;top:-5px"
          lastFolderElement.innerHTML = lastFolder
          tab.appendChild lastFolderElement
          filenameElement = document.createElement("span")
          filenameElement.setAttribute "style", "position:absolute;top:+8px"
          filenameElement.innerHTML = filename
          tab.appendChild filenameElement
        @comps.app.addFile path
      @disposables.add atom.workspace.onDidDestroyPaneItem ({item,pane,index}) =>
        if item.getPath
          closedPath = item.getPath()
          # see if path is still opened
          remainingTextEditors = atom.workspace.getTextEditors()
          for te in remainingTextEditors
            if te.getPath() == closedPath
              return null
          @comps.app.removeFile closedPath
      @disposables.add atom.commands.add('atom-workspace', {
        'opened-files:close-all-but-pinned': =>
          panes = atom.workspace.getPaneItems()
          filesToClose = @comps.app.getUnpinned()
          console.log filesToClose
          for pane in panes
            if pane.getPath
              panePath = pane.getPath()
              console.log panePath
              if filesToClose.indexOf(panePath) > -1
                console.log "destroying"
                pane.destroy()
      })
  reload: =>
    log "reloading / compiling"
    try
      compile ?= require("atom-vue-component-compiler")(packageName: packageName)
    catch
      throw new Error "atom-vue-component-compiler
        required for reloading components"
    return compile compNames
      .then =>
        @load(true)
      .catch (e) ->
        console.log e
        console.log e.stack

  draw: =>
    log "drawing"
    @load() unless @element? or @comps? or @disposables?
    #@panel = atom.workspace.addLeftPanel(item: @element, priority: 20)
    @tv = atom.packages.getActivePackage("tree-view")?.mainModule.treeView.element
    @tv?.insertBefore @element, @tv.firstChild
    #@element.parentElement.classList.add("opened-files")


  destroy: ->
    @comps?.app?.$destroy true
    @comps = null
    @disposables?.dispose()
    @disposables = null
    @element?.parentNode?.removeChild?(@element)
    @element = null

  toggle: =>
    if @element.style.display == "" or @element.style.display=="block"
      @element.style.display="none"
    else
      @element.style.display="block"
