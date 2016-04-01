log = () ->
logger = () -> () ->
Vue = null
app = null
pkgName = "opened-files"

module.exports = new class Main
  openedFiles: null
  config:
    highlightOnHover:
      title: "Highlighting"
      description: "Highlights file entry and tab on hovering"
      type: "boolean"
      default: true
    asList:
      title: "Opened file as List"
      description: "If unchecked will display a tree view"
      type: "boolean"
      default: true
    colorStyle:
      title: "Color style"
      description: "works only in conjunction with the color-tabs package"
      type: "string"
      default: "gradient"
      enum: ["gradient","border","solid"]
    debug:
      type: "integer"
      default: 0
      minimum: 0
    mfpIdent:
      title: "Multi-folder project identifier"
      type: "integer"
      default: "0"
      description: "length of the identifier, if set to 0 will use numbers instead"

  activate: ->
    activate = =>
      log "activating"
      load = =>
        log "loading core"
        Vue = require "vue"
        app = Vue.extend(require("../components_compiled/app.js"))
        app = new app({
          data:
            logger: logger
            colorPicker: @colorPicker
            changeColor: @changeColor
          })
        @cbHandler = @colorChangeCb? app.colorChangeCb
        tv = atom.packages.getActivePackage("tree-view")?.mainModule
          .treeView.element
        app.$before tv.firstChild if tv?
        #if @openedFiles?.comps?.app?
          #@openedFiles.comps.app.colorPicker = @colorPicker
          #@openedFiles.comps.app.changeColor = @changeColor
          #@cbHandler = @colorChangeCb? @openedFiles.comps.app.colorChangeCb
      if atom.packages.isPackageActive("tree-view")
        log "tree-view already loaded"
        load()
      else
        log "waiting for tree-view to load"
        @onceActivated = atom.packages.onDidActivatePackage (p) =>
          if p.name == "tree-view"
            load()
            @onceActivated.dispose()
    if atom.inDevMode()
      try
        setTimeout activate,100
      catch e
        console.log e.message if e?.message?
    else
      setTimeout activate,100

  deactivate: ->
    log "deactivating"
    @onceActivated?.dispose?()
    @openedFiles?.destroy()
    @openedFiles = null
    @colorPicker = null
    @changeColor = null
    @cbHandler?.dispose?()
    @colorChangeCb = null
    app?.$destroy?(true)
    if atom.inDevMode()
      log = null
      logger = null
      Vue = null

  consumeDebug: (debugSetup) ->
    logger = debugSetup(pkg: pkgName)
    log = logger("main")
    log "consuming debug"
  consumeColorPicker: (colorPicker) =>
    log "consuming colorPicker"
    @colorPicker = colorPicker
    app?.colorPicker = @colorPicker
  consumeChangeColor: (changeColor) =>
    log "consuming changeColor"
    @changeColor = changeColor
    app?.changeColor = @changeColor
  consumeColorChangeCb: (colorChangeCb) =>
    log "consuming colorChangeCb"
    @colorChangeCb = colorChangeCb
    @cbHandler?.dispose?()
    if app?
      @cbHandler = @colorChangeCb app.colorChangeCb
  consumeAutoreload: (reloader) ->
    log "consuming consumeAutoreload"
    reloader(pkg:pkgName,folders:["lib/","components_compiled/"])
