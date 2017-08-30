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
