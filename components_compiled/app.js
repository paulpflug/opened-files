var __vue_template__ = "<ol class=\"full-menu list-tree has-collapsable-children\" tabindex=\"-1\">\n      <folder v-repeat=\"entry: filesTree\" track-by=\"name\">\n      </folder>\n    </ol>";
var addFileToTree, addFolderToTree, getElementFromTree, projectManager, sep, settings, sortByName, treeManager, whereName;

whereName = function(array, name) {
  var i, len, obj;
  for (i = 0, len = array.length; i < len; i++) {
    obj = array[i];
    if (obj.name === name) {
      return obj;
    }
  }
  return null;
};

sortByName = function(array) {
  return array.sort(function(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
};

sep = null;

projectManager = null;

settings = null;

treeManager = null;

getElementFromTree = function(tree, name, createElement) {
  var element;
  element = whereName(tree, name);
  if (createElement != null) {
    if (element == null) {
      element = createElement();
      tree.push(element);
      sortByName(tree);
    }
  }
  return [element, tree];
};

addFileToTree = function(tree, name, path) {
  var element, ref;
  ref = getElementFromTree(tree, name, function() {
    var ref, ref1, ref2, ref3;
    return {
      name: name,
      pinned: (ref = (ref1 = settings[path]) != null ? ref1.pinned : void 0) != null ? ref : false,
      color: (ref2 = (ref3 = settings[path]) != null ? ref3.color : void 0) != null ? ref2 : false,
      path: path
    };
  }), element = ref[0], tree = ref[1];
  return tree;
};

addFolderToTree = function(tree, splittedPath, index, path) {
  var element, ref;
  ref = getElementFromTree(tree, splittedPath[index], function() {
    return {
      name: splittedPath[index],
      folders: [],
      files: [],
      path: splittedPath.slice(0, index + 1).join("/")
    };
  }), element = ref[0], tree = ref[1];
  if (splittedPath.length === index + 2) {
    element.files = addFileToTree(element.files, splittedPath[index + 1], path);
  } else {
    element.folders = addFolderToTree(element.folders, splittedPath, index + 1, path);
  }
  return tree;
};

module.exports = {
  data: function() {
    return {
      filesTree: [],
      colors: {},
      expanded: false
    };
  },
  methods: {
    addFile: function(path) {
      var result, rootElement, rootName, splittedPath;
      result = atom.project.relativizePath(path);
      if ((result != null ? result[0] : void 0) != null) {
        rootName = result[0].split(sep).pop();
        rootElement = whereName(this.filesTree, rootName);
        if (rootElement == null) {
          rootElement = {
            name: rootName,
            path: result[0],
            folders: [],
            files: []
          };
          this.filesTree.push(rootElement);
          sortByName(this.filesTree);
        }
        if (atom.config.get("opened-files.asList")) {
          return rootElement.files = addFileToTree(rootElement.files, result[1], path);
        } else {
          splittedPath = result[1].split(sep);
          if (splittedPath.length === 1) {
            return rootElement.files = addFileToTree(rootElement.files, splittedPath[0], path);
          } else {
            return rootElement.folders = addFolderToTree(rootElement.folders, splittedPath, 0, path);
          }
        }
      }
    },
    closeUnpinned: function() {
      return this.$broadcast("close");
    },
    pin: function(path) {
      return this.$broadcast("pin", path);
    },
    pinned: function(path, pinned) {
      var newSetting, ref;
      newSetting = (ref = settings[path]) != null ? ref : {};
      newSetting.pinned = pinned;
      settings[path] = newSetting;
      return projectManager.addToProjectSetting(settings, false);
    },
    selected: function(path) {
      return this.$broadcast("selected", path);
    },
    resize: function() {
      return treeManager.autoHeight();
    },
    colorChangeCb: function(path, color) {
      this.log("colorChangeCb called", 2);
      this.colors[path] = color;
      return this.$broadcast("color", path);
    }
  },
  beforeCompile: function() {
    sep = require("path").sep;
    if (projectManager == null) {
      projectManager = require("./../lib/project-manager");
    }
    if (treeManager == null) {
      treeManager = require("./../lib/tree-manager");
    }
    settings = projectManager.getProjectSetting();
    return this.log("beforeCompile", 2);
  },
  created: function() {
    return this.$on("removeFolder", (function(_this) {
      return function(entry) {
        _this.filesTree.$remove(entry);
        return false;
      };
    })(this));
  },
  compiled: function() {
    var obj, path;
    for (path in settings) {
      obj = settings[path];
      if (obj.pinned) {
        this.addFile(path);
      }
    }
    this.addDisposable(atom.workspace.observeTextEditors((function(_this) {
      return function(editor) {
        if ((editor != null ? editor.getPath : void 0) != null) {
          path = editor.getPath();
          if (path != null) {
            _this.log("adding " + path, 2);
            return _this.addFile(path);
          }
        }
      };
    })(this)));
    this.addDisposable(atom.commands.add('atom-workspace', {
      'opened-files:close-all-but-pinned': this.closeUnpinned,
      'opened-files:pin-current-tab': (function(_this) {
        return function() {
          var te;
          te = atom.workspace.getActiveTextEditor();
          if ((te != null ? te.getPath : void 0) != null) {
            return _this.pin(te.getPath());
          }
        };
      })(this)
    }));
    return this.log("compiled", 2);
  },
  ready: function() {
    return this.log("ready", 2);
  },
  attached: function() {
    return this.log("attached", 2);
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;
