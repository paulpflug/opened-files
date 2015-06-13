compile = null
load = null
treeManager = null
reload = null
log = require("./log")("view")
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
      treeManager ?= require "./tree-manager.coffee"
      treeManager.setOpenedFilesElement @element
    unless @comps?
      load ?= require "atom-vue-component-loader"
      @comps = load compTree,
        cwd: "#{atom.packages.resolvePackagePath(packageName)}/components_compiled/"
        reload: reload
        debug: atom.inDevMode()
      @comps.app.$mount(@element)
      @comps.app.paint()
      @comps.app["color-picker"] = @comps["color-picker"]

    unless @disposables?
      @disposables = new CompositeDisposable
      @disposables.add atom.workspace.observeTextEditors (editor) =>
        if editor?.getPath?
          path = editor.getPath()
          @comps.app.addFile path
      @disposables.add atom.workspace.onDidAddTextEditor ({textEditor}) =>
        if textEditor?.getPath?
          log "TextEditor added #{textEditor.getPath()}"
          setTimeout (=>@comps.app.paint textEditor.getPath(), false), 50
      @disposables.add atom.commands.add 'atom-workspace',
        'opened-files:close-all-but-pinned': @comps.app.closeUnpinned
      @disposables.add atom.commands.add 'atom-workspace',
        'opened-files:color-current-tab': =>
          te = atom.workspace.getActiveTextEditor()
          if te?.getPath?
            @comps.app.paint te.getPath(), true
      @disposables.add atom.commands.add 'atom-workspace',
        'opened-files:pin-current-tab': =>
          te = atom.workspace.getActiveTextEditor()
          if te?.getPath?
            @comps.app.pin te.getPath()

  reload: =>
    log "reloading / compiling"
    reload ?= require "simple-reload"
    treeManager ?= reload "./tree-manager.coffee"
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
    treeManager.autoHeight()
    #@element.parentElement.classList.add("opened-files")


  destroy: ->
    @comps?.app?.$destroy true
    try
      @comps?["color-picker"]?.$destroy true
    catch

    @comps = null
    @disposables?.dispose()
    @disposables = null
    @element?.parentNode?.removeChild?(@element)
    @element = null
    treeManager?.destroy()
    treeManager = null

  toggle: =>
    if @element?
      log "toggling visibility"
      @element.classList.toggle "hidden"
      treeManager?.autoHeight()
    else
      @draw()
