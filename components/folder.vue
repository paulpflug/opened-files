<template>
  <li
    class="directory list-nested-item"
    v-on="click: onClick"
    v-class="
      selected: isSelected,
      collapsed: isCollapsed,
      expanded: !isCollapsed
    ">
    <div class="header list-item">
      <span class="name icon icon-file-directory" data-name={{entry.name}} data-path={{entry.path}}>{{entry.name}}</span>
      <span class="icon icon-x" v-on="click: close">
      </span>
    </div>
    <ol class="entries list-tree">
      <folder v-repeat="entry: entry.folders" track-by="name">
      </folder>
      <file v-repeat="entry: entry.files" track-by="name">
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
      color: false
    }
  methods:
    close: (e) ->
      e.stopPropagation()
      @$broadcast "close"

    onClick: (e) ->
      @$root.selected(@entry.path)
      @toggleFolder()
      e.stopPropagation()
    toggleFolder: ->
      @isCollapsed = !@isCollapsed
      @$root?.resize()
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
      catch

      if @isEmpty()
        @$dispatch "removeFolder", @entry if @?
      return false
    @$on "removeFolder", (entry) =>
      try
        @entry.folders.$remove entry
      catch

      if @isEmpty()
        @$dispatch "removeFolder", @entry if @?
      return false
  destroyed: ->
    @$root?.resize()
</script>
