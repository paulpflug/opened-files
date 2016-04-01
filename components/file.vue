// out: ../components_compiled/
<template>
  <li
    class="file list-item"
    @click="onClick"
    @mouseenter="highlight"
    @mouseleave="unhighlight"
    :style="style"
    :class="{
     selected: isSelected,
     'of-highlight':isHovered && shouldHighlight,
     'of-hovered': isHovered}
      "
    >
    <span class="icon icon-x"
      :class="{'not-hovered':!isHovered}"
      @click="close">
    </span>
    <span class="name">
      {{entry.name}}
    </span>
    <span class="path" v-if="entry.pathIdentifier">
      {{entry.pathIdentifier}}
    </span>
    <span class="icon icon-paintcan" v-if="isHovered && hasColorPicker" @click="colorPicker">
    </span>
  </li>

</template>

<script lang="coffee">
module.exports =
  props:
    entry:
      type: Object
  replace: true
  data: ->
    isSelected: false
    hasColorPicker: false
    isHovered: false
    shouldHighlight: atom.config.get("opened-files.highlightOnHover")
    colorStyle: atom.config.get("opened-files.colorStyle")
    disposable: null
    style:
      "background-image": null
      "border-right": null
      "background": null
      "color":null
    log: ->
  methods:
    highlight: (e) ->

      if @shouldHighlight
        tabs = document.querySelectorAll ".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='#{@entry.path.replace(/\\/g,"\\\\")}']"
        for tab in tabs
          tab.parentNode.classList.add "of-highlight"
      @isHovered = true

    unhighlight: (e) ->
      e.stopPropagation()
      if @shouldHighlight
        tabs = document.querySelectorAll ".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='#{@entry.path.replace(/\\/g,"\\\\")}']"
        for tab in tabs
          tab.parentNode.classList.remove "of-highlight"
      @isHovered = false

    close: (e) ->
      e?.stopPropagation()
      paneItems = atom.workspace.getPaneItems()
      path = @entry.path
      for paneItem in paneItems
        if paneItem.getPath
          panePath = paneItem.getPath()
          if panePath == path
            @log "destroying #{panePath}"
            pane = atom.workspace.paneForItem(paneItem)
            if pane?.promptToSaveItem(paneItem)
              paneItem.destroy?()
              true
      @$dispatch "removeFile", @entry
      @$root.removePath @entry.path
    color: ->
      color = @$root?.colors?[@entry.path]
      style = {
        "background-image": null
        "border-right": null
        "background": null
        "color":null
      }
      if color?
        @log "coloring #{@entry.path}",2
        if color
          switch @colorStyle
            when "gradient"
              style["background-image"] = "-webkit-linear-gradient(right, #{color} 0%, rgba(0,0,0,0) 100%)"
            when "border"
              style["border-right"] = "solid 6px #{color}"
            when "solid"
              style["background"] = "#{color}"
              if parseInt(color.replace('#', ''), 16) > 0xffffff/2
                style.color = "black"
              else
                style.color = "white"
        @style = style
    colorPicker: (e) ->
      e.preventDefault()
      unless @$root.colorPicker? and @$root.changeColor?
        @$root.$broadcast "noColorPicker"
        atom.notifications.addError("package missing: `color-tabs` or `color-picker-service`")
        return
      @$root.colorPicker {x:e.x, y:e.y, color:@$root?.colors?[@entry.path]}, (newColor) =>
        @$root.changeColor? @entry.path, newColor
    onClick: (e) ->
      @$root.selected(@entry.path)
      atom.workspace.open(@entry.path,searchAllPanes: true)
      e.stopPropagation()

  beforeDestroy: ->
    @log "beforeDestroy",2
    @disposable?.dispose()
  created: ->
    @log "created",2
    @$on "selected", (path) =>
      @isSelected = path == @entry.path
      return true
    @$on "close" , (path) =>
      if path?
        if path == @entry.path
          @close()
      else
        @close()
    @$on "noColorPicker", => @hasColorPicker = false
    @hasColorPicker = @$root.colorPicker?
    @$on "color", (path) =>
      if path == @entry.path
        @log "got new color",2
        @color()
  compiled: ->
    @log = @$root.logger("file")
    @log "compiled",2
    {CompositeDisposable} = require 'atom'
    @disposables = new CompositeDisposable
    @disposables.add atom.config.onDidChange 'opened-files.colorStyle', =>
      @colorStyle = atom.config.get("opened-files.colorStyle")
      @color()
    @disposables.add atom.config.onDidChange 'opened-files.highlightOnHover', =>
      @shouldHighlight = atom.config.get("opened-files.highlightOnHover")
    @color()

  destroyed: ->
    @log "destroyed",2
  attached: ->
    @log "attached",2
</script>
