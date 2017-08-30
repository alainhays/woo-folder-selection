<?php
// don't call the file directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
/**
 * Set a unique id for every customer
 */
add_action('init', 'woo_folder_set_customer_id');
function woo_folder_set_customer_id(){
    if(!isset($_COOKIE['woo_folder_customer_id']) || empty($_COOKIE['woo_folder_customer_id'])){
        setcookie('woo_folder_customer_id', strtolower(wp_generate_password(20, false)), time() + (86400 * 30), "/");
    }
}


//get the status
add_action( 'wp_ajax_woo_folder_get_update', 'woo_folder_get_update' );
add_action( 'wp_ajax_nopriv_woo_folder_get_update', 'woo_folder_get_update' );
function woo_folder_get_update(){

    woo_folder_get_cookie();
}

//add new selection
add_action( 'wp_ajax_woo_folder_save_product', 'woo_folder_save_product' );
add_action( 'wp_ajax_nopriv_woo_folder_save_product', 'woo_folder_save_product' );
function woo_folder_save_product() {

    $selections = woo_folder_get_cookie();
    $posted     = array_map( 'trim', $_POST );

    $product_id = $posted['id'];
    $variation  = $posted['variation'];
    $title      = $posted['title'];
    $qty        = $posted['qty'];

    if ( ! $product_id || ! $variation || ! $title ) {
        wp_send_json_success( $selections );
    }

    $hash = md5( $product_id . $variation );

    if ( isset( $selections[ $hash ] ) ) {
        unset( $selections[ $hash ] );
    }

    if ( $qty > 0 ) {
        $selections[ $hash ] = [
            'id'        => $product_id,
            'variation' => $variation,
            'title'     => $title,
            'qty'       => $qty,
        ];

    }
    woo_folder_set_cookie($selections);
    wp_send_json_success( $selections );
}

// delete any product
add_action( 'wp_ajax_woo_folder_delete_product', 'woo_folder_delete_product' );
add_action( 'wp_ajax_nopriv_woo_folder_delete_product', 'woo_folder_delete_product' );
function woo_folder_delete_product() {

    $selections = woo_folder_get_cookie();
    $posted     = array_map( 'trim', $_POST );

    $product_id = $posted['id'];

    if ( ! $selections ) {
        $selections = array();
    }

    foreach ( $selections as $key => $selection ) {
        if ( $selection['id'] == $product_id ) {
            unset( $selections[ $key ] );
        }
    }

    woo_folder_set_cookie($selections);
    wp_send_json_success( $selections );
}

//apply_filters( 'woocommerce_get_item_data', $item_data, $cart_item )
add_filter( 'woocommerce_get_item_data', 'add_folder_data', 99, 2 );
function add_folder_data( $item_data, $cart_item ) {
    $selections   = woo_folder_get_cookie();
    $selected_ids = wp_list_pluck( $selections, 'id' );
    $selected     = array_values( $selected_ids );
    if ( in_array( $cart_item['product_id'], $selected ) && isset( $cart_item['variation'] ) && isset( $cart_item['variation']['attribute_pa_pack-type'] ) && isset( $cart_item['variation']['attribute_pa_color-picker'] ) ) {

        $product_id = $cart_item['product_id'];
        $pack_type  = $cart_item['variation']['attribute_pa_pack-type'];
        $variation  = $cart_item['variation']['attribute_pa_color-picker'];
        $parts      = explode( '-', $pack_type, 2 );
        $att        = isset( $parts[0] ) ? (int) $parts[0] : 0;
        $min_number = get_post_meta($cart_item['product_id'], '_woo_folder_multiple_min', true);
        if(empty($min_number)){
            $min_number = 100;
        }
        if ( $att >= $min_number ) {

            foreach ($item_data as $key => $item_dat){
                if($item_dat['key'] == 'Choose Your Color'){
                    unset($item_data[$key]);
                }
            }

//            unset( $item_data );
            foreach ( $selections as $selection ) {
                if( (int) $selection['id'] !== $product_id) continue;
                $item_data[] = array(
                    'key'   => $selection['title'],
                    'value' => $selection['qty'] . ' Unit(s)',
                );
            }

        }

    }

    return $item_data;
}

add_action( 'woocommerce_new_order', 'woo_folder_wc_update_order_item_meta', 10, 1 );
function woo_folder_wc_update_order_item_meta( $order_id ) {
    $selections = woo_folder_get_cookie();
    if ( $selections ) {
        update_post_meta( $order_id, '__woo_folder', $selections );
        woo_folder_set_cookie(array());
    }
    $id = $_COOKIE['woo_folder_customer_id'];
    delete_transient('woo_folder_'.$id);

}


add_action( 'woocommerce_after_order_itemmeta', 'order_meta_customized_display', 10, 3 );

function order_meta_customized_display( $item_id, $item, $product ) {
    $order_id = $item['order_id'];
    $product_id = $item['product_id'];
    $variation_id = $item['variation_id'];
    $selections = get_post_meta( $order_id, '__woo_folder', true );
    if ( empty( $selections ) ) {
        return ;
    }

    $product = $item->get_product();
    $atrributes = $product->get_attributes();
    $pack_type = $atrributes['pa_pack-type'];
    $parts = explode( '-', $pack_type, 2 );
    $selected_pack_size = isset( $parts[0] ) ? (int) $parts[0] : 0;
    $min_number = get_post_meta( $product_id, '_woo_folder_multiple_min', true );
    if ( empty( $min_number ) ) {
        $min_number = 100;
    }

    if ( $selected_pack_size >= $min_number ) {


        foreach ( $selections as $selection ) {
            if ( (int) $selection['id'] !== $product_id ) {
                continue;
            }

            echo "<b>{$selection['title']}</b>:    {$selection['qty']} Unit(s) <br/>";
        }
    }

}


add_action( 'woocommerce_product_options_general_product_data', 'woo_folder_min_for_multiple' );
function woo_folder_min_for_multiple() {
    // Print a custom text field
    woocommerce_wp_text_input( array(
        'id' => '_woo_folder_multiple_min',
        'label' => 'Min quantity for multiple color selection',
        'description' => 'Input minimum quantity to enable multiple color selection',
        'desc_tip' => 'true',
        'placeholder' => '100'
    ) );
}



function woo_folder_set_cookie($value){
    $id = $_COOKIE['woo_folder_customer_id'];
    set_transient('woo_folder_'.$id, serialize($value), 5 * HOUR_IN_SECONDS);
}

function woo_folder_get_cookie(){
    $id = $_COOKIE['woo_folder_customer_id'];
    $saved = get_transient('woo_folder_'.$id);
    if($saved){
        return unserialize($saved);
    }

    return array();
}


//apply_filters( 'woocommerce_display_item_meta', $html, $item, $args )
add_filter('woocommerce_display_item_meta', 'add_color_on_thank_you_page', 10, 3);
function add_color_on_thank_you_page( $html, $item, $args){
    $order_id = $item['order_id'];
    $product_id = $item['product_id'];
    $variation_id = $item['variation_id'];
    $selections = get_post_meta( $order_id, '__woo_folder', true );
    if ( empty( $selections ) ) {
        return $html;
    }

    $product = $item->get_product();
    $atrributes = $product->get_attributes();
    $pack_type = $atrributes['pa_pack-type'];
    $parts = explode( '-', $pack_type, 2 );
    $selected_pack_size = isset( $parts[0] ) ? (int) $parts[0] : 0;
    $min_number = get_post_meta( $product_id, '_woo_folder_multiple_min', true );
    if ( empty( $min_number ) ) {
        $min_number = 100;
    }

    if ( $selected_pack_size >= $min_number ) {
        $re = '/<li><strong class="wc-item-meta-label">Choose Your Color:.+<\/li>/';
        $html = preg_replace($re, '', $html);
        foreach ( $selections as $selection ) {
            if ( (int) $selection['id'] !== $product_id ) {
                continue;
            }
            $html .= "<ul class='wc-item-meta'><li><b>{$selection['title']}</b>:    {$selection['qty']} Unit(s) </li></ul>";
        }
    }

    return $html;
}

add_action('wp_footer', 'wpp_folder_add_loader', 99);
function wpp_folder_add_loader(){
    echo '<div class="wp-folder-loader"></div>';
}

