compile = null
load = null
log = require("./log")(atom.inDevMode())
{CompositeDisposable} = require 'atom'

packageName = "opened-files"
compNames = ["color-picker","file","folder","app"]
compTree = {
  app:
    "file": null
    "folder": null
  "color-picker": null
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
      @element.classList.add('file-list')
      @element.classList.add(packageName)
    unless @comps?
      load ?= require "atom-vue-component-loader"
      @comps = load compTree,
        cwd: "#{atom.packages.resolvePackagePath(packageName)}/components_compiled/"
        reload: reload
      @comps.app.$mount(@element)
      @comps.app["color-picker"] = @comps["color-picker"]
    unless @disposables?
      @disposables = new CompositeDisposable
      @disposables.add atom.workspace.observeTextEditors (editor) =>
        path = editor.getPath()
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
          @comps.app.getUnpinned (path) ->
            for pane in panes
              if pane.getPath
                panePath = pane.getPath()
                if panePath == path
                  log "destroying #{panePath}"
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
    @comps?["color-picker"]?.$destroy true
    @comps = null
    @disposables?.dispose()
    @disposables = null
    @element?.parentNode?.removeChild?(@element)
    @element = null

  toggle: =>
    if @element?
      treeView = document.querySelector "div.tree-view-scroller"
      if @element.style.display == "" or @element.style.display=="block"
        @element.style.display="none"
        treeView?.setAttribute "style", "height:100%"
      else
        @element.style.display="block"
        treeView?.removeAttribute "style"
    else
      @draw()
