// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


(function() {
    var JVClipboard;

    JVClipboard = new ((function() {

        function _Class() {
            var _this = this;
            this.value = "";
            this.scrollY = 0;
            $(document).keydown(function(e) {
                var _ref, _ref1;
                if (!_this.value || !(e.ctrlKey || e.metaKey)) {
                    return;
                }
                console.log('Is ctrl key.', window.scrollY);
                if ($(e.target).is("input:visible,textarea:visible")) {
                    return;
                }
                console.log('Is not an input.', window.scrollY);
                if (typeof window.getSelection === "function" ? (_ref = window.getSelection()) != null ? _ref.toString() : void 0 : void 0) {
                    return;
                }
                console.log('Nothing is selected.', window.scrollY);
                if ((_ref1 = document.selection) != null ? _ref1.createRange().text : void 0) {
                    return;
                }
                console.log('!!!!       I shall try to copy it.', window.scrollY);
                return _.defer(function() {
                    var $clipboardContainer;
                    $clipboardContainer = $("#clipboard-container");
                    console.log('####       1.', window.scrollY);
                    $clipboardContainer.empty().show();
                    console.log('####       2.', window.scrollY);
                    $("<textarea id='clipboard'></textarea>").val(_this.value).appendTo($clipboardContainer).focus().select();
                    console.log('####       3.', window.scrollY);
                    window.scrollY += 12;
                    console.log('####       4.', window.scrollY);
                    return;
                });
            });
            $(document).keyup(function(e) {
                if ($(e.target).is("#clipboard")) {
                    return $("#clipboard-container").empty().hide();
                }
            });
        }

        _Class.prototype.set = function(value) {
            if(value) {
                this.scrollY = window.scrollY;
                console.log("Value:", value, this.scrollY);
            }
            this.value = value;
        };

        return _Class;

    })());

    window.JVClipboard = JVClipboard;
}).call(this);

