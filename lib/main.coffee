OpenedFiles = null
log = null
logger = null
reloader = null
compile = null

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


  activate: ->
    if atom.inDevMode()
      setTimeout (->
        reloaderSettings = pkg:pkgName,folders:["lib","styles","components"]
        try
          reloader ?= require("atom-package-reloader")(reloaderSettings)
        ),500
    unless log?
      logger ?= require("atom-simple-logger")(pkg:pkgName)
      log = logger("main")
      log "activating"
    if atom.inDevMode()
      log "compiling components"
      try
        compile ?= require("atom-vue-component-compiler")(packageName: pkgName)
      if compile?
        @compiling = compile ["app","file","folder"]
    unless @openedFiles?
      compileAndLoad = =>
        load = =>
          log "loading core"
          try
            OpenedFiles ?= require "./#{pkgName}"
            @openedFiles = new OpenedFiles(logger)
          catch e
            log "loading core failed"
            log e.message if e?.message?
          if @openedFiles?.comps?.app?
            @openedFiles.comps.app.colorPicker = @colorPicker
            @openedFiles.comps.app.changeColor = @changeColor
            @cbHandler = @colorChangeCb? @openedFiles.comps.app.colorChangeCb
        if @compiling?
          @compiling.then load
        else
          load()
      if atom.packages.isPackageActive("tree-view")
        log "tree-view already loaded"
        compileAndLoad()
      else
        log "waiting for tree-view to load"
        @onceActivated = atom.packages.onDidActivatePackage (p) =>
          if p.name == "tree-view"
            compileAndLoad()
            @onceActivated.dispose()

  deactivate: ->
    log "deactivating"
    @onceActivated?.dispose?()
    @openedFiles?.destroy()
    @openedFiles = null
    @colorPicker = null
    @changeColor = null
    @cbHandler?.dispose?()
    @colorChangeCb = null
    if atom.inDevMode()
      reloader?.dispose()
      reloader = null
      log = null
      logger = null
      compile = null
      OpenedFiles = null

  consumeColorPicker: (colorPicker) =>
    log? "consuming colorPicker"
    @colorPicker = colorPicker
    @openedFiles?.comps?.app?.colorPicker = @colorPicker
  consumeChangeColor: (changeColor) =>
    log? "consuming changeColor"
    @changeColor = changeColor
    @openedFiles?.comps?.app?.changeColor = @changeColor
  consumeColorChangeCb: (colorChangeCb) =>
    log? "consuming colorChangeCb"
    @colorChangeCb = colorChangeCb
    @cbHandler?.dispose?()
    if @openedFiles?.comps?.app?
      @cbHandler = @colorChangeCb @openedFiles.comps.app.colorChangeCb
