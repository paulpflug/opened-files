var __vue_template__ = "<div tabindex=\"-1\" v-on=\"click: focusEl\" class=\"opened-files color-picker-container\">\n\n  </div>\n  <button v-on=\"click: selectColor\" class=\"btn btn-primary icon icon-paintcan\">Color</button>\n  <button v-on=\"click: unColor\" class=\"btn\">Uncolor</button>";
var ColorPicker, CompositeDisposable, log;

log = null;

ColorPicker = null;

CompositeDisposable = null;

module.exports = {
  data: function() {
    return {
      color: null,
      disposables: null,
      scp: null
    };
  },
  beforeCompile: function() {
    if (log == null) {
      log = require("./../lib/log")("color-picker");
    }
    if (CompositeDisposable == null) {
      CompositeDisposable = require('atom').CompositeDisposable;
    }
    return this.disposables = new CompositeDisposable;
  },
  ready: function() {
    log("ready");
    if (ColorPicker == null) {
      ColorPicker = require("simple-color-picker");
    }
    this.scp = new ColorPicker({
      el: document.querySelector(".opened-files.color-picker-container")
    });
    return this.scp.setColor(this.color);
  },
  attached: function() {
    var ref;
    log("attached");
    return (ref = this.scp) != null ? ref.setColor(this.color) : void 0;
  },
  detached: function() {
    var ref;
    log("detached");
    return (ref = this.disposables) != null ? ref.dispose() : void 0;
  },
  methods: {
    selectColor: function() {
      this.color = this.scp.getHexString();
      log("coloring with " + this.color);
      if (typeof this.cb === "function") {
        this.cb(this.color);
      }
      return this.detach();
    },
    unColor: function() {
      log("uncoloring");
      if (typeof this.cb === "function") {
        this.cb(false);
      }
      return this.detach();
    },
    detach: function() {
      log("detaching");
      this.cb = null;
      try {
        return this.$remove();
      } catch (_error) {

      }
    },
    focusEl: function() {
      return this.$el.focus();
    },
    getRandomColor: function() {
      var color, i, j, letters;
      letters = '0123456789ABCDEF'.split('');
      color = '#';
      for (i = j = 0; j <= 5; i = ++j) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    getNewColor: function(x, y, oldColor, cb) {
      var container;
      this.cb = cb;
      if (oldColor) {
        this.color = oldColor;
      } else {
        this.color = this.getRandomColor();
      }
      if (this.$el == null) {
        container = document.createElement("div");
        container.classList.add("opened-files");
        container.classList.add("color-picker");
        container.setAttribute("tabindex", "-1");
        container.addEventListener("blur", (function(_this) {
          return function(e) {
            log("catched blur");
            if (e.relatedTarget.parentNode !== e.target) {
              return _this.detach;
            }
          };
        })(this));
        this.$mount(container);
      }
      this.$el.setAttribute("style", "top:" + y + "px;left:" + x + "px;");
      this.$appendTo(document.body);
      return this.disposables.add(atom.commands.add("atom-workspace", "core:cancel", this.detach));
    }
  }
};

;(typeof module.exports === "function"? module.exports.options: module.exports).template = __vue_template__;
