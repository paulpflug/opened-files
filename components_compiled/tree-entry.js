var __vue_template__ = "<li v-show=\"entry.children.length < 1\" class=\"file entry list-item\" v-on=\"click: onClick\" v-class=\"selected: isSelected\">\n    <span class=\"name icon\">\n      {{entry.name}}\n    </span>\n    <span class=\"icon icon-pin\" v-class=\"unpinned: !isPinned\" v-on=\"click: togglePin\">\n    </span>\n    <span class=\"icon icon-paintcan\" v-on=\"click: paint\">\n    </span>\n  </li>\n  <li v-if=\"entry.children.length > 0\" class=\"directory entry list-nested-item\" v-on=\"click: onClick\" v-class=\"\n      selected: isSelected,\n      collapsed: isCollapsed,\n      expanded: !isCollapsed\n    \">\n    <div class=\"header list-item\">\n      <span class=\"name icon icon-file-directory\" data-name=\"{{entry.name}}\" data-path=\"{{entry.path}}\">{{entry.name}}</span>\n    </div>\n    <ol v-if=\"entry.children\" class=\"entries list-tree\">\n      <template v-component=\"tree-entry\" v-repeat=\"entry: entry.children\" track-by=\"name\">\n      </template>\n    </ol>\n  </li>";
module.exports = {
  data: function() {
    return {
      isSelected: false,
      isCollapsed: false,
      isPinned: false,
      color: false
    };
  },
  methods: {
    paint: function(e) {
      var i, j, len, len1, tab, tabs;
      tabs = document.querySelectorAll(".tab-bar>li.tab[data-type='TextEditor']>div.title[data-path='" + this.entry.path + "']");
      if (this.color) {
        for (i = 0, len = tabs.length; i < len; i++) {
          tab = tabs[i];
          tab.parentElement.removeAttribute("style");
        }
        e.target.parentElement.removeAttribute("style");
      } else {
        for (j = 0, len1 = tabs.length; j < len1; j++) {
          tab = tabs[j];
          tab.parentElement.setAttribute("style", "background-image: -webkit-linear-gradient(top, rgba(161,23,68,1) 0%, rgba(0,0,0,0) 100%);");
        }
        e.target.parentElement.setAttribute("style", "background-image: -webkit-linear-gradient(right, rgba(161,23,68,1) 0%, rgba(0,0,0,0) 100%);");
      }
      console.log;
      return this.color = !this.color;
    },
    togglePin: function() {
      this.isPinned = !this.isPinned;
      return this.entry.pinned = this.isPinned;
    },
    onClick: function(e) {
      this.$dispatch("notifySelect", this.entry.name);
      this.toggleFolder();
      if (this.entry.path && this.entry.children.length === 0) {
        atom.workspace.open(this.entry.path);
      }
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
