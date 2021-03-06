/**
 * Woo Folder Selection - v0.1.0 - 2017-08-30
 * http://pluginever.com
 *
 * Copyright (c) 2017;
 * Licensed GPLv2+
 */
(function($, undefined){
    // Default Settings
    var _defaults = {
        buttonDone      : "OK",
        buttonFail      : undefined,
        buttonsOrder    : "done fail",
        customClass     : "",
        filterDone      : undefined,
        filterFail      : undefined,
        input           : false,
        message         : "",
        queue           : true,
        speed           : 200,
        top             : "25%",
        width           : "auto"
    };
    
    // Required CSS
    var _css = {
        overlay : {
            "box-sizing"    : "border-box",
            "display"       : "flex",
            "flex-flow"     : "column nowrap",
            "align-items"   : "center",
            "position"      : "fixed",
            "top"           : "0",
            "left"          : "0",
            "width"         : "100%",
            "height"        : "100%"
        },
        spacer : {
            "box-sizing"    : "border-box",
            "flex"          : "0 1 auto"
        },
        messagebox : {
            "box-sizing"    : "border-box",
            "flex"          : "0 1 auto",
            "display"       : "flex",
            "flex-flow"     : "column nowrap",
        },
        content : {
            "box-sizing"    : "border-box",
            "flex"          : "0 1 auto",
            "overflow-y"    : "auto"
        },
        buttons : {
            "box-sizing"    : "border-box",
            "flex"          : "0 0 auto"
        },
        boxSizing : {
            "box-sizing"    : "border-box"
        }
    };
    
    // Globals
    var _active         = undefined;
    var _activeStack    = [];
    var _queue          = [];
    
    // Constants
    var _constants = {
        buttonDoneName          : "buttonDone",
        buttonFailName          : "buttonFail",
        errorSpeed              : 200,
        keyCodeDone             : [13],
        keyCodeFail             : [27],
        maxHeightCoefficient    : 1.5,
        topBuffer               : 100
    };
    
    
    // **************************************************
    //  METHODS
    // **************************************************
    $.MessageBoxSetup = function(options){
        $.extend(true, _defaults, options);
    };
    
    $.MessageBox = function(options){
        if (!$.isPlainObject(options)) options = {message : options};
        var deferred    = $.Deferred();
        var settings    = $.extend(true, {}, _defaults, options);
        settings.top = $.trim(settings.top).toLowerCase();
        
        // Remove focus from active element
        $(document.activeElement).not(".messagebox_content_input").trigger("blur");
        
        // Create MessageBox instance
        var instance = {
            deferred    : deferred,
            keyCodes    : {},
            settings    : settings
        };
        if (settings.queue) {
            _queue.push(instance);
            _ExecuteQueue();
        } else {
            if (_active) _activeStack.push(_active);
            _CreateMessageBox(instance);
        }
        
        // Return Promise
        return deferred.promise();
    };
    
    
    // **************************************************
    //  FUNCTIONS
    // **************************************************
    function _ExecuteQueue(){
        if (_active || !_queue.length) return;
        _CreateMessageBox(_queue.shift());
    }
    
    function _CreateMessageBox(instance){   
        var settings = instance.settings;
        _active = instance;
        
        // Overlay
        var overlay = $("<div>", {
            class   : "messagebox_overlay"
        })
        .css(_css.overlay)
        .appendTo("body");
        
        // Spacer
        var spacer = $("<div>", {
            class   : "messagebox_spacer"
        })
        .css(_css.spacer)
        .appendTo(overlay);
        
        // MessageBox
        var messageBox = $("<div>", {
            class   : "messagebox"
        })
        .addClass(settings.customClass)
        .css(_css.messagebox)
        .data("instance", instance)
        .appendTo(overlay);
        if (settings.width) messageBox.outerWidth(settings.width);
        
        // Content
        var content = $("<div>", {
            class   : "messagebox_content",
            html    : settings.message
        })
        .css(_css.content)
        .appendTo(messageBox);
        
        // Input
        if (settings.input !== false && settings.input !== undefined && settings.input !== null) {
            var inputs = $("<div>", {
                class   : "messagebox_content_inputs",
                css     : _css.boxSizing
            }).appendTo(content);
            _ParseInputs(settings.input).appendTo(inputs).first().trigger("focus");
        }
        
        // Error
        $("<div>", {
            class   : "messagebox_content_error",
            css     : _css.boxSizing
        })
        .hide()
        .appendTo(content);
        
        // Buttons
        var buttonsWrapper = $("<div>", {
            class   : "messagebox_buttons"
        })
        .css(_css.buttons)
        .appendTo(messageBox);
        
        // Button Done
        if (settings.buttonDone) {
            var buttons = $([]);
            if (typeof settings.buttonDone === "string") {
                buttons = buttons.add(_CreateButton("messagebox_button_done", _constants.buttonDoneName, {
                    text    : settings.buttonDone, 
                    keyCode : _constants.keyCodeDone.concat(settings.buttonFail ? [] : _constants.keyCodeFail)
                }, instance));
            } else {
                $.each(settings.buttonDone, function(name, definition){
                    buttons = buttons.add(_CreateButton("messagebox_button_done", name, definition, instance));
                });
            }
            buttons.appendTo(buttonsWrapper);
        }
        
        // Button Fail
        if (settings.buttonFail) {
            var buttons = $([]);
            if (typeof settings.buttonFail === "string") {
                buttons = buttons.add(_CreateButton("messagebox_button_fail", _constants.buttonFailName, {
                    text    : settings.buttonFail, 
                    keyCode : _constants.keyCodeFail
                }, instance));
            } else {
                $.each(settings.buttonFail, function(name, definition){
                    buttons = buttons.add(_CreateButton("messagebox_button_fail", name, definition, instance));
                });
            }
            if ($.trim(settings.buttonsOrder).toLowerCase().indexOf("d") === 0) {
                buttons.appendTo(buttonsWrapper);
            } else {
                buttons.prependTo(buttonsWrapper);
            }
        }
        
        // Calculate spacer's height
        var spacerHeight    = 0;
        var spacerTopMargin = 0 - messageBox.outerHeight() - _constants.topBuffer;;
        if ($.trim(settings.top).toLowerCase() === "auto") {
            // Auto: center vertically using flexbox
            overlay.css("justify-content", "center");
            spacerTopMargin = spacerTopMargin - $(window).height();
        } else {
            // Custom: use a spacer element to workoround different browsers' flexbox specs interpretation
            overlay.css("justify-content", "flex-start");
            spacerHeight = settings.top;;
            // Calculate max-height
            if ($.trim(settings.top).toLowerCase().slice(-1) === "%")  {
                // Percentage: set a fixed percentage value too
                messageBox.css("max-height", 100 - (parseInt(settings.top, 10) * _constants.maxHeightCoefficient) + "%");
            } else {
                // Fixed: refresh on every window.resize event
                messageBox.data("fRefreshMaxHeight", true);
            }
        }
        
        // Show MessageBox    
        spacer
            .data("spacerTopMargin", spacerTopMargin)
            .css({
                "height"        : 0,
                "margin-top"    : spacerTopMargin
            })
            .animate({
                "height"        : spacerHeight,
                "margin-top"    : 0
            }, settings.speed, function(){
                _SetMaxHeight(messageBox, $(window).height());
            });
    }
    
    
    function _CreateButton(mainClass, name, definition, instance){
        if (typeof definition === "string") definition = {text : definition};
        // Button
        var button = $("<button>", {
            class   : mainClass,
            text    : definition.text || ""
        })
        .addClass(definition.class)
        .css(_css.boxSizing)
        .on("click", {name : name}, _Button_Click);
        
        // KeyCodes
        $.each(_ParseKeycodes(definition.keyCode), function(i, keyCode){
            instance.keyCodes[keyCode] = button;
        });
        
        return button;
    }
    
    function _ParseKeycodes(keyCodes){
        if (typeof keyCodes === "number" || typeof keyCodes === "string") keyCodes = [keyCodes];
        var ret = [];
        if ($.isArray(keyCodes)) {
            ret = $.map(keyCodes, function(keycode){
                return parseInt(keycode, 10) || undefined;
            });
        }
        return ret;
    }
    
    
    function _ParseInputs(settingsInput){
        // Boolean: plain textbox
        if (settingsInput === true || typeof settingsInput === "string") {
            return _FormatInput($("<input>", {
                value   : (settingsInput === true) ? "" : settingsInput,
                type    : "text"
            }), {
                autotrim    : true
            });
        }
        
        // Array: plain textboxes with default values
        if ($.isArray(settingsInput)) {
            var ret = $([]);
            $.each(settingsInput, function(i, value){
                ret = ret.add(_FormatInput($("<input>", {
                    value   : value,
                    type    : "text"
                }), {
                    autotrim    : true
                }));
            });
            return ret;
        }
        
        // Object: multiple inputs
        if ($.isPlainObject(settingsInput)) {
            var ret = $([]);
            $.each(settingsInput, function(name, definition){
                var input = _CreateInput(name, definition);
                if (definition.label !== undefined) {
                    var label = $("<label>", {
                        class   : "messagebox_content_label",
                        css     : _css.boxSizing,
                        text    : definition.label
                    });
                    input.appendTo(label);
                    ret = ret.add(label);
                } else {
                    ret = ret.add(input);
                }
            });
            return ret;
        }
        
        // Default: custom jQuery object/selector or DOM element
        return $(settingsInput);
    }
    
    function _CreateInput(name, definition){
        var type = $.trim(definition.type).toLowerCase();
        switch (type) {
            case "select":
                var select  = _FormatInput($("<select>"), {
                    name        : name, 
                    title       : definition.title,
                    autotrim    : false
                });
                var options = !$.isArray(definition.options) ? definition.options : definition.options.reduce(function(ret, item){
                    ret[item] = item;
                    return ret;
                }, {});
                if (!options) {
                    _Warning('No options provided for "' + name + '"'); 
                    options = {"" : "&nbsp;"};
                }
                var defaultSelected = false;
                $.each(options, function(value, html){
                    var option = $("<option>", {
                        value   : value,
                        html    : html
                    }).appendTo(select);
                    if (definition.default == value) {
                        option.prop("selected", true);
                        defaultSelected = true;
                    }
                });
                // Fake placeholder
                if (!defaultSelected) {
                    $("<option>", {
                        value   : "",
                        text    : definition.title
                    }).prop({
                        "disabled"  : true,
                        "selected"  : true,
                        "hidden"    : true
                    }).prependTo(select);
                    select.find("option").css("color", select.css("color"));  
                    select
                        .addClass("messagebox_content_input_selectplaceholder")
                        .prop("selectedIndex", 0)
                        .one("change", function(){
                            select.find("option").css("color", "");
                            select.removeClass("messagebox_content_input_selectplaceholder");
                        });
                }
                return select;
                
            case "text":
            case "password":
            default:
                return _FormatInput($("<input>", {
                    type        : (type === "password") ? "password" : "text",
                    maxlength   : definition.maxlength,
                    placeholder : definition.title,
                    value       : definition.default
                }), {
                    name        : name, 
                    title       : definition.title,
                    autotrim    : definition.autotrim
                });
        }
    }
    
    function _FormatInput(input, par){
        if (par.autotrim !== false) input.on("blur", _Input_Blur);
        return input
            .addClass("messagebox_content_input")
            .css(_css.boxSizing)
            .attr({
                name    : par.name,
                title   : par.title
            });
    }
    
    function _GetInputsValues(messageBox){
        var names   = [];
        var values  = [];
        messageBox.find(".messagebox_content_inputs").find("input, select").each(function(){
            var input = $(this);
            names.push(input.attr("name"));
            values.push(input.val());
        });
        if (!values.length) return undefined;
        var retObject   = {};
        var valuesOnly  = false;
        $.each(names, function(i, name){
            if (name === undefined) {
                valuesOnly = true;
                return false;
            }
            retObject[name] = values[i];
        });
        if (valuesOnly && values.length === 1) return values[0];
        return valuesOnly ? values : retObject;
    }
    
    
    function _SetMaxHeight(messageBox, h){
        if (messageBox.data("fRefreshMaxHeight")) messageBox.css("max-height", h - (messageBox.offset().top * _constants.maxHeightCoefficient));
    }
    
    function _Warning(message){
        message = "jQuery MessageBox Warning: " + message;
        if (window.console.warn) {
            console.warn(message);
        } else if (window.console.log) {
            console.log(message);
        }
    }
    
    
    // **************************************************
    //  EVENTS
    // **************************************************
    function _Input_Blur(event){
        var input = $(event.currentTarget);
        input.val($.trim(input.val()));
    }
    
    function _Button_Click(event){
        var button      = $(event.currentTarget);
        var buttonName  = event.data.name;
        var messageBox  = button.closest(".messagebox");
        var overlay     = messageBox.closest(".messagebox_overlay");
        var spacer      = overlay.children(".messagebox_spacer").first();
        var content     = messageBox.children(".messagebox_content").first();
        var error       = content.children(".messagebox_content_error").first();
        var instance    = messageBox.data("instance");
        var inputValues = _GetInputsValues(messageBox);
        var filterFunc  = button.hasClass("messagebox_button_done") ? instance.settings.filterDone : instance.settings.filterFail;
        
        // Filter
        error.hide().empty();
        var filterDef = ($.type(filterFunc) !== "function") ? $.Deferred().resolve() : $.when(filterFunc(inputValues, buttonName)).then(function(ret){
            // Bool false: abort
            if (ret === false) return $.Deferred().reject();
            var retType = $.type(ret);
            // Error: display error message and abort (NOTE: it requires jQuery 1.9+ or it will fall in the next case)
            if (retType === "error") return $.Deferred().reject(ret.message);
            // String or (jQuery) Object: display error and abort
            if (retType === "string" || retType === "object" || retType === "array") return $.Deferred().reject(ret);
            // Everything else: continue
            return $.Deferred().resolve();
        });
        
        filterDef.then(function(){
            spacer.animate({
                "height"        : 0,
                "margin-top"    : spacer.data("spacerTopMargin")
            }, instance.settings.speed, function(){
                // Remove DOM objects
                overlay.remove();
                
                // Resolve or Reject Deferred
                if (button.hasClass("messagebox_button_done")) {
                    instance.deferred.resolve(inputValues, buttonName);
                } else {
                    instance.deferred.reject(inputValues, buttonName);
                }
                
                if (_activeStack.length) {
                    // Restore the last active instance
                    _active = _activeStack.pop();
                } else {
                    // Execute next Queue instance
                    _active = undefined;
                    _ExecuteQueue();
                }
            });
        }, function(errorMessage){
            var errorMessageType = $.type(errorMessage);
            if (errorMessageType === "string" || errorMessageType === "object" || errorMessageType === "array") {
                error.css("max-width", content.width()).append(errorMessage).slideDown(_constants.errorSpeed, function(){
                    content.scrollTop(content.height());
                });
            }
        });
    }
    
    function _Window_Resize(event){
        if (!_active) return;
        var w = $(event.currentTarget).width();
        var h = $(event.currentTarget).height();
        $(document).find(".messagebox").each(function(){
            var messageBox = $(this);
            messageBox.css("min-width", (messageBox.outerWidth() > w) ? w : "");
            _SetMaxHeight(messageBox, h);
        });
    }
    
    function _Window_KeyDown(event){
        if (!_active) return;
        var button = _active.keyCodes[event.which];
        if (button) {
            button.closest(".messagebox").find(".messagebox_content_input").trigger("blur");
            button.trigger("click");
        }
    }
    
    
    $(function(){
        $(window)
            .on("resize",   _Window_Resize)
            .on("keydown",  _Window_KeyDown);
    });
    
}(jQuery));
!function(e,t){function o(){!h&&y.length&&n(y.shift())}function n(o){var n=o.settings;h=o;var a=e("<div>",{class:"messagebox_overlay"}).css(x.overlay).appendTo("body"),r=e("<div>",{class:"messagebox_spacer"}).css(x.spacer).appendTo(a),c=e("<div>",{class:"messagebox"}).addClass(n.customClass).css(x.messagebox).data("instance",o).appendTo(a);n.width&&c.outerWidth(n.width);var u=e("<div>",{class:"messagebox_content",html:n.message}).css(x.content).appendTo(c);if(n.input!==!1&&n.input!==t&&null!==n.input){var l=e("<div>",{class:"messagebox_content_inputs",css:x.boxSizing}).appendTo(u);i(n.input).appendTo(l).first().trigger("focus")}e("<div>",{class:"messagebox_content_error",css:x.boxSizing}).hide().appendTo(u);var p=e("<div>",{class:"messagebox_buttons"}).css(x.buttons).appendTo(c);if(n.buttonDone){var f=e([]);"string"==typeof n.buttonDone?f=f.add(s("messagebox_button_done",_.buttonDoneName,{text:n.buttonDone,keyCode:_.keyCodeDone.concat(n.buttonFail?[]:_.keyCodeFail)},o)):e.each(n.buttonDone,function(e,t){f=f.add(s("messagebox_button_done",e,t,o))}),f.appendTo(p)}if(n.buttonFail){var f=e([]);"string"==typeof n.buttonFail?f=f.add(s("messagebox_button_fail",_.buttonFailName,{text:n.buttonFail,keyCode:_.keyCodeFail},o)):e.each(n.buttonFail,function(e,t){f=f.add(s("messagebox_button_fail",e,t,o))}),0===e.trim(n.buttonsOrder).toLowerCase().indexOf("d")?f.appendTo(p):f.prependTo(p)}var g=0,b=0-c.outerHeight()-_.topBuffer;"auto"===e.trim(n.top).toLowerCase()?(a.css("justify-content","center"),b-=e(window).height()):(a.css("justify-content","flex-start"),g=n.top,"%"===e.trim(n.top).toLowerCase().slice(-1)?c.css("max-height",100-parseInt(n.top,10)*_.maxHeightCoefficient+"%"):c.data("fRefreshMaxHeight",!0)),r.data("spacerTopMargin",b).css({height:0,"margin-top":b}).animate({height:g,"margin-top":0},n.speed,function(){d(c,e(window).height())})}function s(t,o,n,s){"string"==typeof n&&(n={text:n});var i=e("<button>",{class:t,text:n.text||""}).addClass(n.class).css(x.boxSizing).on("click",{name:o},f);return e.each(a(n.keyCode),function(e,t){s.keyCodes[t]=i}),i}function a(o){"number"!=typeof o&&"string"!=typeof o||(o=[o]);var n=[];return e.isArray(o)&&(n=e.map(o,function(e){return parseInt(e,10)||t})),n}function i(o){if(o===!0||"string"==typeof o)return c(e("<input>",{value:o===!0?"":o,type:"text"}),{autotrim:!0});if(e.isArray(o)){var n=e([]);return e.each(o,function(t,o){n=n.add(c(e("<input>",{value:o,type:"text"}),{autotrim:!0}))}),n}if(e.isPlainObject(o)){var n=e([]);return e.each(o,function(o,s){var a=r(o,s);if(s.label!==t){var i=e("<label>",{class:"messagebox_content_label",css:x.boxSizing,text:s.label});a.appendTo(i),n=n.add(i)}else n=n.add(a)}),n}return e(o)}function r(t,o){var n=e.trim(o.type).toLowerCase();switch(n){case"select":var s=c(e("<select>"),{name:t,title:o.title,autotrim:!1}),a=e.isArray(o.options)?o.options.reduce(function(e,t){return e[t]=t,e},{}):o.options;a||(l('No options provided for "'+t+'"'),a={"":"&nbsp;"});var i=!1;return e.each(a,function(t,n){var a=e("<option>",{value:t,html:n}).appendTo(s);o.default==t&&(a.prop("selected",!0),i=!0)}),i||(e("<option>",{value:"",text:o.title}).prop({disabled:!0,selected:!0,hidden:!0}).prependTo(s),s.find("option").css("color",s.css("color")),s.addClass("messagebox_content_input_selectplaceholder").prop("selectedIndex",0).one("change",function(){s.find("option").css("color",""),s.removeClass("messagebox_content_input_selectplaceholder")})),s;case"text":case"password":default:return c(e("<input>",{type:"password"===n?"password":"text",maxlength:o.maxlength,placeholder:o.title,value:o.default}),{name:t,title:o.title,autotrim:o.autotrim})}}function c(e,t){return t.autotrim!==!1&&e.on("blur",p),e.addClass("messagebox_content_input").css(x.boxSizing).attr({name:t.name,title:t.title})}function u(o){var n=[],s=[];if(o.find(".messagebox_content_inputs").find("input, select").each(function(){var t=e(this);n.push(t.attr("name")),s.push(t.val())}),!s.length)return t;var a={},i=!1;return e.each(n,function(e,o){return o===t?(i=!0,!1):void(a[o]=s[e])}),i&&1===s.length?s[0]:i?s:a}function d(e,t){e.data("fRefreshMaxHeight")&&e.css("max-height",t-e.offset().top*_.maxHeightCoefficient)}function l(e){e="jQuery MessageBox Warning: "+e,window.console.warn?console.warn(e):window.console.log&&console.log(e)}function p(t){var o=e(t.currentTarget);o.val(e.trim(o.val()))}function f(n){var s=e(n.currentTarget),a=n.data.name,i=s.closest(".messagebox"),r=i.closest(".messagebox_overlay"),c=r.children(".messagebox_spacer").first(),d=i.children(".messagebox_content").first(),l=d.children(".messagebox_content_error").first(),p=i.data("instance"),f=u(i),g=s.hasClass("messagebox_button_done")?p.settings.filterDone:p.settings.filterFail;l.hide().empty();var b="function"!==e.type(g)?e.Deferred().resolve():e.when(g(f,a)).then(function(t){if(t===!1)return e.Deferred().reject();var o=e.type(t);return"error"===o?e.Deferred().reject(t.message):"string"===o||"object"===o||"array"===o?e.Deferred().reject(t):e.Deferred().resolve()});b.then(function(){c.animate({height:0,"margin-top":c.data("spacerTopMargin")},p.settings.speed,function(){r.remove(),s.hasClass("messagebox_button_done")?p.deferred.resolve(f,a):p.deferred.reject(f,a),v.length?h=v.pop():(h=t,o())})},function(t){var o=e.type(t);"string"!==o&&"object"!==o&&"array"!==o||l.css("max-width",d.width()).append(t).slideDown(_.errorSpeed,function(){d.scrollTop(d.height())})})}function g(t){if(h){var o=e(t.currentTarget).width(),n=e(t.currentTarget).height();e(document).find(".messagebox").each(function(){var t=e(this);t.css("min-width",t.outerWidth()>o?o:""),d(t,n)})}}function b(e){if(h){var t=h.keyCodes[e.which];t&&(t.closest(".messagebox").find(".messagebox_content_input").trigger("blur"),t.trigger("click"))}}var m={buttonDone:"OK",buttonFail:t,buttonsOrder:"done fail",customClass:"",filterDone:t,filterFail:t,input:!1,message:"",queue:!0,speed:200,top:"25%",width:"auto"},x={overlay:{"box-sizing":"border-box",display:"flex","flex-flow":"column nowrap","align-items":"center",position:"fixed",top:"0",left:"0",width:"100%",height:"100%"},spacer:{"box-sizing":"border-box",flex:"0 1 auto"},messagebox:{"box-sizing":"border-box",flex:"0 1 auto",display:"flex","flex-flow":"column nowrap"},content:{"box-sizing":"border-box",flex:"0 1 auto","overflow-y":"auto"},buttons:{"box-sizing":"border-box",flex:"0 0 auto"},boxSizing:{"box-sizing":"border-box"}},h=t,v=[],y=[],_={buttonDoneName:"buttonDone",buttonFailName:"buttonFail",errorSpeed:200,keyCodeDone:[13],keyCodeFail:[27],maxHeightCoefficient:1.5,topBuffer:100};e.MessageBoxSetup=function(t){e.extend(!0,m,t)},e.MessageBox=function(t){e.isPlainObject(t)||(t={message:t});var s=e.Deferred(),a=e.extend(!0,{},m,t);a.top=e.trim(a.top).toLowerCase(),e(document.activeElement).not(".messagebox_content_input").trigger("blur");var i={deferred:s,keyCodes:{},settings:a};return a.queue?(y.push(i),o()):(h&&v.push(h),n(i)),s.promise()},e(function(){e(window).on("resize",g).on("keydown",b)})}(jQuery);
/*jslint browser: true */
/*global jQuery:false */

window.Woo_Folder_Selection = (function (window, document, $, undefined) {
    'use strict';

    var app = {};

    app.init = function () {
       
        console.log(jsobject);
        var productId = $('form.cart').data('product_id');
        var is_multiple_selection = false;
        var minRequired = 0 ;
        getUpdate();

        $(document).on('change', '#pa_pack-type', function () {
            var choose = parseInt($(this).val());
            console.log(choose);
            if ($.isNumeric(choose) && choose >= jsobject.min_required) {
                minRequired = choose;
                setMultipleSelection();
                getUpdate();
            }else{
                if(is_multiple_selection){
                    deleteProduct();
                    window.location.reload();
                }
                clearMultipleSelection();
            }
        });


        function setMultipleSelection() {
            is_multiple_selection = true;
            $('.single_add_to_cart_button').attr('disabled', 'disabled');
            $('body').trigger('custom-folder-selection-init');
            console.log('is_multiple_selection', is_multiple_selection);
        }

        function clearMultipleSelection() {
            $(document).find('#variation_pa_color-picker .label label').text('Choose Your Color');
            is_multiple_selection = false;
            $(document).find('#variation_pa_color-picker ul').remove();
            $('.colorQty_quantity').val(1).trigger('change');
        }



        //check status

        function getUpdate() {
            jQuery.post({
                url: jsobject.ajaxurl,
                data: {
                    'action':'woo_folder_get_update',
                },
                success:function(response) {
                    console.log(response);
                    update_view(response.data);
                },
                error: function(errorThrown){
                    console.log(errorThrown);
                }

            });
        }

        //reset
        $(document).on('click', '.reset_variations', function () {
            deleteProduct();
        });


        function deleteProduct() {
            $('body').addClass('processing');
            jQuery.post({
                url: jsobject.ajaxurl,
                data: {
                    'action':'woo_folder_delete_product',
                    'id' : productId,
                },
                success:function(response) {
                    console.log(response);
                    update_view(response.data);
                    $('body').removeClass('processing');
                },
                error: function(errorThrown){
                    console.log(errorThrown);
                }

            });
        }
        $(document).on('click', '.variation_button', function () {
            if( is_multiple_selection ) {
                var title = $(this).attr('title');
                var slug = $(this).attr('id');
                var qty = false;

                $.MessageBox({
                    input    : true,
                    message  : 'Please input the quantity for '+ title,
                }).done(function(data){
                    if ($.trim(data)) {
                        qty = $.trim(data);
                        $('body').addClass('processing');
                        jQuery.post({
                            url: jsobject.ajaxurl,
                            data: {
                                'action':'woo_folder_save_product',
                                'id' : productId,
                                'title' : title,
                                'variation' : slug,
                                'qty' : qty,
                            },
                            success:function(response) {
                                console.log(response);
                                $('body').removeClass('processing');
                                update_view(response.data);
                            },
                            error: function(errorThrown){
                                console.log(errorThrown);
                            }

                        });

                    } else {
                        return false;
                    }
                });
                console.log(qty);

            }
        });




        //
        function update_view(json) {
            if(is_multiple_selection === false){
                clearMultipleSelection();
                return ;
            }

            var updated_total = 0;
            // var html = '';
            $('.variation_buttons').find('.multiple-qty').remove();

            for (var key in json) {
                if (json.hasOwnProperty(key)) {
                    if(parseInt(json[key].id) !== productId){
                        console.log(json[key].id, productId);
                        continue;
                    }

                    var item = $('.variation_buttons').find('#'+json[key].variation).eq(0);

                    item.prepend('<span class="multiple-qty">'+json[key].qty+'</span>');

                    updated_total = updated_total + parseInt(json[key].qty);
                    // html += '<li>'+json[key].title+' - '+json[key].qty+' Unit(s)</li>';
                }
            }


            if(updated_total < 1){
                return false;
            }
            // $('#variation_pa_color-picker').find('ul').remove();
            // $('#variation_pa_color-picker .label').after('<ul>'+ html+ '</ul>');

            $(document).find('#variation_pa_color-picker .label label').text('Choose Your Color ('+updated_total+')');




            if( updated_total >= minRequired){
                console.log(updated_total);
                console.log('block1');
                $('.colorQty_quantity').val(updated_total).trigger('change');
                $('.single_add_to_cart_button').removeAttr('disabled');
            }else{
                console.log('block2');
                $('.colorQty_quantity').val(minRequired).trigger('change');
                $('.single_add_to_cart_button').attr('disabled', 'disabled');
            }


        }

    };

    $(document).ready(app.init);
    return app;

})(window, document, jQuery);
