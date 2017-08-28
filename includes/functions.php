<?php
// don't call the file directly
if ( !defined( 'ABSPATH' ) ) exit;
add_action('wp_ajax_woo_folder_save_product', 'woo_folder_save_product');
add_action('wp_ajax_nopriv_woo_folder_save_product', 'woo_folder_save_product');

function woo_folder_save_product(){
    error_log(print_r($_POST, true));

    $selections = WC()->session->get( 'woo_folder');
    $posted = array_map('trim', $_POST);
    if($posted['qty'] < 1 ){
        wp_send_json_success($selections);
    }

    if(!$selections){
        error_log('new');
        $product = [
            'id' =>$posted['product_id'],
            'variation' =>$posted['name'],
            'qty' =>$posted['qty'],
        ];
        $selections[] = $product;

    }else{

        foreach ($selections as $key => $selection){
            error_log(print_r($selection, true));
            if(($selection['id'] == $posted['id']) && ($selection['variation'] == $posted['name'])){
                unset($selections[$key]);
                error_log('matched');
            }
        }


        $product = [
            'id' =>$posted['product_id'],
            'variation' =>$posted['name'],
            'qty' =>$posted['qty'],
        ];

        $selections[] = $product;

    }

    error_log(print_r( $selections, true));

    WC()->session->set( 'woo_folder', $selections );
    wp_send_json_success($selections);
}
