<template>
  <li
    class="file list-item"
    v-on="click: onClick, mouseover: highlight, mouseleave: unhighlight"
    v-class="
    selected: isSelected,
      of-highlight:isHovered && shouldHighlight
      "
    >
    <span class="icon icon-x"
      v-class="notHovered:!isHovered"
      v-on="click: close">
    </span>
    <span class="name">
      {{entry.name}}
    </span>
    <span class="path" v-if="entry.pathIdentifier">
      {{entry.pathIdentifier}}
    </span>
    <span class="icon icon-paintcan" v-if="isHovered && hasColorPicker" v-on="click: colorPicker">
    </span>
  </li>

</template>

<script lang="coffee">
module.exports =
  replace: true
  data: ->
    isSelected: false
    hasColorPicker: false
    isHovered: false
    shouldHighlight: atom.config.get("opened-files.highlightOnHover")
    disposable: null
  methods:
    highlight: (e) ->
      e.stopPropagation()
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
            @$root.logFile "destroying #{panePath}"
            pane = atom.workspace.paneForItem(paneItem)
            if pane?.promptToSaveItem(paneItem)
              paneItem.destroy?()
              true
      @$dispatch "removeFile", @entry
      @$root.removePath @entry.path
    color: ->
      color = @$root?.colors?[@entry.path]
      if color?
        if color
          @$el.setAttribute "style",
            "background-image: -webkit-linear-gradient(right, #{color} 0%, rgba(0,0,0,0) 100%);"
        else
          @$el.removeAttribute "style"
    colorPicker: (e) ->
      e.stopPropagation()
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
    @$root.logFile "beforeDestroy",2
    @disposable?.dispose()
  created: ->
    @$root.logFile "created",2
    @$on "selected", (path) =>
      @isSelected = path == @entry.path
      return true
    @$on "close" , =>
        @close()
    @$on "noColorPicker", => @hasColorPicker = false
    @hasColorPicker = @$root.colorPicker?
    @$on "color", (path) =>
      if path == @entry.path
        @$root?.logFile "got new color",2
        @color()
  compiled: ->
    @$root?.logFile "compiled",2
    @color()

  destroyed: ->
    @$root?.logFile "destroyed",2
    @$root?.resize()
  attached: ->
    @$root.logFile "attached",2
    @$root.resize()
</script>
