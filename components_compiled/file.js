var __vue_template__ = "<li class=\"file list-item\" v-on=\"click: onClick, mouseenter: highlightTab, mouseleave: unhighlightTab\">\n    <span class=\"name icon\">\n      {{entry.name}}\n    </span>\n    <span class=\"icon icon-pin\" v-class=\"unpinned: !isPinned\" v-on=\"click: togglePin\">\n    </span>\n    <span class=\"icon icon-paintcan\" v-if=\"hasColorPicker\" v-on=\"click: colorPicker\">\n    </span>\n    <span class=\"icon icon-x\" v-on=\"click: close\">\n    </span>\n  </li>";
var timeouts;

timeouts = [];

module.exports = {
  replace: true,
  data: function() {
    return {
      isPinned: false,
      hasColorPicker: false,
      disposable: null
    };
  },
  methods: {
    highlightTab: function(e) {
      var i, j, len, len1, tab, tabs, timeout;
      tabs = document.querySelectorAll(".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='" + (this.entry.path.replace(/\\/g, "\\\\")) + "']");
      for (i = 0, len = timeouts.length; i < len; i++) {
        timeout = timeouts[i];
        clearTimeout(timeout);
      }
      timeouts = [];
      for (j = 0, len1 = tabs.length; j < len1; j++) {
        tab = tabs[j];
        tab.parentNode.classList.remove("of-unhighlighted");
        tab.parentNode.classList.add("of-highlighted");
      }
      this.$el.classList.remove("of-unhighlighted");
      this.$el.classList.add("of-highlighted");
      return e.stopPropagation();
    },
    unhighlightTab: function(e) {
      var i, len, remover, tab, tabs;
      tabs = document.querySelectorAll(".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='" + (this.entry.path.replace(/\\/g, "\\\\")) + "']");
      for (i = 0, len = tabs.length; i < len; i++) {
        tab = tabs[i];
        tab.parentNode.classList.remove("of-highlighted");
        tab.parentNode.classList.add("of-unhighlighted");
        remover = function(tab) {
          return timeouts.push(setTimeout((function() {
            return tab.parentNode.classList.remove("of-unhighlighted");
          }), 300));
        };
        remover(tab);
      }
      this.$el.classList.remove("of-highlighted");
      this.$el.classList.add("of-unhighlighted");
      timeouts.push(setTimeout(((function(_this) {
        return function() {
          return _this.$el.classList.remove("of-unhighlighted");
        };
      })(this)), 300));
      return e.stopPropagation();
    },
    close: function(e) {
      var i, len, pane, paneItem, paneItems, panePath, path, results;
      if (e != null) {
        e.stopPropagation();
      }
      paneItems = atom.workspace.getPaneItems();
      path = this.entry.path;
      results = [];
      for (i = 0, len = paneItems.length; i < len; i++) {
        paneItem = paneItems[i];
        if (paneItem.getPath) {
          panePath = paneItem.getPath();
          if (panePath === path) {
            this.$root.logFile("destroying " + panePath);
            pane = atom.workspace.paneForItem(paneItem);
            if (pane != null ? pane.promptToSaveItem(paneItem) : void 0) {
              if (typeof paneItem.destroy === "function") {
                paneItem.destroy();
              }
              results.push(true);
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    color: function() {
      var color, ref, ref1;
      color = (ref = this.$root) != null ? (ref1 = ref.colors) != null ? ref1[this.entry.path] : void 0 : void 0;
      if (color != null) {
        if (color) {
          return this.$el.setAttribute("style", "background-image: -webkit-linear-gradient(right, " + color + " 0%, rgba(0,0,0,0) 100%);");
        } else {
          return this.$el.removeAttribute("style");
        }
      }
    },
    colorPicker: function(e) {
      var ref, ref1;
      e.stopPropagation();
      if (!((this.$root.colorPicker != null) && (this.$root.changeColor != null))) {
        this.$root.$broadcast("noColorPicker");
        atom.notifications.addError("package missing: `color-tabs` or `color-picker-service`");
        return;
      }
      return this.$root.colorPicker({
        x: e.x,
        y: e.y,
        color: (ref = this.$root) != null ? (ref1 = ref.colors) != null ? ref1[this.entry.path] : void 0 : void 0
      }, (function(_this) {
        return function(newColor) {
          var base;
          return typeof (base = _this.$root).changeColor === "function" ? base.changeColor(_this.entry.path, newColor) : void 0;
        };
      })(this));
    },
    togglePin: function(e) {
      var i, len, opened, pane, panePath, panes;
      this.isPinned = !this.isPinned;
      this.entry.pinned = this.isPinned;
      this.$root.pinned(this.entry.path, this.entry.pinned);
      if (!this.isPinned) {
        opened = false;
        panes = atom.workspace.getPaneItems();
        for (i = 0, len = panes.length; i < len; i++) {
          pane = panes[i];
          if (pane.getPath) {
            panePath = pane.getPath();
            if (panePath === this.entry.path) {
              opened = true;
            }
          }
        }
        if (!opened) {
          this.$dispatch("removeFile", this.entry);
        }
      }
      return e != null ? e.stopPropagation() : void 0;
    },
    onClick: function(e) {
      this.$root.selected(this.entry.path);
      atom.workspace.open(this.entry.path, {
        searchAllPanes: true
      });
      return e.stopPropagation();
    }
  },
  beforeCompile: function() {
    return this.disposable = atom.workspace.onDidDestroyPaneItem((function(_this) {
      return function(arg) {
        var closedPath, i, index, item, len, pane, ref, remainingTextEditors, te;
        item = arg.item, pane = arg.pane, index = arg.index;
        if (item.getPath) {
          closedPath = item.getPath();
          if ((_this != null) && (_this.isPinned != null) && (((ref = _this.entry) != null ? ref.path : void 0) != null)) {
            if (closedPath === _this.entry.path && !_this.isPinned) {
              remainingTextEditors = atom.workspace.getTextEditors();
              for (i = 0, len = remainingTextEditors.length; i < len; i++) {
                te = remainingTextEditors[i];
                if (te.getPath() === closedPath) {
                  return null;
                }
              }
              return _this.$dispatch("removeFile", _this.entry);
            }
          }
        }
      };
    })(this));
  },
  beforeDestroy: function() {
    var ref;
    this.$root.logFile("beforeDestroy", 2);
    return (ref = this.disposable) != null ? ref.dispose() : void 0;
  },
  created: function() {
    this.$root.logFile("created", 2);
    this.isPinned = this.entry.pinned;
    this.$on("selected", (function(_this) {
      return function(path) {
        _this.isSelected = path === _this.entry.path;
        return true;
      };
    })(this));
    this.$on("close", (function(_this) {
      return function() {
        if (!_this.isPinned) {
          return _this.close();
        }
      };
    })(this));
    this.$on("pin", (function(_this) {
      return function(path) {
        if ((path != null) && path === _this.entry.path) {
          return _this.togglePin();
        }
      };
    })(this));
    this.$on("noColorPicker", (function(_this) {
      return function() {
        return _this.hasColorPicker = false;
      };
    })(this));
    this.hasColorPicker = this.$root.colorPicker != null;
    return this.$on("color", (function(_this) {
      return function(path) {
        var ref;
        if (path === _this.entry.path) {
          if ((ref = _this.$root) != null) {
            ref.logFile("got new color", 2);
          }
          return _this.color();
        }
      };
    })(this));
  },
  compiled: function() {
    var ref;
    if ((ref = this.$root) != null) {
      ref.logFile("compiled", 2);
    }
    return this.color();
  },
  destroyed: function() {
    var ref, ref1;
    if ((ref = this.$root) != null) {
      ref.logFile("destroyed", 2);
    }
    return (ref1 = this.$root) != null ? ref1.resize() : void 0;
  },
  attached: function() {
    this.$root.logFile("attached", 2);
    return this.$root.resize();
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;
