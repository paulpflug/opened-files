compile = null
load = null
reload = null

path = require "path"

{CompositeDisposable} = require 'atom'

compTree = {
  app:
    "file": null
    "folder": null
}

module.exports = class OpenedFiles
  element: null
  comps: null
  log: null
  disposables: null
  constructor: (logger) ->
    @log = logger("core")
    unless @element?
      @element = document.createElement('div')
      @element.classList.add('file-list')
      @element.classList.add("opened-files")
    unless @disposables?
      @disposables = new CompositeDisposable
      @disposables.add atom.commands.add 'atom-workspace',
        'opened-files:toggle': @toggle
    unless @comps?
      load ?= require "atom-vue-component-loader"
      @comps = load compTree,
        cwd: path.resolve path.dirname(module.filename), "../components_compiled/"
        debug: atom.inDevMode()
        reload: atom.inDevMode()
      @comps.app.log = logger("app")
      @comps.app.logFile = logger("file")
      @comps.app.logFolder = logger("folder")
      @comps.app.addDisposable = (obj) => @disposables.add obj
      @log "mounting app",2
      @comps.app.$mount(@element)

    @tv = atom.packages.getActivePackage("tree-view")?.mainModule
      .treeView.element
    @tv?.insertBefore @element, @tv.firstChild
    @log "loaded"


  destroy: ->
    @comps?.app?.$destroy true
    @comps?.app = null
    @comps = null
    @disposables?.dispose()
    @disposables = null
    @element?.parentNode?.removeChild?(@element)
    @element = null
    @log = null

  toggle: =>
    if @element?
      @log "toggling visibility"
      @element.classList.toggle "hidden"
