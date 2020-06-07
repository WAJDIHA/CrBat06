var atInternetTracking = {

	init: function () {

		var self = this;

		var url = window.location.href;

		var conf = { level2: '3' };
		if (atinternet_data.is_contact_page == true) {
			conf['name'] = 'contact::' + url
		}
		if (atinternet_data.page == 'confirmation-commande') {
			conf['name'] = atinternet_data.page;
		}

		var tag = self._init_tag()

		/*
		 * Track confirmation pages - non-ajax
		 */
		var confirmation_notice = jQuery(
			".pj-reviews-form .comment-awaiting-moderation, \
			#messages_form:not(:has(>form))"
		);
		var gf_notice = jQuery(".gform_confirmation_message");

		if (confirmation_notice.length > 0) {
			var form_validation = (("name" in conf) ? conf['name'] : url) + '::Validation_formulaire';
			conf['name'] = form_validation;
		}

		if (gf_notice.length > 0) {
			var act = '::Validation_formulaire_contact';
			if (gf_notice.parents('.pj-quote-gravityform').length) {
				act = '::Validation_formulaire_devis';
			} else if (gf_notice.parents('.pj-simulator-gravityform').length) {
				act = '::Validation_formulaire_simulateur';
			}

			var form_validation = (("name" in conf) ? conf['name'] : url) + act;
			conf['name'] = form_validation;
		}

		tag.page.set(conf);


		/*
		 * Track confirmation pages - ajax
		 */
		['gform_confirmation_loaded', 'pj_annonces_contact_sent'].forEach(function (event) {
			jQuery(document).on(event, function (e) {
				var act = '::Validation_formulaire';

				var gf = jQuery('.gform_confirmation_message');
				if (gf.length > 0) {
					if (gf.parents('.pj-quote-gravityform').length) {
						act = '::Validation_formulaire_devis';
					} else if (gf.parents('.pj-simulator-gravityform').length) {
						act = '::Validation_formulaire_simulateur';
					} else {
						act = '::Validation_formulaire_contact';
					}
				}

				conf['name'] = (("name" in conf) ? conf['name'] : url) + act;
				tag.page.send(conf);
			});
		});


		/*
		 * Track elements clicks
		 */
		// element : selector, action
		var elements = [
			['a[href*="contact"]', 'CONTACTER'],
			['a[href^="mailto:"]', 'CONTACTER'],
			['a[href^="tel:"]', 'APPELER'],
			['.wpb_pinterest', 'PARTAGER_RESEAUX_SOCIAUX'],
			['.facebook, .twitter, .gplus, a[href*="facebook.com"], a[href*="twitter.com"], a[href*="plus.google.com"]', 'RESEAUX_SOCIAUX'],
			['a[href*="clicrdv.com"]', 'RESERVER'],
			['.new-review.pj-link[href*="pagesjaunes"]', 'DEPOSER_COMMENTAIRE_AVIS'],
			['#messages_form form#condolence_message input[type="submit"]', 'DEPOSER_CONDOLEANCE'],
			['#header_wishlist', 'VOIR_WISHLIST'],
			['.tinvwl_add_to_wishlist-text', 'AJOUTER_WISHLIST'],
			['.woocommerce-form-login button[type="submit"]', 'CONNEXION'],
			['#header_myaccount', 'LIENS_CONNEXION'],
			['.product .single_add_to_cart_button', 'AJOUTER_AU_PANIER'],
			['li.product .add_to_cart_button', 'AJOUTER_AU_PANIER_RACOURCIS'],
		];

		var dynamic_elements = [
			['.tinv-wishlist .tinvwl_button_view', 'VOIR_WISHLIST'],
			['#order_review #place_order', 'COMMANDER'],
			['.woocommerce-cart-form button[name="update_cart"]', 'METTRE_A_JOUR_LE_PANIER'],
			['.woocommerce-cart-form input[name="apply_coupon"]', 'APPLIQUER_CODE_PROMO'],
			['#header_cart', 'VOIR_PANIER'],
			['.woocommerce-message.alert_success .alert_wrapper a.wc-forward', 'VOIR_PANIER'],
			['.wc-proceed-to-checkout .wcppec-checkout-buttons a#woo_pp_ec_button', 'VALIDER_COMMANDE'],
			['.wc-proceed-to-checkout .checkout-button', 'VALIDER_COMMANDE'],
		];

		try {

			for (i in elements) {
				self._bind_onclick(tag, elements[i][0], elements[i][1]);
			}
			for (j in dynamic_elements) {
				self._bind_dynamic_onclick(tag, 'body', dynamic_elements[j][0], dynamic_elements[j][1]);
			}

			//Track form submit
			jQuery('form[id*="gform"]').on('submit', function (e) {
				action = 'CONTACTER';
				if (jQuery(this).parents('.pj-quote-gravityform').length) {
					action = 'DEMANDER_DEVIS';
				} else if (jQuery(this).parents('.pj-simulator-gravityform').length) {
					action = 'DEMANDER_SIMULATION';
				}
				self._click(tag, this, action, self._location(this));
			});

			jQuery('.pj-reviews-form form').on('submit', function (e) {
				action = 'DEPOSER_COMMENTAIRE';
				self._click(tag, this, action, self._location(this));
			});

			// Workaround to trigger the tracking on the social shares (iframes)
			['.vc_tweetmeme-element', '.fb-page', '.fb_like'].forEach(function (selector) {
				var iframeMouseOver = false;
				var elem = jQuery(selector);
				jQuery(window).on('blur', function (e) {
					if (iframeMouseOver) {
						self._click(tag, elem, 'PARTAGER_RESEAUX_SOCIAUX', self._location(elem));
					}
				});
				elem.hover(
					function () { iframeMouseOver = true; },
					function () { iframeMouseOver = false; }
				);
			});

			// Annonces Jaunes tracking
			var ajBusiness = {
				'IMMO': '#pj-annonces-wrap',
				'AUTO': '#pj-annonces-motors-wrap'
			};
			for (var b in ajBusiness) {
				self._bind_dynamic_onclick(tag, ajBusiness[b], '#aj_contact .button.phone_btn', 'COORDONNEES_' + b);
				self._bind_dynamic_onclick(tag, ajBusiness[b], '.filter input[type="submit"]', 'RECHERCHER_' + b);
			}
			self._bind_dynamic_onclick(tag, ajBusiness['AUTO'], '#aj_contact .button.contact_btn', 'CONTACTER_AUTO');

			jQuery(ajBusiness['IMMO']).on('click', '#aj_contact .button.contact_btn', function (e) {
				var type = jQuery('#pj-annonces-wrap .details table tr:first() td:nth-child(2)').text().split(' - ')[1].toUpperCase();
				self._click(tag, this, 'CONTACT_' + type + '_IMMO', self._location(this));
			});

			/*
			* custom vars & ecommerce tracking
			*/
			var customVars = {
				site: {
					1: self._addBrackets(atinternet_data['site_id']),
					2: atinternet_data['epj'],
					3: self._addBrackets(window.location.host),
					4: atinternet_data['published_at'],
					7: atinternet_data['category'],
				}
			}
			if (typeof atinternet_data !== 'undefined' && atinternet_data.ecommerce_data !== false) {
				atInternetEcommerce.atinternet_ecommerce_tracking(atinternet_data, tag);
				customVars['site'][5] = self._addBrackets('e-commerce');
			}
			else {
				customVars['site'][5] = self._addBrackets('vitrine');
			}
			tag.customVars.set(customVars);
		} catch (error) {
			console.error(error);
			atInternetNotif.send_notification_message(error);
		}

		tag.dispatch();

	},

	_init_tag: function () {
		var params = {};
		if (atinternet_data.notrack == 'true') {
			params['disableCookie'] = true;
		}
		if (typeof atinternet_data.site !== 'undefined' && atinternet_data.site !== '') {
			params['site'] = atinternet_data.site;
		}

		params['collectDomain'] = 'at.pagesjaunes.fr';
		params['collectDomainSSL'] = 'at.pagesjaunes.fr';
		params['pixelPath'] = '/wa.pj';

		return new ATInternet.Tracker.Tag(params);
	},

	_bind_onclick: function (tag, selector, action) {
		var self = this;
		jQuery(selector).on('click', function (e) {
			self._click(tag, this, action, self._location(this));
		});
	},

	_bind_dynamic_onclick: function (tag, parent, selector, action) {
		var self = this;
		jQuery(parent).on('click', selector, function (e) {
			self._click(tag, this, action, self._location(this));
		})
	},

	_location: function (element) {
		var locations = {
			'HEADER': '#Header_wrapper',
			'FOOTER': '#Footer',
			'BANDEAU': '#wpr-contact-bar'
		};
		for (var l in locations) {
			if (jQuery(element).parents(locations[l]).length > 0) {
				return l
			}
		}
		return ""
	},

	_click: function (tag, elem, action, location) {
		//#ID_PRODUIT::#ACTION::#LOCATION::#PAGE_NAME
		name = atinternet_data.product_id + '::' + action + '::' + location + '::' + atinternet_data.page;
		tag.click.send({
			name: name,
			level2: '3',
			type: 'action',
		});
	},

	_addBrackets: function (text) {
		text = text || '';
		return '[' + text + ']';
	}
}

var atInternetInit = (function (atInternetTracking) {
	atInternetTracking.init();
}(atInternetTracking));
