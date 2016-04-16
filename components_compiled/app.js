var abbreviate, addFileToTree, addFolderToTree, getElementFromTree, projectManager, sep, settings, sortByName, wherePath;

wherePath = function(array, path) {
  var j, len, obj;
  for (j = 0, len = array.length; j < len; j++) {
    obj = array[j];
    if (obj.path === path) {
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

abbreviate = null;

getElementFromTree = function(tree, path, sort, createElement) {
  var element;
  element = wherePath(tree, path);
  if (createElement != null) {
    if (element == null) {
      element = createElement();
      tree.push(element);
      if (sort) {
        sortByName(tree);
      }
    }
  }
  return [element, tree];
};

addFileToTree = function(tree, path, name) {
  var element, mfpIdent, pathIdentifier, projectPaths, ref, result, sort, splittedPath;
  pathIdentifier = "";
  sort = true;
  if (name == null) {
    sort = false;
    result = atom.project.relativizePath(path);
    splittedPath = result[1].split(sep);
    name = splittedPath.pop();
    if (result[0] != null) {
      projectPaths = atom.project.getPaths();
      if (projectPaths.length > 1) {
        mfpIdent = atom.config.get("opened-files.mfpIdent");
        if (mfpIdent <= 0) {
          pathIdentifier += "" + (projectPaths.indexOf(result[0]) + 1);
        } else {
          pathIdentifier += abbreviate(result[0].split(sep).pop(), {
            length: mfpIdent,
            keepSeparators: true,
            strict: false
          });
        }
        if (splittedPath.length > 0) {
          pathIdentifier += sep;
        }
      }
    }
    pathIdentifier += splittedPath.join(sep);
  }
  ref = getElementFromTree(tree, path, sort, function() {
    return {
      name: name,
      path: path,
      pathIdentifier: pathIdentifier
    };
  }), element = ref[0], tree = ref[1];
  return tree;
};

addFolderToTree = function(tree, splittedPath, index, path) {
  var calculatedPath, element, ref;
  calculatedPath = splittedPath.slice(0, index + 1).join("/");
  ref = getElementFromTree(tree, calculatedPath, true, function() {
    return {
      name: splittedPath[index],
      folders: [],
      files: [],
      path: calculatedPath
    };
  }), element = ref[0], tree = ref[1];
  if (splittedPath.length === index + 2) {
    element.files = addFileToTree(element.files, path, splittedPath[index + 1]);
  } else {
    element.folders = addFolderToTree(element.folders, splittedPath, index + 1, path);
  }
  return tree;
};

module.exports = {
  el: function() {
    return document.createElement("div");
  },
  components: {
    folder: require("./folder")
  },
  data: function() {
    return {
      filesTree: [],
      colors: {},
      expanded: false,
      saving: false,
      savedSettings: [],
      isHovered: false,
      isHidden: false,
      disposables: null,
      logger: function() {},
      log: function() {}
    };
  },
  events: {
    removeFolder: function(entry) {
      if (!atom.config.get("opened-files.asList")) {
        this.filesTree.$remove(entry);
      }
      return false;
    }
  },
  methods: {
    hover: function(e) {
      return this.isHovered = true;
    },
    unhover: function(e) {
      return this.isHovered = false;
    },
    addFile: function(path) {
      var result, rootElement, rootName, splittedPath;
      this.log("adding " + path, 2);
      if (atom.config.get("opened-files.asList")) {
        rootElement = this.filesTree[0];
        if (rootElement == null) {
          rootElement = {
            name: "Opened files",
            path: "",
            folders: [],
            files: [],
            isRoot: true
          };
          this.filesTree.push(rootElement);
        }
        return rootElement.files = addFileToTree(rootElement.files, path);
      } else {
        result = atom.project.relativizePath(path);
        if ((result != null ? result[0] : void 0) != null) {
          rootName = result[0].split(sep).pop();
          rootElement = wherePath(this.filesTree, result[0]);
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
          splittedPath = result[1].split(sep);
          if (splittedPath.length === 1) {
            return rootElement.files = addFileToTree(rootElement.files, path, splittedPath[0]);
          } else {
            return rootElement.folders = addFolderToTree(rootElement.folders, splittedPath, 0, path);
          }
        }
      }
    },
    selected: function(path) {
      return this.$broadcast("selected", path);
    },
    colorChangeCb: function(path, color) {
      if ((typeof this !== "undefined" && this !== null) && (this.colors != null)) {
        this.log("colorChangeCb called", 2);
        this.colors[path] = color;
        return this.$broadcast("color", path);
      }
    },
    redraw: function() {
      var j, len, path, results;
      this.log("redraw");
      this.filesTree = [];
      results = [];
      for (j = 0, len = settings.length; j < len; j++) {
        path = settings[j];
        results.push(this.addFile(path));
      }
      return results;
    },
    removePath: function(path) {
      var i;
      i = settings.indexOf(path);
      if (i > -1) {
        return settings.splice(i, 1);
      }
    },
    save: function() {
      if (this.saving === false) {
        this.saving = true;
        this.log("saving", 2);
        projectManager.addToProjectSetting(settings);
        this.savedSettings = settings.slice();
        return this.saving = false;
      } else {
        this.log("delaying save", 2);
        setTimeout(((function(_this) {
          return function() {
            return _this.saving = false;
          };
        })(this)), 90);
        return setTimeout(this.save, 100);
      }
    },
    closeUnsaved: function() {
      var j, len, path, results;
      results = [];
      for (j = 0, len = settings.length; j < len; j++) {
        path = settings[j];
        if (this.savedSettings.indexOf(path) === -1) {
          results.push(this.$broadcast("close", path));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  },
  beforeCompile: function() {
    this.log = this.logger("app");
    sep = require("path").sep;
    if (projectManager == null) {
      projectManager = require("./../lib/project-manager");
    }
    if (abbreviate == null) {
      abbreviate = require("abbreviate");
    }
    if (atom.config.get("opened-files.removeOnClose")) {
      settings = [];
    } else {
      settings = projectManager.getProjectSetting();
      if (!Array.isArray(settings)) {
        settings = [];
      }
      this.savedSettings = settings.slice();
    }
    return this.log("beforeCompile", 2);
  },
  compiled: function() {
    var CompositeDisposable, closeListener, j, len, path, setupCloseListener;
    CompositeDisposable = require('atom').CompositeDisposable;
    this.disposables = new CompositeDisposable;
    for (j = 0, len = settings.length; j < len; j++) {
      path = settings[j];
      this.addFile(path);
    }
    this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
      return function(editor) {
        var destroyed, disposable, disposable2, pane;
        if ((editor != null ? editor.getPath : void 0) != null) {
          path = editor.getPath();
          if (path != null) {
            pane = atom.workspace.paneForItem(editor);
            if (pane != null) {
              if (pane.getPendingItem() !== editor) {
                if (settings.indexOf(path) === -1) {
                  _this.addFile(path);
                  return settings.push(path);
                }
              } else {
                destroyed = false;
                disposable = pane.onItemDidTerminatePendingState(function(paneItem) {
                  if (paneItem === editor) {
                    return setTimeout((function() {
                      if (!destroyed) {
                        if (settings.indexOf(path) === -1) {
                          _this.addFile(path);
                          settings.push(path);
                        }
                        return disposable.dispose();
                      }
                    }), 100);
                  }
                });
                return disposable2 = editor.onDidDestroy(function() {
                  destroyed = true;
                  disposable.dispose();
                  return disposable2.dispose();
                });
              }
            }
          }
        }
      };
    })(this)));
    setupCloseListener = (function(_this) {
      return function() {
        var disposable;
        disposable = atom.workspace.onDidDestroyPaneItem(function() {
          var editor, file, k, l, len1, len2, len3, m, openedFiles, pane, ref, remove;
          openedFiles = [];
          ref = atom.workspace.getTextEditors();
          for (k = 0, len1 = ref.length; k < len1; k++) {
            editor = ref[k];
            if ((editor != null ? editor.getPath : void 0) != null) {
              path = editor.getPath();
              if (path != null) {
                pane = atom.workspace.paneForItem(editor);
                if (pane != null) {
                  if (pane.getPendingItem() !== editor) {
                    if (openedFiles.indexOf(path) === -1) {
                      openedFiles.push(path);
                    }
                  }
                }
              }
            }
          }
          remove = [];
          for (l = 0, len2 = settings.length; l < len2; l++) {
            file = settings[l];
            if (openedFiles.indexOf(file) === -1) {
              remove.push(file);
            }
          }
          if (remove.length > 0) {
            for (m = 0, len3 = remove.length; m < len3; m++) {
              file = remove[m];
              settings.splice(settings.indexOf(file), 1);
            }
            return _this.redraw();
          }
        });
        _this.disposables.add(disposable);
        return disposable;
      };
    })(this);
    if (atom.config.get("opened-files.removeOnClose")) {
      closeListener = setupCloseListener();
    }
    this.disposables.add(atom.commands.add('atom-workspace', {
      'opened-files:close-all-but-saved': this.closeUnsaved
    }));
    this.disposables.add(atom.config.onDidChange('opened-files.asList', this.redraw));
    this.disposables.add(atom.config.onDidChange('opened-files.debug', this.redraw));
    this.disposables.add(atom.config.onDidChange('opened-files.mfpIdent', this.redraw));
    this.disposables.add(atom.config.onDidChange('opened-files.removeOnClose', (function(_this) {
      return function(arg) {
        var editor, k, len1, newValue, pane, ref;
        newValue = arg.newValue;
        if (newValue) {
          settings = [];
          ref = atom.workspace.getTextEditors();
          for (k = 0, len1 = ref.length; k < len1; k++) {
            editor = ref[k];
            if ((editor != null ? editor.getPath : void 0) != null) {
              path = editor.getPath();
              if (path != null) {
                pane = atom.workspace.paneForItem(editor);
                if (pane != null) {
                  if (pane.getPendingItem() !== editor) {
                    if (settings.indexOf(path) === -1) {
                      _this.addFile(path);
                      settings.push(path);
                    }
                  }
                }
              }
            }
          }
          _this.redraw();
          return closeListener = setupCloseListener();
        } else {
          return closeListener.dispose();
        }
      };
    })(this)));
    this.disposables.add(atom.commands.add('atom-workspace', {
      'opened-files:toggle': (function(_this) {
        return function() {
          return _this.isHidden = !_this.isHidden;
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
  },
  beforeDestroy: function() {
    var ref;
    this.log("destroying", 2);
    return (ref = this.disposables) != null ? ref.dispose() : void 0;
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div class=\"file-list opened-files\" :class={hidden:isHidden}><ol class=\"full-menu list-tree has-collapsable-children\" tabindex=-1 @mouseenter=hover @mouseleave=unhover><div :class=\"{hidden: !isHovered}\" class=\"save icon icon-bookmark\" @click=save></div><folder :entry=entry v-for=\"entry in filesTree\" track-by=path></folder></ol></div>"
