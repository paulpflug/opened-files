
<template>
  <div>
  <ol class="tree-view full-menu list-tree has-collapsable-children focusable-panel">
    <template
      is="tree-view-directory"
      v-component="tree-entry"
      v-repeat="entry: filesTree"
      track-by="name"
      class="directory entry list-nested-item project-root"
      >
    </template>
  </ol>
</div>
</template>

<script lang="coffee">
Lazy = require "lazy.js"
recursiveAdd = (tree, names, path) ->
  if names.length > 0
    element = Lazy(tree).where(name: names[0]).first()
    unless element
      element = {name: names[0], children: []}
      tree.push element
      tree = Lazy(tree).sortBy("name").toArray()
    if names.length > 1
      element.children = recursiveAdd element.children, names.splice(1, 1), path
    else
      element.path = path
      element.pinned = false
      element.color = false
  return tree
recursiveRemove = (tree,names) ->
  if names.length > 0
    element = Lazy(tree).where(name: names[0]).first()
    if element?
      if names.length > 1 and element.children.length > 0
        element.children = recursiveRemove element.children, names.splice(1, 1)
      if element.children.length == 0
        tree.$remove element
  return tree
module.exports =
  data: ->
    filesTree: []
  methods:
    addFile: (path) ->
      result = atom.project.relativizePath path
      if result?[0]?
        rootName = result[0].split("/").pop()
        rootElement = Lazy(@filesTree).where(name: rootName).first()
        unless rootElement?
          rootElement = {name: rootName, path: result[0], children: []}
          @filesTree.push rootElement
          @filesTree = Lazy(@filesTree).sortBy("name").toArray()
        rootElement.children = recursiveAdd rootElement.children, result[1].split("/"), path
    removeFile: (path) ->
      result = atom.project.relativizePath path
      if result?[0]?
        rootName = result[0].split("/").pop()
        rootElement = Lazy(@filesTree).where(name: rootName).first()
        if rootElement?
          rootElement.children = recursiveRemove rootElement.children, result[1].split("/")
        if rootElement? and rootElement.children.length == 0?
          @filesTree.$remove rootElement
    getUnpinned: ->
      results = []
      getUnpinned = (entry) ->
        if entry.children.length == 0
          unless entry.pinned
            results.push entry.path
        else
          for child in entry.children
            getUnpinned(child)
      for rootElement in @filesTree
        for child in rootElement.children
          getUnpinned(child)
      return results
  created: ->
    @$on "notifySelect", (name) =>
      @$broadcast "selected", name

</script>
