var __vue_template__ = "<div>\n  <ol class=\"tree-view full-menu list-tree has-collapsable-children focusable-panel\">\n    <template is=\"tree-view-directory\" v-component=\"tree-entry\" v-repeat=\"entry: filesTree\" track-by=\"name\" class=\"directory entry list-nested-item project-root\">\n    </template>\n  </ol>\n</div>";
var Lazy, recursiveAdd, recursiveRemove;

Lazy = require("lazy.js");

recursiveAdd = function(tree, names, path) {
  var element;
  if (names.length > 0) {
    element = Lazy(tree).where({
      name: names[0]
    }).first();
    if (!element) {
      element = {
        name: names[0],
        children: []
      };
      tree.push(element);
      tree = Lazy(tree).sortBy("name").toArray();
    }
    if (names.length > 1) {
      element.children = recursiveAdd(element.children, names.splice(1, 1), path);
    } else {
      element.path = path;
      element.pinned = false;
      element.color = false;
    }
  }
  return tree;
};

recursiveRemove = function(tree, names) {
  var element;
  if (names.length > 0) {
    element = Lazy(tree).where({
      name: names[0]
    }).first();
    if (element != null) {
      if (names.length > 1 && element.children.length > 0) {
        element.children = recursiveRemove(element.children, names.splice(1, 1));
      }
      if (element.children.length === 0) {
        tree.$remove(element);
      }
    }
  }
  return tree;
};

module.exports = {
  data: function() {
    return {
      filesTree: []
    };
  },
  methods: {
    addFile: function(path) {
      var result, rootElement, rootName;
      result = atom.project.relativizePath(path);
      if ((result != null ? result[0] : void 0) != null) {
        rootName = result[0].split("/").pop();
        rootElement = Lazy(this.filesTree).where({
          name: rootName
        }).first();
        if (rootElement == null) {
          rootElement = {
            name: rootName,
            path: result[0],
            children: []
          };
          this.filesTree.push(rootElement);
          this.filesTree = Lazy(this.filesTree).sortBy("name").toArray();
        }
        return rootElement.children = recursiveAdd(rootElement.children, result[1].split("/"), path);
      }
    },
    removeFile: function(path) {
      var result, rootElement, rootName;
      result = atom.project.relativizePath(path);
      if ((result != null ? result[0] : void 0) != null) {
        rootName = result[0].split("/").pop();
        rootElement = Lazy(this.filesTree).where({
          name: rootName
        }).first();
        if (rootElement != null) {
          rootElement.children = recursiveRemove(rootElement.children, result[1].split("/"));
        }
        if ((rootElement != null) && rootElement.children.length === (0 != null)) {
          return this.filesTree.$remove(rootElement);
        }
      }
    },
    getUnpinned: function() {
      var child, getUnpinned, i, j, len, len1, ref, ref1, results, rootElement;
      results = [];
      getUnpinned = function(entry) {
        var child, i, len, ref, results1;
        if (entry.children.length === 0) {
          if (!entry.pinned) {
            return results.push(entry.path);
          }
        } else {
          ref = entry.children;
          results1 = [];
          for (i = 0, len = ref.length; i < len; i++) {
            child = ref[i];
            results1.push(getUnpinned(child));
          }
          return results1;
        }
      };
      ref = this.filesTree;
      for (i = 0, len = ref.length; i < len; i++) {
        rootElement = ref[i];
        ref1 = rootElement.children;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          child = ref1[j];
          getUnpinned(child);
        }
      }
      return results;
    }
  },
  created: function() {
    return this.$on("notifySelect", (function(_this) {
      return function(name) {
        return _this.$broadcast("selected", name);
      };
    })(this));
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;
