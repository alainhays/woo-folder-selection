/**
 * Woo Folder Selection - v0.1.0 - 2017-08-28
 * http://pluginever.com
 *
 * Copyright (c) 2017;
 * Licensed GPLv2+
 */
/*jslint browser: true */
/*global jQuery:false */

window.Woo_Folder_Selection = (function(window, document, $, undefined){
	'use strict';

	var app = {};

	app.init = function() {
	    console.log(jsobject);
        window.selections = jsobject.selections;
        var valid= false;

        //listen selection change
        var dropDown = $('#pa_pack-type');
        dropDown.on('change', function () {
            var choose = parseInt(dropDown.val());
            console.log(choose);
            if($.isNumeric(choose) && choose >= 100){
                valid = true;
                $('body').trigger('custom-folder-selection-init');
            }else{
                if(valid){
                    window.location.reload();
                }
            }
        });

        $('body').on('custom-folder-selection-init',function () {
            if(valid){
                $('.variation_buttons a').unbind();
                $('.colorQty_quantity').on('change',function () {
                    var quantity = parseInt($(this).val());
                    console.log('new total set');
                    window.productData = {
                        "total" : quantity
                    };
                });

                $('body').trigger('custom-folder-selection-init');
            }

            console.log(window.productData);
        });



        // $('.variation_buttons a').on('click', function () {
        //     var title = $(this).attr('title');
        //     // var id = $(this).attr('id');
        //     var qty = parseInt(prompt('Please input the quantity for '+ title));
        //     // window.selection.id = 0;
        //     if(qty < 1 || isNaN(qty)){
        //         alert('Please input a valid number');
        //         return false;
        //     }
        //     window.selections[title] = qty;
        //
        //     console.log(window.selections);
        //
        //     return false;
        //     // window.selection.id = qty ;
        // });





	};

	$(document).ready( app.init );

	return app;

})(window, document, jQuery);
