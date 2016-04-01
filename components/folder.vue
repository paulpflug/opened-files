// out: ../components_compiled/
<template>
  <li
    class="directory list-nested-item"
    @mouseenter="hover"
    @mouseleave="unhover"
    @mouseover="highlight"
    @mouseout="unhighlight"
    :class="{
      selected: isSelected,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
      'of-highlight':isHighlight && shouldHighlight
    }">
    <div class="header list-item folder"
    @click="onClick"
    >
      <span class="name" data-name={{entry.name}} data-path={{entry.path}}>{{entry.name}}</span>

      <span :class="{hidden: !isHovered}" class="icon icon-x" @click="close">
      </span>
    </div>
    <ol class="entries list-tree" @mouseover="unhighlight">
      <folder :entry="entry" v-for="entry in entry.folders" track-by="path">
      </folder>
      <file :entry="entry" v-for="entry in entry.files" track-by="path">
      </file>
    </ol>
  </li>
</template>

<script lang="coffee">
treeManager = null
module.exports =
  name: "folder"
  components:
    "file": require "./file"
  replace:true
  props:
    entry:
      type: Object
  data: ->
    disposable: null
    isSelected: false
    isCollapsed: false
    isHovered: false
    shouldHighlight: atom.config.get("opened-files.highlightOnHover")
    isHighlight: false
    color: false
    log: ->
  methods:
    hover: (e) ->

      @isHovered = true

    unhover: (e) ->
      e.stopPropagation()
      @isHovered = false
    highlight: (e) ->

      @isHighlight = true

    unhighlight: (e) ->
      e.stopPropagation()
      @isHighlight = false

    close: (e) ->
      @log "closing",2
      e.stopPropagation()
      @$broadcast "close"
    onClick: (e) ->
      @log "selecting",2
      @$root.selected(@entry.path)
      @toggleFolder()
      e.stopPropagation()
    toggleFolder: ->
      @isCollapsed = !@isCollapsed
      setTimeout @$root.resize, 1
    isEmpty: ->
      return true unless @?
      return @entry.files.length == 0 and @entry.folders.length == 0
  compiled: ->
    @log = @$root.logger("file")
    @log "compiled",2
    {CompositeDisposable} = require 'atom'
    @disposables = new CompositeDisposable
    @disposables.add atom.config.onDidChange 'opened-files.highlightOnHover', =>
      @shouldHighlight = atom.config.get("opened-files.highlightOnHover")
  created: ->
    @log "created",2
    @$on "selected", (path) =>
      @isSelected = path == @entry.path
      return true
    @$on "removeFile", (entry) =>
      @log "removing #{entry.path}"
      try
        @entry.files.$remove entry
      if @isEmpty()
        @$dispatch "removeFolder", @entry if @?
      return false
    @$on "removeFolder", (entry) =>
      if entry != @entry
        try
          @entry.folders.$remove entry
        if @isEmpty()
          @$dispatch "removeFolder", @entry if @?
      return false
  beforeDestroy: ->
    @log "beforeDestroy",2
    @disposable?.dispose()
</script>
