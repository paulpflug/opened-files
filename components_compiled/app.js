var __vue_template__ = "<ol class=\"full-menu list-tree has-collapsable-children\" tabindex=\"-1\">\n      <template v-component=\"folder\" v-repeat=\"entry: filesTree\" track-by=\"name\" class=\"directory list-nested-item project-root\">\n      </template>\n    </ol>";
var CompositeDisposable, Lazy, addFileToTree, addFolderToTree, getElementFromTree, log, projectManager, removeFileFromTree, removeFolderFromTree, sep, settings;

Lazy = null;

log = null;

sep = null;

CompositeDisposable = null;

projectManager = null;

settings = null;

getElementFromTree = function(tree, name, createElement) {
  var element;
  element = Lazy(tree).where({
    name: name
  }).first();
  if (createElement != null) {
    if (element == null) {
      element = createElement();
      tree.push(element);
      tree = Lazy(tree).sortBy("name").toArray();
    }
  }
  return [element, tree];
};

addFileToTree = function(tree, name, path) {
  var element, ref;
  ref = getElementFromTree(tree, name, function() {
    var color, pinned, ref, ref1, ref2, ref3;
    pinned = (ref = (ref1 = settings[path]) != null ? ref1.pinned : void 0) != null ? ref : false;
    color = (ref2 = (ref3 = settings[path]) != null ? ref3.color : void 0) != null ? ref2 : false;
    return {
      name: name,
      path: path,
      pinned: pinned,
      color: color
    };
  }), element = ref[0], tree = ref[1];
  return tree;
};

addFolderToTree = function(tree, splittedPath, path) {
  var element, ref;
  ref = getElementFromTree(tree, splittedPath[0], function() {
    return {
      name: splittedPath[0],
      folders: [],
      files: []
    };
  }), element = ref[0], tree = ref[1];
  if (splittedPath.length === 2) {
    element.files = addFileToTree(element.files, splittedPath[1], path);
  } else {
    element.folders = addFolderToTree(element.folders, splittedPath.slice(1), path);
  }
  return tree;
};

removeFileFromTree = function(tree, name) {
  var element, ref;
  ref = getElementFromTree(tree, name), element = ref[0], tree = ref[1];
  if ((element != null) && !element.pinned) {
    tree.$remove(element);
  }
  return tree;
};

removeFolderFromTree = function(tree, splittedPath) {
  var element, ref;
  ref = getElementFromTree(tree, splittedPath[0]), element = ref[0], tree = ref[1];
  if (splittedPath.length === 2) {
    element.files = removeFileFromTree(element.files, splittedPath[1]);
  } else {
    element.folders = removeFolderFromTree(element.folders, splittedPath.slice(1));
  }
  if (element.folders.length === 0 && element.files.length === 0) {
    tree.$remove(element);
  }
  return tree;
};

module.exports = {
  data: function() {
    return {
      filesTree: [],
      disposables: null,
      expanded: false
    };
  },
  methods: {
    addFile: function(path) {
      var result, rootElement, rootName, splittedPath;
      result = atom.project.relativizePath(path);
      if ((result != null ? result[0] : void 0) != null) {
        rootName = result[0].split(sep).pop();
        rootElement = Lazy(this.filesTree).where({
          name: rootName
        }).first();
        if (rootElement == null) {
          rootElement = {
            name: rootName,
            path: result[0],
            folders: [],
            files: []
          };
          this.filesTree.push(rootElement);
          this.filesTree = Lazy(this.filesTree).sortBy("name").toArray();
        }
        splittedPath = result[1].split(sep);
        if (splittedPath.length === 1) {
          return rootElement.files = addFileToTree(rootElement.files, splittedPath[0], path);
        } else {
          return rootElement.folders = addFolderToTree(rootElement.folders, splittedPath, path);
        }
      }
    },
    removeFile: function(path) {
      var result, rootElement, rootName, splittedPath;
      result = atom.project.relativizePath(path);
      if ((result != null ? result[0] : void 0) != null) {
        rootName = result[0].split(sep).pop();
        rootElement = Lazy(this.filesTree).where({
          name: rootName
        }).first();
        if (rootElement != null) {
          splittedPath = result[1].split(sep);
          if (splittedPath.length === 1) {
            rootElement.files = removeFileFromTree(rootElement.files, splittedPath[0]);
          } else {
            rootElement.folders = removeFolderFromTree(rootElement.folders, splittedPath);
          }
          if (rootElement.folders.length === 0 && rootElement.files.length === 0) {
            return this.filesTree.$remove(rootElement);
          }
        }
      }
    },
    closeUnpinned: function() {
      return this.$broadcast("close");
    }
  },
  beforeCompile: function() {
    sep = require("path").sep;
    if (Lazy == null) {
      Lazy = require("lazy.js");
    }
    if (log == null) {
      log = require("./../lib/log")(atom.inDevMode(), "app-comp");
    }
    if (projectManager == null) {
      projectManager = require("./../lib/project-manager");
    }
    settings = projectManager.getProjectSetting();
    if (CompositeDisposable == null) {
      CompositeDisposable = require('atom').CompositeDisposable;
    }
    return this.disposables = new CompositeDisposable;
  },
  beforeDestroy: function() {
    var ref;
    return (ref = this.disposables) != null ? ref.dispose() : void 0;
  },
  created: function() {
    this.$on("notifySelect", (function(_this) {
      return function(path) {
        log("event - selected " + path);
        return _this.$broadcast("selected", path);
      };
    })(this));
    this.$on("notifyColor", function(path, color) {
      var newSetting, ref;
      log("event - color " + path);
      newSetting = (ref = settings[path]) != null ? ref : {};
      newSetting.color = color;
      settings[path] = newSetting;
      return projectManager.addToProjectSetting(settings, false);
    });
    return this.$on("notifyPinned", function(path, pinned) {
      var newSetting, ref;
      log("event - (un)pinned " + path);
      newSetting = (ref = settings[path]) != null ? ref : {};
      newSetting.pinned = pinned;
      settings[path] = newSetting;
      return projectManager.addToProjectSetting(settings, false);
    });
  },
  compiled: function() {
    var obj, path, results;
    results = [];
    for (path in settings) {
      obj = settings[path];
      if (obj.pinned) {
        results.push(this.addFile(path));
      } else {
        results.push(void 0);
      }
    }
    return results;
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;
