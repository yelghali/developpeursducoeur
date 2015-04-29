/*
 * Joiee v1.0 - Customizer JS
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

	function clamp( val ) {
		return Math.min(1, Math.max(0, val));
	}

	function rgbToHSL(r, g, b){
		r = r / 255; g = g / 255; b = b / 255;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2, d = max - min;

        if (max === min) {
            h = s = 0;
        } else {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2;               break;
                case b: h = (r - g) / d + 4;               break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, l: l };
	}

	function hslToRGB(h, s, l) {
        h = (h % 360) / 360;
        var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var m1 = l * 2 - m2;

		return {
			r: hue(h + 1/3) * 255, 
			g: hue(h) * 255, 
			b: hue(h - 1/3) * 255
		};

        function hue(h) {
			h = h < 0 ? h + 1 : (h > 1 ? h - 1 : h);
			if(h * 6 < 1) {
				return m1 + (m2 - m1) * h * 6;
			} else if(h * 2 < 1) {
				return m2;
			} else if(h * 3 < 2) {
				return m1 + (m2 - m1) * (2/3 - h) * 6;
			}

			return m1;
        }
    }

	function hexToRgb(color) {
		var num = parseInt(color.charAt(0)==='#'?color.substring(1) : color, 16);
		return { r: num >> 16, g: num >> 8 & 255, b: num & 255 };
	}

	function rgbToHex(r, g, b) {
		return ((b | g << 8 | r << 16) | 1 << 24).toString(16).slice(1);
	}

	function darken(hex, percent) {
		var rgb = hexToRgb(hex);
		var hsl = rgbToHSL(rgb.r, rgb.g, rgb.b);
		hsl.l = clamp( hsl.l - parseFloat(percent / 100.0) );

		rgb = hslToRGB(hsl.h, hsl.s, hsl.l);

		return '#' + rgbToHex(rgb.r, rgb.g, rgb.b).toLowerCase();
	}

	var JoieeCustomizer = function( element, presets, targets ) {
		return this.init( element, presets, targets );
	};

	JoieeCustomizer.prototype = {
		init: function( element, presets, targets ) {
			this.element = $( element );
			this.presets = presets;
			this.targets = targets;

			this._attachPresets();
			this._createColorPicker();

			this.modal = this._attachModal();

			this.element.append( $( '<a href="#joiee-customizer-modal" class="btn btn-mini btn-block btn-inverse" data-toggle="modal">Get CSS</a>' ) );

			this.element.addClass( 'active' );

			if( presets.length ) {
				this._generateCSS( presets[0] );
			}
		}, 

		_attachModal: function() {
			var modal = $( '<div id="joiee-customizer-modal" class="modal hide fade"><div class="modal-body"><textarea readonly rows="" cols="" style="width: 100%; height: 400px;"></textarea></div><div class="modal-footer"><a href="#" data-dismiss="modal" class="btn btn-primary">Close</a></div></div>' );
			return modal.appendTo( this.element );
		}, 

		_attachPresets: function() {
			var ul = $( '<ul class="color-list clearfix"></ul>' ), 
				li = $( '<li></li>' ), 
				that = this;

			$.each( this.presets, function( k, color ) {
				var span = $( '<span data-color="' + color + '" class="color-pick" style="background-color: ' + color + '"></span>' );
				li.clone().append( span ).appendTo( ul );
			});

			ul.on( 'click', '.color-pick', function( e ) {
				var color = $( this ).data( 'color' );
				that._activateColor( color, true );
				e.preventDefault();
			});

			this.element.append( ul );
		}, 

		_createColorPicker: function() {
			var colorPicker = $( '<input type="text">' ), that = this;
			this.element.append( colorPicker );
			if( $.fn.minicolors ) {
				this.colorPicker = colorPicker.minicolors({
					textfield: false, 
					theme: 'joiee', 
					change: function( hex, opacity ) {
						that._activateColor( hex, false );
					}
				});
			}

		}, 

		_activateColor: function( color, setPicker ) {
			this._attachCSS( this._generateCSS( color ) );
			if( setPicker && $.fn.minicolors && this.colorPicker ) {
				this.colorPicker.minicolors( 'value', color );
			}
		}, 

		_filter: function( color, filterCallback ) {
			return typeof filterCallback === 'undefined'? color : filterCallback.apply( this, [ color ] );
		}, 

		_attachCSS: function( css ) {
			var cssContainer = $( '#joiee-custom-css' ).length? $( '#joiee-custom-css' ) : $( '<div id="joiee-custom-css"></div>' ).appendTo( 'body' );
			cssContainer.html( $( '<style>' + css + '</style>') );
		}, 

		_generateCSS: function( color ) {
			var css = '/* Save and include the following CSS styles on your page. */\n\n', that = this;
			$.map( this.targets, function( data, selector ) {
				var attributes = typeof data.attributes !== 'undefined'? data.attributes.toString().split(',') : [];
				var styles = $.map(attributes, function( s ) { return '\t' + $.trim( s ) + ': ' + that._filter( color, data.filter ) + ';'; }).join('\n');
				css += $.map((selector).toString().split(','), function( s ) { return $.trim( s ); }).join(', \n') + ' {\n' + styles + '\n}\n\n';
			});

			this.modal.find( 'textarea' ).val( $.trim( css ) );

			return css;
		}
	};

	$.fn.joieeCustomizer = function( presets, targets ) {
		return this.each(function() {
			new JoieeCustomizer( this, presets, targets );
		});
	};

	$( document ).ready( function() {
		$( '#joiee-customizer' ).joieeCustomizer([ '#8ecd44', '#77a6ee', '#f78234', '#d84d5a', '#4dd0d8', '#d34c92' ], {
			'a': {
				attributes: 'color'
			}, 
			'a:hover': {
				attributes: 'color', 
				filter: function( color ) {
					return darken( color, 15 );
				}
			}, 
			'#main-nav ul li.active': {
				attributes: 'border-top-color'
			}, 
			'#main-nav ul li.active:before': {
				attributes: 'border-top-color'
			}, 
			'#main-nav ul ul li a:hover': {
				attributes: 'background-color'
			}, 
			'.blog .post .side .post-type': {
				attributes: 'background-color'
			}, 
			'.blog .post .content .meta li a:hover': {
				attributes: 'color'
			}, 
			'.blog .post .wrap .read-more a': {
				attributes: 'background-color'
			}, 
			'.portfolio-filter ul li.active a, .portfolio-filter ul li:hover a': {
				attributes: 'background-color'
			}, 
			'.portfolio-filter ul li.active a:after': {
				attributes: 'border-top-color'
			}, 
			'.portfolio-items .item .image .overlay .actions li a:hover': {
				attributes: 'color'
			}, 
			'.portfolio-row .read-more a': {
				attributes: 'background-color'
			}, 
			'.portfolio .portfolio-meta span:before': {
				attributes: 'background-color'
			}, 
			'.highlight': {
				attributes: 'color'
			}, 
			'.underline': {
				attributes: 'border-bottom-color'
			}, 
			'.underline-heading h1, .underline-heading h2, .underline-heading h3, .underline-heading h4, .underline-heading h5, .underline-heading h6': {
				attributes: 'border-bottom-color'
			}, 
			'.check-list li:before': {
				attributes: 'color'
			}, 
			'.arrow-list li:before': {
				attributes: 'border-left-color'
			}, 
			'.skill .circles span.filled': {
				attributes: 'background-color'
			}, 
			'.our-team .photo .info': {
				attributes: 'border-left-color'
			}, 
			'.our-team .social ul': {
				attributes: 'border-top-color'
			}, 
			'.service .read-more a': {
				attributes: 'background-color'
			}, 
			'.highlights.bold .highlight-item:hover .icon': {
				attributes: 'background-color'
			}, 
			'.callout .link': {
				attributes: 'background-color'
			}, 
			'.callout .link:before': {
				attributes: 'border-right-color'
			}, 
			'.portfolio-carousel .carousel-nav li a': {
				attributes: 'background-color'
			}, 
			'.latest-blog .overlay .post-type': {
				attributes: 'background-color'
			}, 
			'.accordion .accordion-header': {
				attributes: 'border-left-color'
			}, 
			'.nav-list > .active > a, .nav-list > .active > a:hover, .nav-list > .active > a:focus': {
				attributes: 'background-color'
			}, 
			'.nav-pills > .active > a, .nav-pills > .active > a:hover, .nav-pills > .active > a:focus': {
				attributes: 'background-color'
			}, 
			'.nav .dropdown-toggle .caret': {
				attributes: 'border-top-color, border-bottom-color'
			}
		});
	});

}) (jQuery, window, document);

/*
 * jQuery MiniColors: A tiny color picker built on jQuery
 *
 * Copyright Cory LaViska for A Beautiful Site, LLC. (http://www.abeautifulsite.net/)
 *
 * Dual-licensed under the MIT and GPL Version 2 licenses
 *
*/
jQuery&&function(d){function B(a){var b=a.parent();a.removeData("minicolors-initialized").removeData("minicolors-settings").removeProp("size").removeProp("maxlength").removeClass("minicolors-input");b.before(a).remove()}function z(a){var b=a.parent(),h=b.find(".minicolors-panel"),c=a.data("minicolors-settings");a.data("minicolors-initialized")&&(!a.prop("disabled")&&!b.hasClass("minicolors-inline")&&!b.hasClass("minicolors-focus"))&&(t(),b.addClass("minicolors-focus"),h.stop(!0,!0).fadeIn(c.showSpeed,
function(){c.show&&c.show.call(a)}))}function t(){d(".minicolors-input").each(function(){var a=d(this),b=a.data("minicolors-settings"),h=a.parent();b.inline||h.find(".minicolors-panel").fadeOut(b.hideSpeed,function(){h.hasClass("minicolors-focus")&&b.hide&&b.hide.call(a);h.removeClass("minicolors-focus")})})}function C(a,b,h){var c=a.parents(".minicolors").find(".minicolors-input"),d=c.data("minicolors-settings"),e=a.find("[class$=-picker]"),f=a.offset().left,l=a.offset().top,g=Math.round(b.pageX-
f),k=Math.round(b.pageY-l);h=h?d.animationSpeed:0;b.originalEvent.changedTouches&&(g=b.originalEvent.changedTouches[0].pageX-f,k=b.originalEvent.changedTouches[0].pageY-l);0>g&&(g=0);0>k&&(k=0);g>a.width()&&(g=a.width());k>a.height()&&(k=a.height());a.parent().is(".minicolors-slider-wheel")&&e.parent().is(".minicolors-grid")&&(f=75-g,l=75-k,b=Math.sqrt(f*f+l*l),f=Math.atan2(l,f),0>f&&(f+=2*Math.PI),75<b&&(b=75,g=75-75*Math.cos(f),k=75-75*Math.sin(f)),g=Math.round(g),k=Math.round(k));a.is(".minicolors-grid")?
e.stop(!0).animate({top:k+"px",left:g+"px"},h,d.animationEasing,function(){D(c,a)}):e.stop(!0).animate({top:k+"px"},h,d.animationEasing,function(){D(c,a)})}function D(a,b){function d(a,b){var c,e;if(!a.length||!b)return null;c=a.offset().left;e=a.offset().top;return{x:c-b.offset().left+a.outerWidth()/2,y:e-b.offset().top+a.outerHeight()/2}}var c,j,e,f,l,g;f=a.val();var k=a.attr("data-opacity");l=a.parent();var w=a.data("minicolors-settings");l.find(".minicolors-panel");var t=l.find(".minicolors-swatch");
g=l.find(".minicolors-grid");var s=l.find(".minicolors-slider"),v=l.find(".minicolors-opacity-slider");e=g.find("[class$=-picker]");var p=s.find("[class$=-picker]"),n=v.find("[class$=-picker]");e=d(e,g);p=d(p,s);n=d(n,v);if(b.is(".minicolors-grid, .minicolors-slider")){switch(w.control){case "wheel":f=g.width()/2-e.x;l=g.height()/2-e.y;g=Math.sqrt(f*f+l*l);f=Math.atan2(l,f);0>f&&(f+=2*Math.PI);75<g&&(g=75,e.x=69-75*Math.cos(f),e.y=69-75*Math.sin(f));j=m(g/0.75,0,100);c=m(180*f/Math.PI,0,360);e=m(100-
Math.floor(p.y*(100/s.height())),0,100);f=u({h:c,s:j,b:e});s.css("backgroundColor",u({h:c,s:j,b:100}));break;case "saturation":c=m(parseInt(e.x*(360/g.width())),0,360);j=m(100-Math.floor(p.y*(100/s.height())),0,100);e=m(100-Math.floor(e.y*(100/g.height())),0,100);f=u({h:c,s:j,b:e});s.css("backgroundColor",u({h:c,s:100,b:e}));l.find(".minicolors-grid-inner").css("opacity",j/100);break;case "brightness":c=m(parseInt(e.x*(360/g.width())),0,360);j=m(100-Math.floor(e.y*(100/g.height())),0,100);e=m(100-
Math.floor(p.y*(100/s.height())),0,100);f=u({h:c,s:j,b:e});s.css("backgroundColor",u({h:c,s:j,b:100}));l.find(".minicolors-grid-inner").css("opacity",1-e/100);break;default:c=m(360-parseInt(p.y*(360/s.height())),0,360),j=m(Math.floor(e.x*(100/g.width())),0,100),e=m(100-Math.floor(e.y*(100/g.height())),0,100),f=u({h:c,s:j,b:e}),g.css("backgroundColor",u({h:c,s:100,b:100}))}a.val(y(f,w.letterCase))}b.is(".minicolors-opacity-slider")&&(k=w.opacity?parseFloat(1-n.y/v.height()).toFixed(2):1,w.opacity&&
a.attr("data-opacity",k));t.find("SPAN").css({backgroundColor:f,opacity:k});E(a,f,k)}function x(a,b,d){var c,j,e,f,l;f=a.parent();e=a.data("minicolors-settings");l=f.find(".minicolors-swatch");var g=f.find(".minicolors-grid"),k=f.find(".minicolors-slider"),w=f.find(".minicolors-opacity-slider"),t=g.find("[class$=-picker]"),s=k.find("[class$=-picker]"),x=w.find("[class$=-picker]");(c=y(v(a.val(),!0),e.letterCase))||(c=y(v(e.defaultValue,!0)));var p=A(c),n=0,q=0,r=0,q=Math.min(p.r,p.g,p.b),r=Math.max(p.r,
p.g,p.b),n=r-q,q=0!==r?255*n/r:0,n=0!==q?p.r===r?(p.g-p.b)/n:p.g===r?2+(p.b-p.r)/n:4+(p.r-p.g)/n:-1,n=60*n;0>n&&(n+=360);q*=100/255;r*=100/255;0===q&&(n=360);b||a.val(c);e.opacity&&(j=""===a.attr("data-opacity")?1:m(parseFloat(a.attr("data-opacity")).toFixed(2),0,1),isNaN(j)&&(j=1),a.attr("data-opacity",j),l.find("SPAN").css("opacity",j),b=m(w.height()-w.height()*j,0,w.height()),x.css("top",b+"px"));l.find("SPAN").css("backgroundColor",c);switch(e.control){case "wheel":f=m(Math.ceil(0.75*q),0,g.height()/
2);l=n*Math.PI/180;e=m(75-Math.cos(l)*f,0,g.width());b=m(75-Math.sin(l)*f,0,g.height());t.css({top:b+"px",left:e+"px"});b=150-r/(100/g.height());""===c&&(b=0);s.css("top",b+"px");k.css("backgroundColor",u({h:n,s:q,b:100}));break;case "saturation":e=m(5*n/12,0,150);b=m(g.height()-Math.ceil(r/(100/g.height())),0,g.height());t.css({top:b+"px",left:e+"px"});b=m(k.height()-q*(k.height()/100),0,k.height());s.css("top",b+"px");k.css("backgroundColor",u({h:n,s:100,b:r}));f.find(".minicolors-grid-inner").css("opacity",
q/100);break;case "brightness":e=m(5*n/12,0,150);b=m(g.height()-Math.ceil(q/(100/g.height())),0,g.height());t.css({top:b+"px",left:e+"px"});b=m(k.height()-r*(k.height()/100),0,k.height());s.css("top",b+"px");k.css("backgroundColor",u({h:n,s:q,b:100}));f.find(".minicolors-grid-inner").css("opacity",1-r/100);break;default:e=m(Math.ceil(q/(100/g.width())),0,g.width()),b=m(g.height()-Math.ceil(r/(100/g.height())),0,g.height()),t.css({top:b+"px",left:e+"px"}),b=m(k.height()-n/(360/k.height()),0,k.height()),
s.css("top",b+"px"),g.css("backgroundColor",u({h:n,s:100,b:100}))}d||E(a,c,j)}function E(a,b,d){var c=a.data("minicolors-settings");b+d!==a.data("minicolors-lastChange")&&(a.data("minicolors-lastChange",b+d),c.change&&(c.changeDelay?(clearTimeout(a.data("minicolors-changeTimeout")),a.data("minicolors-changeTimeout",setTimeout(function(){c.change.call(a,b,d)},c.changeDelay))):c.change.call(a,b,d)))}function y(a,b){return"uppercase"===b?a.toUpperCase():a.toLowerCase()}function v(a,b){a=a.replace(/[^A-F0-9]/ig,
"");if(3!==a.length&&6!==a.length)return"";3===a.length&&b&&(a=a[0]+a[0]+a[1]+a[1]+a[2]+a[2]);return"#"+a}function m(a,b,d){a<b&&(a=b);a>d&&(a=d);return a}function u(a){var b,h,c;c=Math.round(a.h);h=Math.round(255*a.s/100);a=Math.round(255*a.b/100);if(0===h)b=h=c=a;else{var j=(255-h)*a/255,e=(a-j)*(c%60)/60;360===c&&(c=0);60>c?(b=a,c=j,h=j+e):120>c?(h=a,c=j,b=a-e):180>c?(h=a,b=j,c=j+e):240>c?(c=a,b=j,h=a-e):300>c?(c=a,h=j,b=j+e):360>c?(b=a,h=j,c=a-e):c=h=b=0}a=Math.round(b);h=Math.round(h);c=Math.round(c);
var f=[a.toString(16),h.toString(16),c.toString(16)];d.each(f,function(a,b){1===b.length&&(f[a]="0"+b)});return"#"+f.join("")}function A(a){a=parseInt(-1<a.indexOf("#")?a.substring(1):a,16);return{r:a>>16,g:(a&65280)>>8,b:a&255}}d.minicolors={defaultSettings:{animationSpeed:100,animationEasing:"swing",change:null,changeDelay:0,control:"hue",defaultValue:"",hide:null,hideSpeed:100,inline:!1,letterCase:"lowercase",opacity:!1,position:"default",show:null,showSpeed:100,swatchPosition:"left",textfield:!0,
theme:"default"}};d.extend(d.fn,{minicolors:function(a,b){switch(a){case "destroy":return d(this).each(function(){B(d(this))}),d(this);case "hide":return t(),d(this);case "opacity":if(void 0===b)return d(this).attr("data-opacity");d(this).each(function(){var a=d(this).attr("data-opacity",b);x(a)});return d(this);case "rgbObject":var h;h=d(this);var c=v(d(h).val(),!0),c=A(c);h=d(h).attr("data-opacity");c?(void 0!==h&&d.extend(c,{a:parseFloat(h)}),h=c):h=null;return h;case "rgbString":case "rgbaString":c=
d(this);h="rgbaString"===a;var j=v(d(c).val(),!0),j=A(j),c=d(c).attr("data-opacity");j?(void 0===c&&(c=1),h=h?"rgba("+j.r+", "+j.g+", "+j.b+", "+parseFloat(c)+")":"rgb("+j.r+", "+j.g+", "+j.b+")"):h=null;return h;case "settings":if(void 0===b)return d(this).data("minicolors-settings");d(this).each(function(){var a=d(this).data("minicolors-settings")||{};B(d(this));d(this).minicolors(d.extend(!0,a,b))});return d(this);case "show":return z(d(this).eq(0)),d(this);case "value":if(void 0===b)return d(this).val();
d(this).each(function(){var a=d(this).val(b);x(a)});return d(this);default:return"create"!==a&&(b=a),d(this).each(function(){var a=d(this),c=b,h=d('<span class="minicolors" />'),g=d.minicolors.defaultSettings;a.data("minicolors-initialized")||(c=d.extend(!0,{},g,c),h.addClass("minicolors-theme-"+c.theme).addClass("minicolors-swatch-position-"+c.swatchPosition).toggleClass("minicolors-swatch-left","left"===c.swatchPosition).toggleClass("minicolors-with-opacity",c.opacity),void 0!==c.position&&d.each(c.position.split(" "),
function(){h.addClass("minicolors-position-"+this)}),a.addClass("minicolors-input").data("minicolors-initialized",!0).data("minicolors-settings",c).prop("size",7).prop("maxlength",7).wrap(h).after('<span class="minicolors-panel minicolors-slider-'+c.control+'"><span class="minicolors-slider"><span class="minicolors-picker"></span></span><span class="minicolors-opacity-slider"><span class="minicolors-picker"></span></span><span class="minicolors-grid"><span class="minicolors-grid-inner"></span><span class="minicolors-picker"><span></span></span></span></span>'),
a.parent().find(".minicolors-panel").on("selectstart",function(){return!1}).end(),"left"===c.swatchPosition?a.before('<span class="minicolors-swatch"><span></span></span>'):a.after('<span class="minicolors-swatch"><span></span></span>'),c.textfield||a.addClass("minicolors-hidden"),c.inline&&a.parent().addClass("minicolors-inline"),x(a,!1,!0))}),d(this)}}});d(document).on("mousedown.minicolors touchstart.minicolors",function(a){d(a.target).parents().add(a.target).hasClass("minicolors")||t()}).on("mousedown.minicolors touchstart.minicolors",
".minicolors-grid, .minicolors-slider, .minicolors-opacity-slider",function(a){var b=d(this);a.preventDefault();d(document).data("minicolors-target",b);C(b,a,!0)}).on("mousemove.minicolors touchmove.minicolors",function(a){var b=d(document).data("minicolors-target");b&&C(b,a)}).on("mouseup.minicolors touchend.minicolors",function(){d(this).removeData("minicolors-target")}).on("mousedown.minicolors touchstart.minicolors",".minicolors-swatch",function(){var a=d(this).parent().find(".minicolors-input");
a.parent().hasClass("minicolors-focus")?t(a):z(a)}).on("focus.minicolors",".minicolors-input",function(){var a=d(this);a.data("minicolors-initialized")&&z(a)}).on("blur.minicolors",".minicolors-input",function(){var a=d(this),b=a.data("minicolors-settings");a.data("minicolors-initialized")&&(a.val(v(a.val(),!0)),""===a.val()&&a.val(v(b.defaultValue,!0)),a.val(y(a.val(),b.letterCase)))}).on("keydown.minicolors",".minicolors-input",function(a){var b=d(this);if(b.data("minicolors-initialized"))switch(a.keyCode){case 9:t();
break;case 27:t(),b.blur()}}).on("keyup.minicolors",".minicolors-input",function(){var a=d(this);a.data("minicolors-initialized")&&x(a,!0)}).on("paste.minicolors",".minicolors-input",function(){var a=d(this);a.data("minicolors-initialized")&&setTimeout(function(){x(a,!0)},1)})}(jQuery);
