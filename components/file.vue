<template>
  <li
    class="file list-item"
    v-on="click: onClick, mouseenter: highlight, mouseleave: unhighlight"
    v-class="
    selected: isSelected,
      of-highlight:isHovered && shouldHighlight,
      of-hovered: isHovered
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
    colorStyle: atom.config.get("opened-files.colorStyle")
    disposable: null
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
          css = switch @colorStyle
            when "gradient" then "background-image: -webkit-linear-gradient(right, #{color} 0%, rgba(0,0,0,0) 100%);"
            when "border" then "border-right: solid 6px #{color};"
            when "solid" then  "background: #{color};"
            else ""
          if @colorStyle == "solid"
            if parseInt(color.replace('#', ''), 16) > 0xffffff/2
              text_color = "black"
            else
              text_color = "white"
            css += "color: #{text_color};"
          @$el.setAttribute "style", css
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
        @$root?.logFile "got new color",2
        @color()
  compiled: ->
    @$root?.logFile "compiled",2
    @color()

  destroyed: ->
    @$root?.logFile "destroyed",2
  attached: ->
    @$root.logFile "attached",2
</script>
