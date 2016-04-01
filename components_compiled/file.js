module.exports = {
  props: {
    entry: {
      type: Object
    }
  },
  replace: true,
  data: function() {
    return {
      isSelected: false,
      hasColorPicker: false,
      isHovered: false,
      shouldHighlight: atom.config.get("opened-files.highlightOnHover"),
      colorStyle: atom.config.get("opened-files.colorStyle"),
      disposable: null,
      style: {
        "background-image": null,
        "border-right": null,
        "background": null,
        "color": null
      },
      log: function() {}
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
            this.log("destroying " + panePath);
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
      var color, ref, ref1, style;
      color = (ref = this.$root) != null ? (ref1 = ref.colors) != null ? ref1[this.entry.path] : void 0 : void 0;
      style = {
        "background-image": null,
        "border-right": null,
        "background": null,
        "color": null
      };
      if (color != null) {
        this.log("coloring " + this.entry.path, 2);
        if (color) {
          switch (this.colorStyle) {
            case "gradient":
              style["background-image"] = "-webkit-linear-gradient(right, " + color + " 0%, rgba(0,0,0,0) 100%)";
              break;
            case "border":
              style["border-right"] = "solid 6px " + color;
              break;
            case "solid":
              style["background"] = "" + color;
              if (parseInt(color.replace('#', ''), 16) > 0xffffff / 2) {
                style.color = "black";
              } else {
                style.color = "white";
              }
          }
        }
        return this.style = style;
      }
    },
    colorPicker: function(e) {
      var ref, ref1;
      e.preventDefault();
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
    this.log("beforeDestroy", 2);
    return (ref = this.disposable) != null ? ref.dispose() : void 0;
  },
  created: function() {
    this.log("created", 2);
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
        if (path === _this.entry.path) {
          _this.log("got new color", 2);
          return _this.color();
        }
      };
    })(this));
  },
  compiled: function() {
    var CompositeDisposable;
    this.log = this.$root.logger("file");
    this.log("compiled", 2);
    CompositeDisposable = require('atom').CompositeDisposable;
    this.disposables = new CompositeDisposable;
    this.disposables.add(atom.config.onDidChange('opened-files.colorStyle', (function(_this) {
      return function() {
        _this.colorStyle = atom.config.get("opened-files.colorStyle");
        return _this.color();
      };
    })(this)));
    this.disposables.add(atom.config.onDidChange('opened-files.highlightOnHover', (function(_this) {
      return function() {
        return _this.shouldHighlight = atom.config.get("opened-files.highlightOnHover");
      };
    })(this)));
    return this.color();
  },
  destroyed: function() {
    return this.log("destroyed", 2);
  },
  attached: function() {
    return this.log("attached", 2);
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<li class=\"file list-item\" @click=onClick @mouseenter=highlight @mouseleave=unhighlight :style=style :class=\"{\n   selected: isSelected,\n   'of-highlight':isHovered &amp;&amp; shouldHighlight,\n   'of-hovered': isHovered}\n    \"><span class=\"icon icon-x\" :class=\"{'not-hovered':!isHovered}\" @click=close></span> <span class=name>{{entry.name}}</span> <span class=path v-if=entry.pathIdentifier>{{entry.pathIdentifier}}</span> <span class=\"icon icon-paintcan\" v-if=\"isHovered &amp;&amp; hasColorPicker\" @click=colorPicker></span></li>"
