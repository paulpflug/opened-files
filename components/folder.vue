<template>
  <li
    class="directory list-nested-item"
    v-on="mouseenter: hover, mouseleave: unhover,mouseover: highlight, mouseout: unhighlight"
    v-class="
      selected: isSelected,
      collapsed: isCollapsed,
      expanded: !isCollapsed,
      of-highlight:isHighlight && shouldHighlight
    ">
    <div class="header list-item folder"
    v-on="click: onClick"
    >
      <span class="name" data-name={{entry.name}} data-path={{entry.path}}>{{entry.name}}</span>

      <span v-class="hidden: !isHovered" class="icon icon-x" v-on="click: close">
      </span>
    </div>
    <ol class="entries list-tree" v-on="mouseover: unhighlight">
      <folder v-repeat="entry: entry.folders" track-by="path">
      </folder>
      <file v-repeat="entry: entry.files" track-by="path">
      </file>
    </ol>
  </li>
</template>

<script lang="coffee">
treeManager = null
module.exports =
  replace:true
  data: -> {
      isSelected: false
      isCollapsed: false
      isHovered: false
      shouldHighlight: atom.config.get("opened-files.highlightOnHover")
      isHighlight: false
      color: false
    }
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
      @$root.logFolder "closing",2
      e.stopPropagation()
      @$broadcast "close"
    onClick: (e) ->
      @$root.logFolder "selecting",2
      @$root.selected(@entry.path)
      @toggleFolder()
      e.stopPropagation()
    toggleFolder: ->
      @isCollapsed = !@isCollapsed
      setTimeout @$root.resize, 1
    isEmpty: ->
      return true unless @?
      return @entry.files.length == 0 and @entry.folders.length == 0

  created: ->
    @$root.logFolder "created",2
    @$on "selected", (path) =>
      @isSelected = path == @entry.path
      return true
    @$on "removeFile", (entry) =>
      @$root.logFolder "removing #{entry.path}"
      try
        @entry.files.$remove entry
      setTimeout @$root?.resize,1
      if @isEmpty()
        @$dispatch "removeFolder", @entry if @?
      return false
    @$on "removeFolder", (entry) =>
      try
        @entry.folders.$remove entry
      setTimeout @$root?.resize, 1
      if @isEmpty()
        @$dispatch "removeFolder", @entry if @?
      return false
  destroyed: ->
    @$root?.resize()
</script>
