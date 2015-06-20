<template>
  <li
    class="file list-item"
    v-on="click: onClick, mouseenter: highlightTab, mouseleave: unhighlightTab"
    >
    <span class="name icon">
      {{entry.name}}
    </span>
    <span class="icon icon-pin"
      v-class="unpinned: !isPinned"
      v-on="click: togglePin">
    </span>
    <span class="icon icon-paintcan" v-if="hasColorPicker" v-on="click: colorPicker">
    </span>
    <span class="icon icon-x" v-on="click: close">
    </span>
  </li>

</template>

<script lang="coffee">
timeouts = []

module.exports =
  replace: true
  data: ->
    #isSelected: false
    #v-class="selected: isSelected"
    isPinned: false
    hasColorPicker: false
    disposable: null
  methods:
    highlightTab: (e) ->
      tabs = document.querySelectorAll ".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='#{@entry.path.replace(/\\/g,"\\\\")}']"
      for timeout in timeouts
        clearTimeout(timeout)
      timeouts = []
      for tab in tabs
        tab.parentNode.classList.remove "of-unhighlighted"
        tab.parentNode.classList.add "of-highlighted"
      @$el.classList.remove "of-unhighlighted"
      @$el.classList.add "of-highlighted"
      e.stopPropagation()
    unhighlightTab: (e) ->
      tabs = document.querySelectorAll ".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='#{@entry.path.replace(/\\/g,"\\\\")}']"
      for tab in tabs
        tab.parentNode.classList.remove "of-highlighted"
        tab.parentNode.classList.add "of-unhighlighted"
        remover = (tab) ->
          timeouts.push(setTimeout (->tab.parentNode.classList.remove "of-unhighlighted"),300)
        remover(tab)
      @$el.classList.remove "of-highlighted"
      @$el.classList.add "of-unhighlighted"
      timeouts.push(setTimeout (=>@$el.classList.remove "of-unhighlighted"),300)
      e.stopPropagation()
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
    togglePin: (e) ->
      @isPinned = !@isPinned
      @entry.pinned = @isPinned
      @$root.pinned @entry.path, @entry.pinned
      unless @isPinned
        opened = false
        panes = atom.workspace.getPaneItems()
        for pane in panes
          if pane.getPath
            panePath = pane.getPath()
            if panePath == @entry.path
              opened = true
        unless opened
          @$dispatch "removeFile", @entry
      e?.stopPropagation()
    onClick: (e) ->
      @$root.selected(@entry.path)
      atom.workspace.open(@entry.path,searchAllPanes: true)
      e.stopPropagation()

  beforeCompile: ->
    @disposable = atom.workspace.onDidDestroyPaneItem ({item,pane,index}) =>
      if item.getPath
        closedPath = item.getPath()
        if @? and @isPinned? and @entry?.path?
          if closedPath == @entry.path and not @isPinned
            # see if path is still opened
            remainingTextEditors = atom.workspace.getTextEditors()
            for te in remainingTextEditors
              if te.getPath() == closedPath
                return null
            @$dispatch "removeFile", @entry
  beforeDestroy: ->
    @$root.logFile "beforeDestroy",2
    @disposable?.dispose()
  created: ->
    @$root.logFile "created",2
    @isPinned = @entry.pinned
    @$on "selected", (path) =>
      @isSelected = path == @entry.path
      return true
    @$on "close" , =>
      unless @isPinned
        @close()
    @$on "pin", (path) =>
      if path? and path == @entry.path
        @togglePin()
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
