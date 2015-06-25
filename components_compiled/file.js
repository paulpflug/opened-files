var __vue_template__ = "<li class=\"file list-item\" v-on=\"click: onClick, mouseenter: highlight, mouseleave: unhighlight\" v-class=\"\n    selected: isSelected,\n      of-highlight:isHovered &amp;&amp; shouldHighlight,\n      of-hovered: isHovered\n      \">\n    <span class=\"icon icon-x\" v-class=\"notHovered:!isHovered\" v-on=\"click: close\">\n    </span>\n    <span class=\"name\">\n      {{entry.name}}\n    </span>\n    <span class=\"path\" v-if=\"entry.pathIdentifier\">\n      {{entry.pathIdentifier}}\n    </span>\n    <span class=\"icon icon-paintcan\" v-if=\"isHovered &amp;&amp; hasColorPicker\" v-on=\"click: colorPicker\">\n    </span>\n  </li>";
module.exports = {
  replace: true,
  data: function() {
    return {
      isSelected: false,
      hasColorPicker: false,
      isHovered: false,
      shouldHighlight: atom.config.get("opened-files.highlightOnHover"),
      disposable: null
    };
  },
  methods: {
    highlight: function(e) {
      var i, len, tab, tabs;
      if (this.shouldHighlight) {
        tabs = document.querySelectorAll(".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='" + (this.entry.path.replace(/\\/g, "\\\\")) + "']");
        for (i = 0, len = tabs.length; i < len; i++) {
          tab = tabs[i];
          tab.parentNode.classList.add("of-highlight");
        }
      }
      return this.isHovered = true;
    },
    unhighlight: function(e) {
      var i, len, tab, tabs;
      e.stopPropagation();
      if (this.shouldHighlight) {
        tabs = document.querySelectorAll(".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='" + (this.entry.path.replace(/\\/g, "\\\\")) + "']");
        for (i = 0, len = tabs.length; i < len; i++) {
          tab = tabs[i];
          tab.parentNode.classList.remove("of-highlight");
        }
      }
      return this.isHovered = false;
    },
    close: function(e) {
      var i, len, pane, paneItem, paneItems, panePath, path;
      if (e != null) {
        e.stopPropagation();
      }
      paneItems = atom.workspace.getPaneItems();
      path = this.entry.path;
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
              true;
            }
          }
        }
      }
      this.$dispatch("removeFile", this.entry);
      return this.$root.removePath(this.entry.path);
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
    onClick: function(e) {
      this.$root.selected(this.entry.path);
      atom.workspace.open(this.entry.path, {
        searchAllPanes: true
      });
      return e.stopPropagation();
    }
  },
  beforeDestroy: function() {
    var ref;
    this.$root.logFile("beforeDestroy", 2);
    return (ref = this.disposable) != null ? ref.dispose() : void 0;
  },
  created: function() {
    this.$root.logFile("created", 2);
    this.$on("selected", (function(_this) {
      return function(path) {
        _this.isSelected = path === _this.entry.path;
        return true;
      };
    })(this));
    this.$on("close", (function(_this) {
      return function(path) {
        if (path != null) {
          if (path === _this.entry.path) {
            return _this.close();
          }
        } else {
          return _this.close();
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
