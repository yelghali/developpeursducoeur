/*
 * Joiee v1.0 - Template JS
 *
 * This file is part of Joiee, a HTML template build for sale at ThemeForest.
 * For questions, suggestions or support request, please mail me at maimairel@yahoo.com
 *
 * Development Started:
 * December 10, 2012
 *
 */

;(function( $, window, document, undefined ) {

	"use strict";

	$( window ).load(function() {
		/* Only Load the Plugins below after page fully loaded to speed up page loading */


		/*	--------------------------------------------------------------------
		Google Maps
		------------------------------------------------------------------------ */
		if( $.fn.gmap3 ) {
			(function() {
				var wf = document.createElement('script');
				wf.src = 'http://maps.google.com/maps/api/js?v=3&sensor=false&language=en&callback=load_gmap';
				wf.type = 'text/javascript';
				wf.async = 'true';
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(wf, s);			
			})();

			window.load_gmap = function() {
				$( '.google-maps' ).each(function() {
					$( this ).gmap3({
						map: {
							options: {
								zoom: $( this ).data( 'zoom' ), 
								center: [ $( this ).data( 'center-lat' ), $( this ).data( 'center-lng' ) ], 
								scrollwheel: false, 
								mapTypeControl: false, 
								streetViewControl: false
							}
						}, 
						marker: {
							latLng:[ $( this ).data( 'marker-lat' ), $( this ).data( 'marker-lng' ) ]
						}
					});
				});
			};
		}


		/*	--------------------------------------------------------------------
		Twitter Widget
		------------------------------------------------------------------------ */
		if( $.fn.tweet ) {
			$( '.tweet-stream' ).each(function() {
				$( this ).tweet({
					username: $( this ).data( 'twitter-username' ), 
					template: '{text}{time}', 
					count: 3
				});
			});
		}


		/*	--------------------------------------------------------------------
		Flickr Widget
		------------------------------------------------------------------------ */
		if( $.fn.jflickrfeed ) {
			$( '.flickr-stream' ).each(function() {
				var flickrId = $( this ).data( 'flickr-id' );
				var limit = $( this ).data( 'limit' )? $( this ).data( 'limit' ) : 12;
				$( '<ul class="clearfix"></ul>' )
					.prependTo( this ).jflickrfeed({
						qstrings: {
							id: flickrId
						}, 
						limit: limit, 
						itemTemplate: '<li><a href="{{link}}" title="{{title}}" target="_blank"><img src="{{image_s}}" alt="{{title}}" /></a></li>'
					});
			});
		}

	});
	

	$(document).ready(function() {

		/*	--------------------------------------------------------------------
		Animated Navigation Menu
		------------------------------------------------------------------------ */
		$( '#main-nav ul' ).on( 'mouseenter', ' > li', function(e) {
			$( this ).children('ul').hide().stop( true, true ).slideDown( { easing: 'easeOutExpo', duration: 'fast' } );
			e.stopPropagation();
		}).on( 'mouseleave', ' > li', function(e) {
			$( this ).children('ul').stop( true, true ).slideUp( { easing: 'easeOutExpo', duration: 'fast' } );
		});


		/*	--------------------------------------------------------------------
		TinyNav for Responsive Navigation
		------------------------------------------------------------------------ */
		if( $.fn.tinyNav ) {
			$( '#main-nav > ul' ).tinyNav({
				active: 'active', 
				header: '-- Menu --'
			});
		}


		/*	--------------------------------------------------------------------
		Accordion
		------------------------------------------------------------------------ */
		if( $.fn.accordion ) {
			$( '.accordion' ).accordion();
		}


		/*	--------------------------------------------------------------------
		Isotope For Filterable Portfolio
		------------------------------------------------------------------------ */
		if( $.fn.isotope && $.fn.imagesLoaded ) {

			var $container = $( '.portfolio-items.filterable' );
			var $filter = $( '.portfolio-filter' );

			$container.imagesLoaded(function() {
				$container.isotope({
					resizable: false, // disable normal resizing
					masonry: { columnWidth: $container.width() / 12 }
				});

				$(window).on( 'smartresize', function(){
					$container.isotope({
						// update columnWidth to a percentage of container width
						masonry: { columnWidth: $container.width() / 12 }
					});
				});

				$filter.on( 'click', 'a', function( e ) {
					$container.isotope({ filter: $( this ).data( 'filter' ) });

					$( this ).parent( 'li' )
						.addClass( 'active' )
						.siblings( 'li' ).removeClass( 'active' );

					e.preventDefault();
				});
			});
		}


		/*	--------------------------------------------------------------------
		Carousel
		------------------------------------------------------------------------ */
		if( $.fn.carouFredSel && $.fn.imagesLoaded ) {

			$( '.portfolio-carousel' ).each(function() {
				$( this ).imagesLoaded(function() {
					$( this ).find('.portfolio-items' ).carouFredSel({
						items: {
							height: 'auto', 
							visible: {
								min: 1, 
								max: 3
							}
						}, 
						responsive: true, 
						auto: {
							play: false
						}, 
						scroll: {
							items: 1, 
							easing: 'easeInOutExpo'
						}, 
						swipe: {
							onTouch: true
						}, 
						next: {
							button: $( this ).find( '.carousel-nav .carousel-next' )
						}, 
						prev: {
							button: $( this ).find( '.carousel-nav .carousel-prev' )
						}
					});
				});
			});

		}


		/*	--------------------------------------------------------------------
		FitVids for Fluid Videos
		------------------------------------------------------------------------ */
		if( $.fn.fitVids ) {
			$('.media.video').fitVids();
		}


		/*	--------------------------------------------------------------------
		Tooltips
		------------------------------------------------------------------------ */
		if( $.fn.tooltip ) {
			$('[rel="tooltip"]').tooltip();
		}


	    /*	--------------------------------------------------------------------
		Form Validation and Ajax Submit
		------------------------------------------------------------------------ */
		if( $.fn.validate && $.fn.ajaxSubmit ) {

			$( '#contact-form' ).validate({
				submitHandler: function( form ) {
					$( '#ajax-loader', form ).show();
					$( form ).ajaxSubmit(function( response ) {
						response = $.parseJSON( response );
						$( '#contact-message', form )
							.toggleClass( 'alert-error', !response.success )
							.toggleClass( 'alert-success', response.success )
							.html( response.message ).slideDown();

						$( form ).resetForm();
						$( '#ajax-loader', form ).hide();
					});
				}
			});
		}
		

		/*	--------------------------------------------------------------------
		FlexSlider
		------------------------------------------------------------------------ */
		if( $.fn.flexslider ) {

			$('.slider-wrap .flexslider').imagesLoaded(function() {
				$( this ).flexslider({
					animation: 'slide', 
					slideshowSpeed: 4000, 
					directionNav: false
				});
			});

			$( '.portfolio .flexslider' ).imagesLoaded(function() {
				$( this ).flexslider({
					controlNav: false
				});
			});
		}


		/*	--------------------------------------------------------------------
		Nivo Slider
		------------------------------------------------------------------------ */
		if( $.fn.nivoSlider ) {

			$( '.slider-wrap .nivoslider' ).imagesLoaded(function() {
				$( this ).show().nivoSlider({
					directionNav: false
				});
			});
		}


		/*	--------------------------------------------------------------------
		Revolution Slider
		------------------------------------------------------------------------ */
		if( $.fn.revolution ) {

			$( '.fullwidthbanner' ).revolution({
				delay: 6000, 
				startheight: 550, 
				fullWidth: 'on', 
				shadow: 0, 
				navigationArrows: 'verticalcentered', 
				navigationStyle: 'none'
			});

		}


		/*	--------------------------------------------------------------------
		Sharrre
		------------------------------------------------------------------------ */
		if( $.fn.sharrre ) {
			$('.post .share .twitter').sharrre({
				share: {
					twitter: true
				},
				enableHover: false,
				enableTracking: true,
				click: function(api, options) {
					api.simulateClick();
					api.openPopup('twitter');
				}
			});
			$('.post .share .facebook').sharrre({
				share: {
					facebook: true
				}, 
				enableHover: false,
				enableTracking: true,
				click: function(api, options){
					api.simulateClick();
					api.openPopup('facebook');
				}
			});
			$('.post .share .googleplus').sharrre({
				share: {
					googlePlus: true
				}, 
				urlCurl: 'php/sharrre.php', 
				enableHover: false,
				enableTracking: true,
				click: function(api, options){
					api.simulateClick();
					api.openPopup('googlePlus');
				}
			});
		}
	});	
	
}) (jQuery, window, document);