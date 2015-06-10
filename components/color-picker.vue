<template>
  <div tabindex="-1" v-on="click: focusEl" class="opened-files color-picker-container">

  </div>
  <button v-on="click: selectColor" class="btn btn-primary icon icon-paintcan">Color</button>
  <button v-on="click: unColor" class="btn">Uncolor</button>
</template>
<script lang="coffee">
log = null
ColorPicker = null
CompositeDisposable = null
module.exports =
  data: ->
    color: null
    disposables: null
    scp: null
  beforeCompile: ->
    log ?= require("./../lib/log")(atom.inDevMode(),"color-picker")
    CompositeDisposable ?= require('atom').CompositeDisposable
    @disposables = new CompositeDisposable
  ready: ->
    log "ready"
    ColorPicker ?= require "simple-color-picker"
    @scp = new ColorPicker el: document.querySelector ".opened-files.color-picker-container"
    @scp.setColor(@color)
  attached: ->
    log "attached"
    @scp?.setColor(@color)
  detached: ->
    log "detached"
    @disposables?.dispose()

  methods:
    selectColor: ->
      @color = @scp.getHexString()
      log "coloring with #{@color}"
      @cb?(@color)
      @detach()
    unColor: ->
      log "uncoloring"
      @cb?(false)
      @detach()
    detach: ->
      log "detaching"
      @cb = null
      try
        @$remove()
      catch
    focusEl: ->
      @$el.focus()
    getRandomColor: ->
      letters = '0123456789ABCDEF'.split('')
      color = '#'
      for i in [0..5]
        color += letters[Math.floor(Math.random() * 16)]
      return color
    getNewColor: (x, y, oldColor, cb) ->
      @cb = cb
      if oldColor
        @color = oldColor
      else
        @color = @getRandomColor()
      unless @$el?
        container = document.createElement("div")
        container.classList.add "opened-files"
        container.classList.add "color-picker"
        container.setAttribute "tabindex", "-1"
        container.addEventListener "blur", (e) =>
          log "catched blur"
          if e.relatedTarget.parentNode != e.target
            @detach
        @$mount container
      @$el.setAttribute "style", "top:#{y}px;left:#{x}px;"
      @$appendTo document.body
      @disposables.add atom.commands.add "atom-workspace",
        "core:cancel", @detach
</script>
