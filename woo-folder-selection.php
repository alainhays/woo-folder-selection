<?php
/**
 * Plugin Name: Woo Folder Selection
 * Plugin URI:  http://pluginever.com
 * Description: The best WordPress plugin ever made!
 * Version:     0.1.0
 * Author:      PluginEver
 * Author URI:  http://pluginever.com
 * Donate link: http://pluginever.com
 * License:     GPLv2+
 * Text Domain: woo-folder-selection
 * Domain Path: /languages
 */

/**
 * Copyright (c) 2017 PluginEver (email : support@pluginever.com)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2 or, at
 * your discretion, any later version, as published by the Free
 * Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

// don't call the file directly
if ( !defined( 'ABSPATH' ) ) exit;
/**
 * Main initiation class
 *
 * @since 1.0.0
 */
class Woo_Folder_Selection {

    /**
     * Add-on Version
     *
     * @since 1.0.0
     * @var  string
     */
	public $version = '1.0.0';

	/**
	 * Initializes the class
	 *
	 * Checks for an existing instance
	 * and if it does't find one, creates it.
	 *
	 * @since 1.0.0
	 *
	 * @return object Class instance
	 */
	public static function init() {
		static $instance = false;

		if ( ! $instance ) {
			$instance = new self();
		}

		return $instance;
	}

	/**
	 * Constructor for the class
	 *
	 * Sets up all the appropriate hooks and actions
	 *
	 * @since 1.0.0
	 *
	 */
	public function __construct() {
		// Localize our plugin
		add_action( 'init', [ $this, 'localization_setup' ] );
        add_action('woocommerce_loaded', [$this, 'init_plugin']);
	}

	/**
	 * Initialize plugin for localization
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function localization_setup() {
		$locale = apply_filters( 'plugin_locale', get_locale(), 'woo_folder_selection' );
		load_textdomain( 'woo-folder-selection', WP_LANG_DIR . '/woo-folder-selection/woo-folder-selection-' . $locale . '.mo' );
		load_plugin_textdomain( 'woo-folder-selection', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
	}

	public function init_plugin(){
        // Define constants
        $this->define_constants();

        // Include required files
        $this->includes();

        // Initialize the action hooks
        $this->init_actions();

        // instantiate classes
        $this->instantiate();
    }

	/**
	 * Define constants
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private function define_constants() {
		define( 'WFS_VERSION', $this->version );
		define( 'WFS_FILE', __FILE__ );
		define( 'WFS_PATH', dirname( WFS_FILE ) );
		define( 'WFS_INCLUDES', WFS_PATH . '/includes' );
		define( 'WFS_URL', plugins_url( '', WFS_FILE ) );
		define( 'WFS_ASSETS', WFS_URL . '/assets' );
		define( 'WFS_VIEWS', WFS_PATH . '/views' );
		define( 'WFS_TEMPLATES_DIR', WFS_PATH . '/templates' );
	}

	/**
	 * Include required files
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private function includes( ) {
		require WFS_INCLUDES .'/functions.php';
	}

	public function init_actions(){
	    add_action('wp_enqueue_scripts', [$this, 'load_assets']);
    }
	/**
	 * Instantiate classes
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private function instantiate() {

	}

	/**
	 * Add all the assets required by the plugin
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	function load_assets(){
	    if(! is_product() ) return ;
	    global $post;
        $product = new WC_Product($post->ID);
        $min_required_qty = get_post_meta($post->ID, '_woo_folder_multiple_min', true);
        if(empty($min_required_qty)){
            $min_required_qty = 100;
        }
		wp_register_style('woo-folder-selection', WFS_ASSETS.'/css/woo-folder-selection.css', [], date('i'));
		wp_register_script('woo-folder-selection', WFS_ASSETS.'/js/woo-folder-selection.js', ['jquery', 'underscore'], date('i'), true);
		wp_localize_script('woo-folder-selection', 'jsobject', ['ajaxurl' => admin_url( 'admin-ajax.php' ), 'min_required' => $min_required_qty, 'ID' => $post->ID, 'img' => plugins_url( 'woocommerce/assets/images/ajax-loader.gif' )]);
		wp_enqueue_style('woo-folder-selection');
		wp_enqueue_script('woo-folder-selection');
	}

	public static function log($message){
		if( WP_DEBUG !== true ) return;
		if (is_array($message) || is_object($message)) {
			$message = print_r($message, true);
		}
		$debug_file = WP_CONTENT_DIR . '/custom-debug.log';
		if (!file_exists($debug_file)) {
			@touch($debug_file);
		}
		return error_log(date("Y-m-d\tH:i:s") . "\t\t" . strip_tags($message) . "\n", 3, $debug_file);
	}

}

// init our class
$GLOBALS['Woo_Folder_Selection'] = new Woo_Folder_Selection();

/**
 * Grab the $Woo_Folder_Selection object and return it
 */
function woo_folder_selection() {
	global $Woo_Folder_Selection;
	return $Woo_Folder_Selection;
}
