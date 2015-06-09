<template>
  <li
    v-show="entry.children.length < 1"
    class="file entry list-item"
    v-on="click: onClick"
    v-class="selected: isSelected"
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
  </li>
  <li
    v-if="entry.children.length > 0"
    class="directory entry list-nested-item"
    v-on="click: onClick"
    v-class="
      selected: isSelected,
      collapsed: isCollapsed,
      expanded: !isCollapsed
    ">
    <div class="header list-item">
      <span class="name icon icon-file-directory" data-name={{entry.name}} data-path={{entry.path}}>{{entry.name}}</span>
    </div>
    <ol v-if="entry.children" class="entries list-tree">
      <template v-component="tree-entry" v-repeat="entry: entry.children" track-by="name">
      </template>
    </ol>
  </li>
</template>

<script lang="coffee">
  module.exports =
    data: -> {
        isSelected: false
        isCollapsed: false
        isPinned: false
        color: false
      }
    methods:
      paint: (e) ->
        tabs = document.querySelectorAll ".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='#{@entry.path}']"
        if @color
          for tab in tabs
            tab.parentElement.removeAttribute "style"
          e.target.parentElement.removeAttribute "style"
        else
          for tab in tabs
            tab.parentElement.setAttribute "style",
              """
              background-image: -webkit-linear-gradient(top, rgba(161,23,68,1) 0%, rgba(0,0,0,0) 100%);
              """
          e.target.parentElement.setAttribute "style",
            "background-image: -webkit-linear-gradient(right, rgba(161,23,68,1) 0%, rgba(0,0,0,0) 100%);"
        console.log
        @color = !@color
      togglePin: ->
        @isPinned = !@isPinned
        @entry.pinned = @isPinned
      onClick: (e) ->
        @$dispatch("notifySelect",@entry.name)
        @toggleFolder()
        atom.workspace.open(@entry.path) if @entry.path and @entry.children.length == 0
        e.stopPropagation()
      toggleFolder: ->
        @isCollapsed = !@isCollapsed

    created: ->
      @$on "selected", (name) =>
        @isSelected = name == @entry.name
        return true
</script>
