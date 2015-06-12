var __vue_template__ = "<li class=\"directory list-nested-item\" v-on=\"click: onClick\" v-class=\"\n      selected: isSelected,\n      collapsed: isCollapsed,\n      expanded: !isCollapsed\n    \">\n    <div class=\"header list-item\">\n      <span class=\"name icon icon-file-directory\" data-name=\"{{entry.name}}\" data-path=\"{{entry.path}}\">{{entry.name}}</span>\n      <span class=\"icon icon-x\" v-on=\"click: close\">\n      </span>\n    </div>\n    <ol class=\"entries list-tree\">\n      <template v-component=\"folder\" v-repeat=\"entry: entry.folders\" track-by=\"name\">\n      </template>\n      <template v-component=\"file\" v-repeat=\"entry: entry.files\" track-by=\"name\">\n      </template>\n    </ol>\n  </li>";
var log, treeManager;

log = null;

treeManager = null;

module.exports = {
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
      this.$dispatch("notifySelect", this.entry.name);
      this.toggleFolder();
      return e.stopPropagation();
    },
    toggleFolder: function() {
      this.isCollapsed = !this.isCollapsed;
      return treeManager.autoHeight();
    },
    isEmpty: function() {
      return this.entry.files.length === 0 && this.entry.folders.length === 0;
    }
  },
  created: function() {
    this.$on("selected", (function(_this) {
      return function(name) {
        _this.isSelected = name === _this.entry.name;
        return true;
      };
    })(this));
    this.$on("removeFile", (function(_this) {
      return function(entry) {
        log("removing " + entry.path);
        _this.entry.files.$remove(entry);
        if (_this.isEmpty()) {
          _this.$dispatch("removeFolder", _this.entry);
        }
        return false;
      };
    })(this));
    return this.$on("removeFolder", (function(_this) {
      return function(entry) {
        _this.entry.folders.$remove(entry);
        if (_this.isEmpty()) {
          _this.$dispatch("removeFolder", _this.entry);
        }
        return false;
      };
    })(this));
  },
  destroyed: function() {
    return treeManager.autoHeight();
  },
  beforeCompile: function() {
    if (log == null) {
      log = require("./../lib/log")("file-comp");
    }
    return treeManager != null ? treeManager : treeManager = require("./../lib/tree-manager");
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;
