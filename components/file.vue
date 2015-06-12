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
    <span class="icon icon-paintcan" v-on="click: paint">
    </span>
    <span class="icon icon-x" v-on="click: close">
    </span>
  </li>

</template>

<script lang="coffee">
log = null
treeManager = null
CompositeDisposable = null
timeouts = []

module.exports =
  data: ->
    #isSelected: false
    #v-class="selected: isSelected"
    isPinned: false
    disposables: null
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
      panes = atom.workspace.getPaneItems()
      path = @entry.path
      for pane in panes
        if pane.getPath
          panePath = pane.getPath()
          if panePath == path
            log "destroying #{panePath}"
            pane.destroy()

    paint: (e) ->
      @$root["color-picker"].getNewColor e.x, e.y, @entry.color, (newColor) =>
        @entry.color = newColor
        @paintTabs()
        @$dispatch("notifyColor", @entry.path, @entry.color)
      e.stopPropagation()
    togglePin: (e) ->
      @isPinned = !@isPinned
      @entry.pinned = @isPinned
      @$dispatch("notifyPinned", @entry.path, @entry.pinned)
      unless @isPinned
        opened = false
        panes = atom.workspace.getPaneItems()
        for pane in panes
          if pane.getPath
            panePath = pane.getPath()
            if panePath == @entry.path
              opened = true
        unless opened
          @$root.removeFile @entry.path
      e.stopPropagation()
    onClick: (e) ->
      @$dispatch("notifySelect", @entry.path)
      atom.workspace.open(@entry.path,searchAllPanes: true)
      setTimeout @paintTabs,50
      e.stopPropagation()
    paintTabs: ->
      log "painting Tabs #{@entry.path}"
      tabs = document.querySelectorAll ".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='#{@entry.path.replace(/\\/g,"\\\\")}']"
      if @entry.color
        for tab in tabs
          tab.parentElement.setAttribute "style",
            """
            background-image: -webkit-linear-gradient(top, #{@entry.color} 0%, rgba(0,0,0,0) 100%);
            """
        @$el.setAttribute "style",
          "background-image: -webkit-linear-gradient(right, #{@entry.color} 0%, rgba(0,0,0,0) 100%);"
      else
        for tab in tabs
          tab.parentElement.removeAttribute "style"
        @$el.removeAttribute "style"
  beforeCompile: ->
    log ?= require("./../lib/log")("file-comp")
    treeManager ?= require("./../lib/tree-manager")
    CompositeDisposable ?= require('atom').CompositeDisposable
    @disposables = new CompositeDisposable
    @disposables.add atom.workspace.onDidDestroyPaneItem ({item,pane,index}) =>
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
    @disposables?.dispose()
  created: ->
    @isPinned = @entry.pinned
    @$on "selected", (path) =>
      @isSelected = path == @entry.path
      return true
    @$on "close" , =>
      @close() unless @isPinned
    @$on "paint", =>
      @paintTabs() if @entry.color


  destroyed: ->
    treeManager?.autoHeight()
  attached: ->
    @paintTabs() if @entry.color
    treeManager?.autoHeight()
</script>
