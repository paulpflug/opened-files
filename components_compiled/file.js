var __vue_template__ = "<li class=\"file list-item\" v-on=\"click: onClick, mouseenter: highlightTab, mouseleave: unhighlightTab\" v-class=\"selected: isSelected\">\n    <span class=\"name icon\">\n      {{entry.name}}\n    </span>\n    <span class=\"icon icon-pin\" v-class=\"unpinned: !isPinned\" v-on=\"click: togglePin\">\n    </span>\n    <span class=\"icon icon-paintcan\" v-on=\"click: paint\">\n    </span>\n    <span class=\"icon icon-x\" v-on=\"click: close\">\n    </span>\n  </li>";
var CompositeDisposable, log, timeouts;

log = null;

CompositeDisposable = null;

timeouts = [];

module.exports = {
  data: function() {
    return {
      isSelected: false,
      isPinned: false,
      disposables: null
    };
  },
  methods: {
    highlightTab: function(e) {
      var i, j, len, len1, tab, tabs, timeout;
      log("highlighting " + this.entry.name);
      tabs = document.querySelectorAll(".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='" + this.entry.path + "']");
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
      return e.stopPropagation();
    },
    unhighlightTab: function(e) {
      var i, len, remover, results, tab, tabs;
      log("unhighlighting " + this.entry.name);
      tabs = document.querySelectorAll(".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='" + this.entry.path + "']");
      results = [];
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
        results.push(e.stopPropagation());
      }
      return results;
    },
    close: function(e) {
      var i, len, pane, panePath, panes;
      panes = atom.workspace.getPaneItems();
      for (i = 0, len = panes.length; i < len; i++) {
        pane = panes[i];
        if (pane.getPath) {
          panePath = pane.getPath();
          if (panePath === this.entry.path) {
            log("destroying " + panePath);
            pane.destroy();
          }
        }
      }
      return e.stopPropagation();
    },
    paint: function(e) {
      this.$root["color-picker"].getNewColor(e.x, e.y, this.entry.color, (function(_this) {
        return function(newColor) {
          _this.entry.color = newColor;
          _this.paintTabs();
          return _this.$dispatch("notifyColor", _this.entry.path, _this.entry.color);
        };
      })(this));
      return e.stopPropagation();
    },
    togglePin: function(e) {
      var i, len, opened, pane, panePath, panes;
      this.isPinned = !this.isPinned;
      this.entry.pinned = this.isPinned;
      this.$dispatch("notifyPinned", this.entry.path, this.entry.pinned);
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
          this.$root.removeFile(this.entry.path);
        }
      }
      return e.stopPropagation();
    },
    onClick: function(e) {
      this.$dispatch("notifySelect", this.entry.name);
      atom.workspace.open(this.entry.path, {
        searchAllPanes: true
      });
      setTimeout(this.paintTabs, 50);
      return e.stopPropagation();
    },
    paintTabs: function() {
      var i, j, len, len1, tab, tabs;
      tabs = document.querySelectorAll(".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='" + this.entry.path + "']");
      if (this.entry.color) {
        for (i = 0, len = tabs.length; i < len; i++) {
          tab = tabs[i];
          tab.parentElement.setAttribute("style", "background-image: -webkit-linear-gradient(top, " + this.entry.color + " 0%, rgba(0,0,0,0) 100%);");
        }
        return this.$el.setAttribute("style", "background-image: -webkit-linear-gradient(right, " + this.entry.color + " 0%, rgba(0,0,0,0) 100%);");
      } else {
        for (j = 0, len1 = tabs.length; j < len1; j++) {
          tab = tabs[j];
          tab.parentElement.removeAttribute("style");
        }
        return this.$el.removeAttribute("style");
      }
    }
  },
  beforeCompile: function() {
    if (log == null) {
      log = require("./../lib/log")(atom.inDevMode(), "file-comp");
    }
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
    this.isPinned = this.entry.pinned;
    this.$on("selected", (function(_this) {
      return function(name) {
        _this.isSelected = name === _this.entry.name;
        return true;
      };
    })(this));
    return this.$on("getUnpinned", (function(_this) {
      return function() {
        if (!_this.isPinned) {
          log("unpinned " + _this.entry.path);
          return _this.$root.$emit("isUnpinned", _this.entry.path);
        }
      };
    })(this));
  },
  ready: function() {
    if (this.entry.color) {
      return this.paintTabs();
    }
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;
