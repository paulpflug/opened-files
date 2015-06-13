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
      <template v-component="folder" v-repeat="entry: entry.folders" track-by="name">
      </template>
      <template v-component="file" v-repeat="entry: entry.files" track-by="name">
      </template>
    </ol>
  </li>
</template>

<script lang="coffee">
log = null
treeManager = null
module.exports =
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
      @$dispatch("notifySelect",@entry.name)
      @toggleFolder()
      e.stopPropagation()
    toggleFolder: ->
      @isCollapsed = !@isCollapsed
      treeManager.autoHeight()
    isEmpty: ->
      return @entry.files.length == 0 and @entry.folders.length == 0

  created: ->
    @$on "selected", (name) =>
      @isSelected = name == @entry.name
      return true
    @$on "removeFile", (entry) =>
      log "removing #{entry.path}"
      try
        @entry.files.$remove entry
      catch

      if @isEmpty()
        @$dispatch "removeFolder", @entry
      return false
    @$on "removeFolder", (entry) =>
      try
        @entry.folders.$remove entry
      catch
        
      if @isEmpty()
        @$dispatch "removeFolder", @entry
      return false
  destroyed: ->

    treeManager.autoHeight()
  beforeCompile: ->
    log ?= require("./../lib/log")("file-comp")
    treeManager ?= require("./../lib/tree-manager")
</script>
