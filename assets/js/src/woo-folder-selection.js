/**
 * Woo Folder Selection
 * http://pluginever.com
 *
 * Copyright (c) 2017 PluginEver
 * Licensed under the GPLv2+ license.
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
                console.log(json[i]);
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
