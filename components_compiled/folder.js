var __vue_template__ = "<li class=\"directory list-nested-item\" v-on=\"click: onClick\" v-class=\"\n      selected: isSelected,\n      collapsed: isCollapsed,\n      expanded: !isCollapsed\n    \">\n    <div class=\"header list-item\">\n      <span class=\"name icon icon-file-directory\" data-name=\"{{entry.name}}\" data-path=\"{{entry.path}}\">{{entry.name}}</span>\n      <span class=\"icon icon-x\" v-on=\"click: close\">\n      </span>\n    </div>\n    <ol class=\"entries list-tree\">\n      <folder v-repeat=\"entry: entry.folders\" track-by=\"name\">\n      </folder>\n      <file v-repeat=\"entry: entry.files\" track-by=\"name\">\n      </file>\n    </ol>\n  </li>";
var treeManager;

treeManager = null;

module.exports = {
  replace: true,
  data: function() {
    return {
      isSelected: false,
      isCollapsed: false,
      color: false
    };
  },
  methods: {
    close: function(e) {
      e.stopPropagation();
      return this.$broadcast("close");
    },
    onClick: function(e) {
      this.$root.selected(this.entry.path);
      this.toggleFolder();
      return e.stopPropagation();
    },
    toggleFolder: function() {
      var ref;
      this.isCollapsed = !this.isCollapsed;
      return (ref = this.$root) != null ? ref.resize() : void 0;
    },
    isEmpty: function() {
      if (typeof this === "undefined" || this === null) {
        return true;
      }
      return this.entry.files.length === 0 && this.entry.folders.length === 0;
    }
  },
  created: function() {
    this.$root.logFolder("created", 2);
    this.$on("selected", (function(_this) {
      return function(path) {
        _this.isSelected = path === _this.entry.path;
        return true;
      };
    })(this));
    this.$on("removeFile", (function(_this) {
      return function(entry) {
        _this.$root.logFolder("removing " + entry.path);
        try {
          _this.entry.files.$remove(entry);
        } catch (_error) {

        }
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
        try {
          _this.entry.folders.$remove(entry);
        } catch (_error) {

        }
        if (_this.isEmpty()) {
          if (_this != null) {
            _this.$dispatch("removeFolder", _this.entry);
          }
        }
        return false;
      };
    })(this));
  },
  destroyed: function() {
    var ref;
    return (ref = this.$root) != null ? ref.resize() : void 0;
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;
