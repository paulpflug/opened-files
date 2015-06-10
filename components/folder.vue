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
  module.exports =
    data: -> {
        isSelected: false
        isCollapsed: false
        color: false
      }
    methods:
      paint: (e) ->

      onClick: (e) ->
        @$dispatch("notifySelect",@entry.name)
        @toggleFolder()
        e.stopPropagation()
      toggleFolder: ->
        @isCollapsed = !@isCollapsed

    created: ->
      @$on "selected", (name) =>
        @isSelected = name == @entry.name
        return true
</script>
