var treeManager;

treeManager = null;

module.exports = {
  name: "folder",
  components: {
    "file": require("./file")
  },
  replace: true,
  props: {
    entry: {
      type: Object
    }
  },
  data: function() {
    return {
      disposable: null,
      isSelected: false,
      isCollapsed: false,
      isHovered: false,
      shouldHighlight: atom.config.get("opened-files.highlightOnHover"),
      isHighlight: false,
      color: false,
      log: function() {}
    };
  },
  methods: {
    hover: function(e) {
      return this.isHovered = true;
    },
    unhover: function(e) {
      e.stopPropagation();
      return this.isHovered = false;
    },
    highlight: function(e) {
      return this.isHighlight = true;
    },
    unhighlight: function(e) {
      e.stopPropagation();
      return this.isHighlight = false;
    },
    close: function(e) {
      this.log("closing", 2);
      e.stopPropagation();
      return this.$broadcast("close");
    },
    onClick: function(e) {
      this.log("selecting", 2);
      this.$root.selected(this.entry.path);
      this.toggleFolder();
      return e.stopPropagation();
    },
    toggleFolder: function() {
      this.isCollapsed = !this.isCollapsed;
      return setTimeout(this.$root.resize, 1);
    },
    isEmpty: function() {
      if (typeof this === "undefined" || this === null) {
        return true;
      }
      return this.entry.files.length === 0 && this.entry.folders.length === 0;
    }
  },
  compiled: function() {
    var CompositeDisposable;
    this.log = this.$root.logger("file");
    this.log("compiled", 2);
    CompositeDisposable = require('atom').CompositeDisposable;
    this.disposables = new CompositeDisposable;
    return this.disposables.add(atom.config.onDidChange('opened-files.highlightOnHover', (function(_this) {
      return function() {
        return _this.shouldHighlight = atom.config.get("opened-files.highlightOnHover");
      };
    })(this)));
  },
  created: function() {
    this.log("created", 2);
    this.$on("selected", (function(_this) {
      return function(path) {
        _this.isSelected = path === _this.entry.path;
        return true;
      };
    })(this));
    this.$on("removeFile", (function(_this) {
      return function(entry) {
        _this.log("removing " + entry.path);
        try {
          _this.entry.files.$remove(entry);
        } catch (undefined) {}
        if (_this.isEmpty()) {
          if (_this != null) {
            _this.$dispatch("removeFolder", _this.entry);
          }
        }
        return false;
      };
    })(this));
    return this.$on("removeFolder", (function(_this) {
      return function(entry) {
        if (entry !== _this.entry) {
          try {
            _this.entry.folders.$remove(entry);
          } catch (undefined) {}
          if (_this.isEmpty()) {
            if (_this != null) {
              _this.$dispatch("removeFolder", _this.entry);
            }
          }
        }
        return false;
      };
    })(this));
  },
  beforeDestroy: function() {
    var ref;
    this.log("beforeDestroy", 2);
    return (ref = this.disposable) != null ? ref.dispose() : void 0;
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<li class=\"directory list-nested-item\" @mouseenter=hover @mouseleave=unhover @mouseover=highlight @mouseout=unhighlight :class=\"{\n    selected: isSelected,\n    collapsed: isCollapsed,\n    expanded: !isCollapsed,\n    'of-highlight':isHighlight &amp;&amp; shouldHighlight\n  }\"><div class=\"header list-item folder\" @click=onClick><span class=name data-name={{entry.name}} data-path={{entry.path}}>{{entry.name}}</span> <span :class=\"{hidden: !isHovered}\" class=\"icon icon-x\" @click=close></span></div><ol class=\"entries list-tree\" @mouseover=unhighlight><folder :entry=entry v-for=\"entry in entry.folders\" track-by=path></folder><file :entry=entry v-for=\"entry in entry.files\" track-by=path></file></ol></li>"
