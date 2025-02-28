/* global jQuery:false, elementorFrontend:false */

// Attention! This action must be executed before the document.ready
// to add properties to the elementorFrontend object before it used first time!
(function(){
	"use strict";
	// Add page settings to the elementorFrontend object
	// in the frontend for non-Elementor pages (blog pages, categories, tags, etc.)
	// Run this code after the all other init code via setTimeout(0)
	setTimeout(function(){
		if (typeof elementorFrontend !== 'undefined'
			&& !elementorFrontend.isEditMode()
			&& typeof elementorFrontend.config !== 'undefined'
			&& typeof elementorFrontend.config.settings !== 'undefined'
			&& typeof elementorFrontend.config.settings.general === 'undefined'
		) {
			elementorFrontend.config.settings.general = {
				'elementor_stretched_section_container': TRX_ADDONS_STORAGE['elementor_stretched_section_container']
			};
		}
	}, 0);
})();

jQuery(document).ready(function() {
	"use strict";

	var trx_addons_once_resize = false;

	// Init hooks after the 1ms, because elementorFrontend.hooks isn't available on 'ready' event
	setTimeout(function(){
	// Make sure you run this code under Elementor - not work with last Elementor
	//jQuery( window ).on( 'elementor/frontend/init', function() {
		if (typeof window.elementorFrontend !== 'undefined' && typeof window.elementorFrontend.hooks !== 'undefined') {

			// If Elementor is in the Editor's Preview mode
			if (elementorFrontend.isEditMode()) {
				// Init elements after creation
				elementorFrontend.hooks.addAction( 'frontend/element_ready/global', function( $cont ) {

					// Add 'sc_layouts_item'
					var body = $cont.parents('body');
					if (body.hasClass('cpt_layouts-template') || body.hasClass('cpt_layouts-template-default') || body.hasClass('single-cpt_layouts')) {
						body.find('.elementor-element.elementor-widget').addClass('sc_layouts_item');
					}
					
					// Remove TOC if exists (rebuild on init_hidden_elements)
					jQuery('#toc_menu').remove();

					// Init hidden elements (widgets, shortcodes) when its added to the preview area
					jQuery(document).trigger('action.init_hidden_elements', [$cont]);

					// Trigger 'resize' actions after the element is added (inited)
					if ($cont.parents('.elementor-section-stretched').length > 0 && !trx_addons_once_resize) {
						trx_addons_once_resize = true;
						jQuery(document).trigger('action.resize_trx_addons', [$cont.parents('.elementor-section-stretched')]);
					} else {
						jQuery(document).trigger('action.resize_trx_addons', [$cont]);
					}

				} );

				// First init - add wrap 'sc_layouts_item'
				var body = jQuery('body');
				if (body.hasClass('cpt_layouts-template') || body.hasClass('cpt_layouts-template-default') || body.hasClass('single-cpt_layouts'))
					jQuery('.elementor-element.elementor-widget').addClass('sc_layouts_item');

				// First init - refresh theme-specific shapes
				jQuery('.elementor-shape').each(function() {
					var shape = jQuery(this).data('shape');
					if (shape!==undefined && shape.indexOf('trx_addons_')==0)
						trx_addons_load_shape(jQuery(this), shape);
				});

				// Load theme-specific shape to the container
				function trx_addons_load_shape(cont, shape) {
					if (cont.length > 0 && shape !== '') {
						cont.empty().attr( 'data-shape', shape );
						shape = TRX_ADDONS_STORAGE['shapes_url'] + shape.replace('trx_addons_', '') + '.svg';
						jQuery.get( shape, function( data ) {
							cont.append(data.childNodes[0]).attr('data-negative', 'false');
						} );
					}
				}

				// Shift elements down under fixed rows
				elementorFrontend.hooks.addFilter( 'frontend/handlers/menu_anchor/scroll_top_distance', function( scrollTop ) {
					return scrollTop - trx_addons_fixed_rows_height();
				} );

			// If Elementor is in Frontend
			} else {
				trx_addons_once_resize = true;
				jQuery(document).trigger('action.resize_trx_addons');
			}

		}
	// Init hooks after the 1ms, because elementorFrontend.hooks isn't available on 'ready' event
	}, typeof elementorFrontend === 'undefined' || typeof elementorFrontend.hooks === 'undefined' ? 1 : 0);
	//});

});