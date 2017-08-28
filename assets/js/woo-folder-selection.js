/**
 * Woo Folder Selection - v0.1.0 - 2017-08-29
 * http://pluginever.com
 *
 * Copyright (c) 2017;
 * Licensed GPLv2+
 */
/*jslint browser: true */
/*global jQuery:false */

window.Woo_Folder_Selection = (function (window, document, $, undefined) {
    'use strict';

    var app = {};

    app.init = function () {
        console.log(jsobject);

        var productId = $('form.cart').data('product_id');
        var is_multiple_selection = false;

        console.log(productId);
        //listen selection change
        var dropDown = $('#pa_pack-type');

        dropDown.on('change', update_settings);


        function update_settings(){
            var choose = parseInt(dropDown.val());
            console.log(choose);
            if ($.isNumeric(choose) && choose >= 100) {
                is_multiple_selection = true;
                $('body').trigger('custom-folder-selection-init');
            }
        }


        $('body').on('custom-folder-selection-init', function () {
            if (!is_multiple_selection) {
                return false;
            }
            console.log('Multiple enabled');

        });
        $(document).on('click', '.variation_button', function (e) {
            e.preventDefault();
            console.log('clciked');
            console.log(is_multiple_selection);
            if (!is_multiple_selection) {
                return false;
            }
            var title = $(this).attr('title');
            var qty = parseInt(prompt('Please input the quantity for '+ title));
            jQuery.post({
                url: jsobject.ajaxurl,
                data: {
                    'action':'woo_folder_save_product',
                    'product_id' : productId,
                    'name' : title,
                    'qty' : qty,
                },
                success:function(response) {
                    console.log(response);
                    update_view(response.data);
                },
                error: function(errorThrown){
                    console.log(errorThrown);
                }

            });

            return false;
        });

        function update_view(json) {
            for (var i = 0; i < json.length; i++) {
                $('.variation_buttons a').each(function () {
                    if($(this).attr('title') === json[i].variation ){
                        $(this).css('border', '1px solid red');
                    }
                });
            }
        }

        //         $('.colorQty_quantity').on('change',function () {
        //             var quantity = parseInt($(this).val());
        //             console.log('new total set');
        //             window.productData = {
        //                 "total" : quantity
        //             };
        //         });

        // function setCookie(productId, Vname, qty) {
            // var saved = Cookies.get('wooFolderSelection');
            //
            // if (saved === undefined) {
            //     var data = [];
            //     data.push({
            //         ID: productId,
            //         variation: Vname,
            //         qty: qty
            //     });
            //     saved = data;
            // } else {
            //     saved = JSON.parse(saved);
                // saved.push({
                //     ID : productId,
                //     variation:Vname,
                //     qty: qty
                // });

                // var key = isAlreadyAdded(saved, productId, Vname);

                // if(key){
                //     saved.key = {
                //             ID : productId,
                //             variation:Vname,
                //             qty: 7
                //     };
                // }




            // }


            // console.log(saved);
            // var key = _.findKey(saved, function(value, key) {
            //     if (productId === value.ID){
            //         return key;
            //     }
            // });
            // console.log(key);

            // Cookies.set('wooFolderSelection', saved);


        // }

        // function isAlreadyAdded(json, productId, variationName) {
        //
        //     var key = _.findKey(json, function (value, key) {
        //         if (productId === value.ID && variationName === value.variation) {
        //             return key;
        //         }
        //     });
        //
        //     return key;
        // }

        // window.selections = jsobject.selections;
        // var valid= false;
        //
        // //listen selection change
        // var dropDown = $('#pa_pack-type');
        // dropDown.on('change', function () {
        //     var choose = parseInt(dropDown.val());
        //     console.log(choose);
        //     if($.isNumeric(choose) && choose >= 100){
        //         valid = true;
        //         $('body').trigger('custom-folder-selection-init');
        //         console.log('valid');
        //     }else{
        //         if(valid){
        //             console.log('Invalid');
        //             window.location.reload();
        //         }
        //     }
        // });
        //
        // $('body').on('custom-folder-selection-init',function () {
        //     if(valid){
        //         // $('.variation_buttons a').unbind();
        //         console.log('Unbind');
        //         $('.colorQty_quantity').on('change',function () {
        //             var quantity = parseInt($(this).val());
        //             console.log('new total set');
        //             window.productData = {
        //                 "total" : quantity
        //             };
        //         });
        //
        //         // $('body').trigger('custom-folder-selection-init');
        //
        //         $('.variation_buttons a').on('click', function () {
        //             // if(!valid){
        //             //     return true;
        //             // }
        //
        //
        //             var title = $(this).attr('title');
        //             // var id = $(this).attr('id');
        //             var qty = parseInt(prompt('Please input the quantity for '+ title));
        //             // window.selection.id = 0;
        //             if(qty < 1 || isNaN(qty)){
        //                 alert('Please input a valid number');
        //                 return false;
        //             }
        //             window.selections[title] = qty;
        //
        //             console.log(window.selections);
        //
        //             return false;
        //             // window.selection.id = qty ;
        //         });
        //
        //
        //         console.log(window.productData);
        //
        //     }
        // });
        //
        //
        //


    };

    $(document).ready(app.init);

    return app;

})(window, document, jQuery);

/*!
 * JavaScript Cookie v2.1.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
