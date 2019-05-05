if (typeof jQuery === 'undefined') {
   throw new Error('Accessibility JavaScript requires jQuery');
}
+function ($) {
    'use strict';

    // focus management PUBLIC CLASS DEFINITION
    // ===============================

    var AccFocus = function (element, options) {
        this.$element = $(element);
        this.$options = $.extend({}, AccFocus.DEFAULTS, options);
        this.$element.data("accFocus", this);
        this.init();
    };

    AccFocus.DEFAULTS = $.extend({}, {
    });

    AccFocus.prototype.getDefaults = function () {
        return AccFocus.DEFAULTS;
    };

    AccFocus.prototype.setFocus = function () {
        //make this an option to add focus, hover etc
        var that = this;
        if (this._toggle === 'click') {
            this.$element.click(focusCallback);
        } else if (this._toggle === 'tab') {
            this.$element.on('keyup', function (e) {
                if (/*that.$element.is(':focus') &&*/ e.keyCode === 9) {
                    focusCallback();
                }
            });
        } else if (this._toggle === 'keyup-enter') {
            this.$element.on('keyup', function (e) {
                if (/*that.$element.is(':focus') &&*/ e.keyCode === 13) {
                    focusCallback();
                }
            });
        }

        function focusCallback() {
            if(that._timeoutPeriod) {
                setTimeout(function () {
                    that._focusAction();
                }, that._timeoutPeriod);
            } else {
                that._focusAction();
            }
        }
    };

    AccFocus.prototype._focusAction = function () {
        $('[data-accessibility-focus-target="' + this._nextId + '"]').focus();
        if(this._ariaExpanded) {
            this._ariaexpandedToggle();
        }
        if(this._returnId) {
            $(document).bind('keyup',{that: this},this._escKeyHandler);
        }
    };

    AccFocus.prototype._ariaexpandedToggle = function () {
        if($('[data-accessibility-focus-target="' + this._nextId + '"]').is(':visible')) {
            $('[data-accessibility-focus-return="' + this._returnId + '"]').attr('aria-expanded','true');
        } else {
            $('[data-accessibility-focus-return="' + this._returnId + '"]').attr('aria-expanded','false');
        }
    };

    AccFocus.prototype._escKeyHandler = function (e) {
        var that = e.data.that;
        if (e.keyCode === 27) {
            if(that._timeoutPeriod) {
                setTimeout(function () {
                    that._escAction();
                }, that._timeoutPeriod);
            } else {
                that._escAction();
            }
        }
    };

    AccFocus.prototype._escAction = function () {
        $(document).unbind('keyup', this._escKeyHandler);
        $('[data-accessibility-focus-return="' + this._returnId + '"]').focus();
        this._ariaexpandedToggle();
    };

    AccFocus.prototype.init = function () {
        this._returnId = this.$element.attr('data-accessibility-focus-return');
        this._nextId = this.$element.attr('data-accessibility-focus-next');
        this._timeoutPeriod = this.$element.attr('data-accessibility-timeout');
        this._ariaExpanded = this.$element.attr('aria-expanded');
        this._toggle = this.$element.attr('data-accessibility-toggle-method');
        this.setFocus();
    };

    $.fn.accFocus = function (option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('accFocus');
            var options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }
            if (!data) {
                data = new AccFocus(this, options);
                $this.data('accFocus', data);
            }
            if (typeof option === 'string') {
                return data[option]();
            }
        });
    };
}(jQuery);

+function ($) {
    'use strict';

    // Accessible Menu PUBLIC CLASS DEFINITION
    // ===============================

    var AccMenu = function (element, options) {
        this.$element = $(element);
        this.$options = $.extend({}, AccMenu.DEFAULTS, options);
        this.$element.data("accMenu", this);
        this.init();
    };

    AccMenu.DEFAULTS = $.extend({}, {
    });

    AccMenu.prototype.getDefaults = function () {
        return AccMenu.DEFAULTS;
    };

    AccMenu.prototype._initializeIndexes = function () {
        var menuItems = this.$element.find('li > [role="menuitem"]');
        this.$menuItemCount = menuItems.length;
        this.$currentIndex = 0;
        var that = this;
        menuItems.each(function (index) {
           if($(this).attr('data-accessibility-menu-active') === 'true') {
               that.$currentIndex = index;
           }
            $(this).attr('data-accessibility-menu-item-index', index);
        });
    };

    AccMenu.prototype._initializeEvents = function () {
        var that = this;
        that.$element.on('focus', function () {
            that.$element.find('[data-accessibility-menu-item-index="' + that.$currentIndex + '"]').focus();
        });

        $(that.$element).keyup(function (e) {
            // up arrow
            if (e.keyCode === 38) {
                e.preventDefault();
                e.stopPropagation();
                if (that.$currentIndex - 1 === -1) {
                    that.$currentIndex = that.$menuItemCount;
                }
                that.$element.find('[data-accessibility-menu-item-index="' + (that.$currentIndex - 1) + '"]').focus();
                that.$currentIndex--;
            }
            // down arrow
            if (e.keyCode === 40) {
                e.preventDefault();
                e.stopPropagation();
                if (that.$currentIndex + 1 === that.$menuItemCount) {
                    that.$currentIndex = -1;
                }
                that.$element.find('[data-accessibility-menu-item-index="' + (that.$currentIndex + 1) + '"]').focus();
                that.$currentIndex++;
            }
            // escape key
            if (e.keyCode == 27) {
                
                e.preventDefault();
                e.stopPropagation();
                that.$element.siblings().focus();
            }
            // enter key
            if (e.keyCode === 13) {
                var value = $(document.activeElement).text();
                that.$element.siblings().text(value);
                that.$element.siblings().focus();
            }

        });
    };

    AccMenu.prototype.init = function () {
        this._initializeIndexes();
        this._initializeEvents();
    };

    $.fn.accMenu = function (option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('accMenu');
            var options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }
            if (!data) {
                data = new AccMenu(this, options);
                $this.data('accMenu', data);
            }
            if (typeof option === 'string') {
                return data[option]();
            }
        });
    };
}(jQuery);

+function ($) {
    'use strict';

    // Accessible MenuBar PUBLIC CLASS DEFINITION
    // ===============================

    var AccMenuBar = function (element, options) {
        this.$element = $(element);
        this.$options = $.extend({}, AccMenuBar.DEFAULTS, options);
        this.$element.data("accMenuBar", this);
        this.init();
    };

    AccMenuBar.DEFAULTS = $.extend({}, {
    });

    AccMenuBar.prototype.getDefaults = function () {
        return AccMenuBar.DEFAULTS;
    };

    AccMenuBar.prototype._initializeIndexes = function () {
        var menus = this.$element.find('[data-accessibility-menu-item-parent]');
        this.$menuCount = menus.length;
        this.$currentParentIndex = 0;
        var that = this;
        menus.each(function (index) {
           if($(this).attr('data-accessibility-menu-active') === 'true') {
               that.$currentParentIndex = index;
           }
            $(this).attr('data-accessibility-menu-parent-item-index', index);
        });
    };

    AccMenuBar.prototype._initializeEvents = function () {
        var that = this;
        that.$element.on('focus', function () {
            that.$element.find('[data-accessibility-menu-parent-item-index="' + that.$currentParentIndex + '"]').focus();
        });

        $(that.$element).keyup(function (e) {
            // left arrow
            if (e.keyCode === 37) {
                e.preventDefault();
                e.stopPropagation();
                if (that.$currentParentIndex - 1 === -1) {
                    that.$currentParentIndex = that.$menuCount;
                }
                that.$element.find('[data-accessibility-menu-parent-item-index="' + (that.$currentParentIndex - 1) + '"]').focus();
                that.$currentParentIndex--;
            }
            // right arrow
            if (e.keyCode === 39) {
                e.preventDefault();
                e.stopPropagation();
                if (that.$currentParentIndex + 1 === that.$menuCount) {
                    that.$currentParentIndex = -1;
                }
                that.$element.find('[data-accessibility-menu-parent-item-index="' + (that.$currentParentIndex + 1) + '"]').focus();
                that.$currentParentIndex++;
            }
            // escape key and k ('k' is to check if bootstrap model is used)
            if ((e.keyCode === 75)||(e.keyCode === 27)) {
                e.preventDefault();
                e.stopPropagation();
                that.$element.find('[data-accessibility-menu-parent-item-index="' + that.$currentParentIndex + '"]').siblings().toggle(); //change this
                that.$element.find('[data-accessibility-menu-parent-item-index="' + that.$currentParentIndex + '"]').focus();
            }
            // down arrow and enter key
            if ((e.keyCode === 40)||(e.keyCode === 13)) {
                e.preventDefault();
                e.stopPropagation();
                that.$element.find('[data-accessibility-menu-parent-item-index="' + that.$currentParentIndex + '"]').siblings().toggle();
                that.$element.find('[data-accessibility-menu-parent-item-index="' + that.$currentParentIndex + '"]').siblings().find('[role="menuitem"]').first().focus();
            }

        });
    };

    AccMenuBar.prototype.init = function () {
        this._initializeIndexes();
        this._initializeEvents();
    };

    $.fn.accMenuBar = function (option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('accMenuBar');
            var options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }
            if (!data) {
                data = new AccMenuBar(this, options);
                $this.data('accMenuBar', data);
            }
            if (typeof option === 'string') {
                return data[option]();
            }
        });
    };
}(jQuery);

+function ($) {
    'use strict';

    // Skip Link PUBLIC CLASS DEFINITION
    // ===============================

    var AccSkipLink = function (element, options) {
        this.$element = $(element);
        this.$element.data("accSkipLink", this);
        this.init();
    };

    AccSkipLink.prototype.init = function () {
        var skipLinks = this.$element.find('[data-accessibility-skip-link]');
        this.$skipLinksCount = skipLinks.length;
        /*var popup = ' <div class="modal fade" tabindex="-1" role="dialog" id="mainpop"><div class="modal-dialog" role="document"><div class="modal-content">';
        popup = popup + '<div class="modal-header" align="center"><h4 class="modal-title">Skip Links</h4></div><div class="modal-body">';*/
        var popup = '<div class="modal-dialog" role="document"><div class="modal-content"><div id="myModal1" class="modal just"><div class="modal-content"><span id="remove" class="close">&times;</span>';
        popup = popup + "<div class='modal-header' align='center'><h4 class='modal-title'>Skip Links</h4></div><ul id='linklist'>";
        var link;
        for(link = 0; link < this.$skipLinksCount; link++) {
            popup = popup + '<li><a href="#' + skipLinks[link].getAttribute('data-accessibility-skip-link') + '">' + skipLinks[link].getAttribute('data-accessibility-skip-link') + '</a> </li>'
        }
        
        $('body').append(popup);
        popup = popup + "</ul></div></div></div></div>";
        var modal = document.getElementById('myModal1');
        //var modal2 = document.getElementById('mainpop');
        var span1 = document.getElementById("remove");
        var linklist = document.getElementById("linklist");
        var keys1 = {17: false, 89: false};
        $(document).keydown(function(e) {
            if (e.keyCode in keys1) {
                keys1[e.keyCode] = true;
                if (keys1[17] && keys1[89]) {
                    modal.style.display = "block";
                    $('#linklist').children().first().children().focus();
                }
            };
        }).keyup(function(e) {
            if (e.keyCode in keys1) {
                keys1[e.keyCode] = false;
            }
        });
         span1.onclick = function() {
            modal.style.display = "none";
        }
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        } 
        $(linklist.getElementsByTagName('a')).each(function () {
            this.onclick = function() {
                modal.style.display = "none";
            }
        });
    };
    
    $.fn.accSkipLink = function (option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('accSkipLink');
            var options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }
            if (!data) {
                data = new AccSkipLink(this, options);
                $this.data('accSkipLink', data);
            }
            if (typeof option === 'string') {
                return data[option]();
            }
        });
    };
}(jQuery);


+function ($) {

    // High Colour Contrast CSS PUBLIC CLASS DEFINITION
    // ===============================

    'use strict';
     var AccStyle = function () {
        this.init();
    };

    AccStyle.prototype.init = function () {
        var keys = {17: false, 81: false};

        $(document).keydown(function(e) {
            if (e.keyCode in keys) {
                keys[e.keyCode] = true;
                if (keys[17] && keys[81]) { 
                    $('[data-accessibility-class]').each(function() {
                        if ($(this).hasClass($(this).attr('data-accessibility-class'))){
                             $(this).removeClass($(this).attr('data-accessibility-class'));
                        }
                        else{
                            $(this).addClass($(this).attr('data-accessibility-class'));
                        }
                    });
                }
            }
        }).keyup(function(e) {
            if (e.keyCode in keys) {
                keys[e.keyCode] = false;
            }
        });
    };

    $.fn.accStyle = function (option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('accStyle');
            var options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }
            if (!data) {
                data = new AccStyle(this, options);
                $this.data('accStyle', data);
            }
            if (typeof option === 'string') {
                return data[option]();
            }
        });
    };
}(jQuery);

+function ($) {
    'use strict';

    // Accessible Seat Map PUBLIC CLASS DEFINITION
    // ===============================

    var AccSeatMap = function (element, options) {
        this.$element = $(element);
        this.$element.data("accSeatMap", this);
        this.init();
    };

    AccSeatMap.prototype.init = function () {

        var rowItems = this.$element.find('[data-accessibility-row-index][data-accessibility-col-index = "' + 1 + '"]');
        var colItems = this.$element.find('[data-accessibility-col-index][data-accessibility-row-index = "' + 1 + '"]');
        var rowItemsCount = rowItems.length;
        var colItemsCount = colItems.length;
        var that = $('[data-accessibility-seat-map]');

        $(that).keydown(function (e) {

            var current = $(":focus");
            var colNo = Number($(current).attr('data-accessibility-col-index'));
            var rowNo = Number($(current).attr('data-accessibility-row-index'));
            // up arrow
            if (e.keyCode === 38) {
                e.preventDefault();
                e.stopPropagation();
                if (rowNo === 1) {
                    $('[data-accessibility-row-index="' + rowItemsCount + '"][data-accessibility-col-index="' + colNo + '"]').focus();
                }
                else{
                    $('[data-accessibility-row-index="' + (rowNo - 1) + '"][data-accessibility-col-index="' + colNo + '"]').focus();
                }
            }
            // down arrow
            if (e.keyCode === 40) {
                e.preventDefault();
                e.stopPropagation();
                if (rowNo === rowItemsCount) {
                    $('[data-accessibility-row-index="' + 1 + '"][data-accessibility-col-index="' + colNo + '"]').focus();
                }
                else{
                    $('[data-accessibility-row-index="' + (rowNo + 1) + '"][data-accessibility-col-index="' + colNo + '"]').focus();
                }
            }
            // left arrow
            if (e.keyCode === 37) {
                e.preventDefault();
                e.stopPropagation();
                if (colNo === 1) {
                    $('[data-accessibility-col-index="' + colItemsCount + '"][data-accessibility-row-index="' + rowNo + '"]').focus();
                }
                else{
                    $('[data-accessibility-col-index="' + (colNo - 1) + '"][data-accessibility-row-index="' + rowNo + '"]').focus();
                }
            }
            // right arrow
            if (e.keyCode === 39) {
                e.preventDefault();
                e.stopPropagation();
                if (colNo === colItemsCount) {
                    $('[data-accessibility-col-index="' + 1 + '"][data-accessibility-row-index="' + rowNo + '"]').focus();
                }
                else{
                    $('[data-accessibility-col-index="' + (colNo + 1) + '"][data-accessibility-row-index="' + rowNo + '"]').focus();
                }
            }

        });
    };

    $.fn.accSeatMap = function (option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('accSeatMap');
            var options = typeof option === 'object' && option;

            if (!data && option === 'destroy') {
                return;
            }
            if (!data) {
                data = new AccSeatMap(this, options);
                $this.data('accSeatMap', data);
            }
            if (typeof option === 'string') {
                return data[option]();
            }
        });
    };
}(jQuery);


(function($) {
    $('[data-accessibility-focus-next]').each(function(){
        $(this).accFocus();
    });
    $('[data-accessibility-menu]').each(function(){
        $(this).accMenu();
    });
    $('[data-accessibility-menubar]').each(function(){
        $(this).accMenuBar();
    });
    $('[data-accessibility-skipLink]').each(function(){
        $(this).accSkipLink();
    });
    $('[data-accessibility-class]').each(function(){
        $('body').accStyle();
    });
    $('[data-accessibility-seat-map]').each(function(){
        $(this).accSeatMap();
    });
})(jQuery);