var __vue_template__ = "<li class=\"directory list-nested-item\" v-on=\"click: onClick\" v-class=\"\n      selected: isSelected,\n      collapsed: isCollapsed,\n      expanded: !isCollapsed\n    \">\n    <div class=\"header list-item\">\n      <span class=\"name icon icon-file-directory\" data-name=\"{{entry.name}}\" data-path=\"{{entry.path}}\">{{entry.name}}</span>\n      <span class=\"icon icon-x\" v-on=\"click: close\">\n      </span>\n    </div>\n    <ol class=\"entries list-tree\">\n      <template v-component=\"folder\" v-repeat=\"entry: entry.folders\" track-by=\"name\">\n      </template>\n      <template v-component=\"file\" v-repeat=\"entry: entry.files\" track-by=\"name\">\n      </template>\n    </ol>\n  </li>";
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
      this.$broadcast("close");
      return e.stopPropagation();
    },
    onClick: function(e) {
      this.$dispatch("notifySelect", this.entry.name);
      this.toggleFolder();
      return e.stopPropagation();
    },
    toggleFolder: function() {
      return this.isCollapsed = !this.isCollapsed;
    }
  },
  created: function() {
    return this.$on("selected", (function(_this) {
      return function(name) {
        _this.isSelected = name === _this.entry.name;
        return true;
      };
    })(this));
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;
