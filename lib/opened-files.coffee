{CompositeDisposable, Directory} = require 'atom'

log = null

reload = null

OFView = null
ImprovedTabs = null

module.exports = new class OpenedFiles
  ofView: null
  improvedTabs: null
  disposables: null
  config:
    debug:
      type: "boolean"
      default: false
  activate: () ->
    log = require("./log")("core")
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
    unless @improvedTabs?
      ImprovedTabs ?= require "./improved-tabs.coffee"
      atom.packages.onDidActivatePackage (p) =>
        if p.name == "tabs"
          try
            @improvedTabs = new ImprovedTabs
          catch
            log "loading improved tabs failed"
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
    @improvedTabs?.destroy()
    @improvedTabs = null

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
      setTimeout (=>@redrawing = false), 1000
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
    @improvedTabs?.destroy()
    ImprovedTabs = reload "./improved-tabs.coffee"
    @improvedTabs = new ImprovedTabs
