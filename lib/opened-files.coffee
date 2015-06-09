{CompositeDisposable, Directory} = require 'atom'

log = null

reload = null

OFView = null

module.exports = new class OpenedFiles
  ofView: null
  disposables: null

  activate: () ->
    log = require("./log")(atom.inDevMode())
    @disposables = new CompositeDisposable

    unless @ofView?
      OFView ?= require './opened-files-view'
      @ofView = new OFView
      atom.packages.onDidActivatePackage (p) =>
        if p.name == "tree-view"
          try
            @ofView.draw()
          catch
            @ofView.reload()
            .then =>
              try
                @ofView.draw()
              catch
                log "drawing of opened files failed"
    @disposables.add atom.commands.add('atom-workspace', {
      'opened-files:toggle': => @ofView.toggle()
    })
    if atom.inDevMode()
      rootDir = new Directory(atom.packages.resolvePackagePath("opened-files"))

      @disposables.add rootDir.getSubdirectory("lib").onDidChange @redraw
      @disposables.add rootDir.getSubdirectory("components").onDidChange @redraw

  deactivate: ->
    @disposables.dispose()
    @ofView?.destroy()
    @ofView = null

  serialize: ->

  redrawing: false
  redraw: =>
    log "redraw issued"
    if @redrawing
      log "redraw already in progress - canceled request"
      return null
    else
      @redrawing = true
      log "starting redraw"
      setTimeout (->@redrawing = false), 1000
    try
      reload ?= require "simple-reload"
    catch
      log "simple-reload is missing - no reloading possible"
      return null
    @ofView.destroy()
    OFView = reload './opened-files-view'
    @ofView = new OFView
    @ofView.reload()
    .then =>
      @ofView.draw()
      log "finished redraw"
      @redrawing = false
