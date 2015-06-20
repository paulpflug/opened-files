OpenedFiles = null
log = null
logger = null
reloader = null
compile = null

pkgName = "opened-files"

module.exports = new class Main
  openedFiles: null
  config:
    asList:
      type: "boolean"
      default: true
    debug:
      type: "integer"
      default: 0
      minimum: 0

  activate: ->
    setTimeout (->
      reloaderSettings = pkg:pkgName,folders:["lib","styles","components"]
      try
        reloader ?= require("atom-package-reloader")(reloaderSettings)
      ),500
    unless log?
      logger = require("atom-simple-logger")(pkg:pkgName)
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
          if @openedFiles?.comps?.app?
            @openedFiles.comps.app.colorPicker = @colorPicker
            @openedFiles.comps.app.changeColor = @changeColor
            @colorChangeCb @openedFiles.comps.app.colorChangeCb
        if @compiling?
          @compiling.then load
        else
          load()
      if atom.packages.isPackageActive("tree-view")
        compileAndLoad()
      else
        @onceActivated = atom.packages.onDidActivatePackage (p) =>
          if p.name == "tree-view"
            compileAndLoad()
            @onceActivated.dispose()

  deactivate: ->
    log "deactivating"
    @onceActivated?.dispose?()
    @openedFiles?.destroy()
    reloader?.dispose()
    reloader = null
    load = null
    log = null
    compile = null

  consumeColorPicker: (colorPicker) =>
    @colorPicker = colorPicker
  consumeChangeColor: (changeColor) =>
    @changeColor = changeColor
  consumeColorChangeCb: (colorChangeCb) =>
    @colorChangeCb = colorChangeCb
