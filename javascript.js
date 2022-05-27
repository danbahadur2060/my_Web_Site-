var monthFormat = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            noThumbnail = "",
            postPerPage = 8,
            fixedSidebar = true,
            commentsSystem = "blogger",
            disqusShortname = "soratemplates";
            var disqusShortname = "soratemplates";
            var commentsSystem = "blogger";
            var fixedSidebar = true;
            var postPerPage = 5;
            window.followersIframe = null;
            function followersIframeOpen(url) {
                gapi.load("gapi.iframes", function() {
                    if (gapi.iframes && gapi.iframes.getContext) {
                        window.followersIframe = gapi.iframes.getContext().openChild({
                            url: url,
                            where: document.getElementById("followers-iframe-container"),
                            messageHandlersFilter: gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
                            messageHandlers: {
                                '_ready': function(obj) {
                                    window.followersIframe.getIframeEl().height = obj.height;
                                },
                                'reset': function() {
                                    window.followersIframe.close();
                                    followersIframeOpen("");
                                },
                                'open': function(url) {
                                    window.followersIframe.close();
                                    followersIframeOpen(url);
                                },
                                'blogger-ping': function() {}
                            }
                        });
                    }
                });
            }
            followersIframeOpen("");

            (function($) {
                $.fn.theiaStickySidebar = function(options) {
                    var defaults = {
                        'containerSelector': '',
                        'additionalMarginTop': 0,
                        'additionalMarginBottom': 0,
                        'updateSidebarHeight': true,
                        'minWidth': 0,
                        'disableOnResponsiveLayouts': true,
                        'sidebarBehavior': 'modern',
                        'defaultPosition': 'relative',
                        'namespace': 'TSS'
                    };
                    options = $.extend(defaults, options);
                    options.additionalMarginTop = parseInt(options.additionalMarginTop) || 0;
                    options.additionalMarginBottom = parseInt(options.additionalMarginBottom) || 0;
                    tryInitOrHookIntoEvents(options, this);

                    function tryInitOrHookIntoEvents(options, $that) {
                        var success = tryInit(options, $that);
                        if (!success) {
                            console.log('TSS: Body width smaller than options.minWidth. Init is delayed.');
                            $(document).on('scroll.' + options.namespace, function(options, $that) {
                                return function(evt) {
                                    var success = tryInit(options, $that);
                                    if (success) {
                                        $(this).unbind(evt)
                                    }
                                }
                            }(options, $that));
                            $(window).on('resize.' + options.namespace, function(options, $that) {
                                return function(evt) {
                                    var success = tryInit(options, $that);
                                    if (success) {
                                        $(this).unbind(evt)
                                    }
                                }
                            }(options, $that))
                        }
                    }

                    function tryInit(options, $that) {
                        if (options.initialized === true) {
                            return true
                        }
                        if ($('body').width() < options.minWidth) {
                            return false
                        }
                        init(options, $that);
                        return true
                    }

                    function init(options, $that) {
                        options.initialized = true;
                        var existingStylesheet = $('#theia-sticky-sidebar-stylesheet-' + options.namespace);
                        if (existingStylesheet.length === 0) {
                            $('head').append($('<style id="theia-sticky-sidebar-stylesheet-' + options.namespace + '">.theiaStickySidebar:after {content: ""; display: table; clear: both;}</style>'))
                        }
                        $that.each(function() {
                            var o = {};
                            o.sidebar = $(this);
                            o.options = options || {};
                            o.container = $(o.options.containerSelector);
                            if (o.container.length == 0) {
                                o.container = o.sidebar.parent()
                            }
                            o.sidebar.parents().css('-webkit-transform', 'none');
                            o.sidebar.css({
                                'position': o.options.defaultPosition,
                                'overflow': 'visible',
                                '-webkit-box-sizing': 'border-box',
                                '-moz-box-sizing': 'border-box',
                                'box-sizing': 'border-box'
                            });
                            o.stickySidebar = o.sidebar.find('.theiaStickySidebar');
                            if (o.stickySidebar.length == 0) {
                                var javaScriptMIMETypes = /(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
                                o.sidebar.find('script').filter(function(index, script) {
                                    return script.type.length === 0 || script.type.match(javaScriptMIMETypes)
                                }).remove();
                                o.stickySidebar = $('<div>').addClass('theiaStickySidebar').append(o.sidebar.children());
                                o.sidebar.append(o.stickySidebar)
                            }
                            o.marginBottom = parseInt(o.sidebar.css('margin-bottom'));
                            o.paddingTop = parseInt(o.sidebar.css('padding-top'));
                            o.paddingBottom = parseInt(o.sidebar.css('padding-bottom'));
                            var collapsedTopHeight = o.stickySidebar.offset().top;
                            var collapsedBottomHeight = o.stickySidebar.outerHeight();
                            o.stickySidebar.css('padding-top', 1);
                            o.stickySidebar.css('padding-bottom', 1);
                            collapsedTopHeight -= o.stickySidebar.offset().top;
                            collapsedBottomHeight = o.stickySidebar.outerHeight() - collapsedBottomHeight - collapsedTopHeight;
                            if (collapsedTopHeight == 0) {
                                o.stickySidebar.css('padding-top', 0);
                                o.stickySidebarPaddingTop = 0
                            } else {
                                o.stickySidebarPaddingTop = 1
                            }
                            if (collapsedBottomHeight == 0) {
                                o.stickySidebar.css('padding-bottom', 0);
                                o.stickySidebarPaddingBottom = 0
                            } else {
                                o.stickySidebarPaddingBottom = 1
                            }
                            o.previousScrollTop = null;
                            o.fixedScrollTop = 0;
                            resetSidebar();
                            o.onScroll = function(o) {
                                if (!o.stickySidebar.is(":visible")) {
                                    return
                                }
                                if ($('body').width() < o.options.minWidth) {
                                    resetSidebar();
                                    return
                                }
                                if (o.options.disableOnResponsiveLayouts) {
                                    var sidebarWidth = o.sidebar.outerWidth(o.sidebar.css('float') == 'none');
                                    if (sidebarWidth + 50 > o.container.width()) {
                                        resetSidebar();
                                        return
                                    }
                                }
                                var scrollTop = $(document).scrollTop();
                                var position = 'static';
                                if (scrollTop >= o.sidebar.offset().top + (o.paddingTop - o.options.additionalMarginTop)) {
                                    var offsetTop = o.paddingTop + options.additionalMarginTop;
                                    var offsetBottom = o.paddingBottom + o.marginBottom + options.additionalMarginBottom;
                                    var containerTop = o.sidebar.offset().top;
                                    var containerBottom = o.sidebar.offset().top + getClearedHeight(o.container);
                                    var windowOffsetTop = 0 + options.additionalMarginTop;
                                    var windowOffsetBottom;
                                    var sidebarSmallerThanWindow = (o.stickySidebar.outerHeight() + offsetTop + offsetBottom) < $(window).height();
                                    if (sidebarSmallerThanWindow) {
                                        windowOffsetBottom = windowOffsetTop + o.stickySidebar.outerHeight()
                                    } else {
                                        windowOffsetBottom = $(window).height() - o.marginBottom - o.paddingBottom - options.additionalMarginBottom
                                    }
                                    var staticLimitTop = containerTop - scrollTop + o.paddingTop;
                                    var staticLimitBottom = containerBottom - scrollTop - o.paddingBottom - o.marginBottom;
                                    var top = o.stickySidebar.offset().top - scrollTop;
                                    var scrollTopDiff = o.previousScrollTop - scrollTop;
                                    if (o.stickySidebar.css('position') == 'fixed') {
                                        if (o.options.sidebarBehavior == 'modern') {
                                            top += scrollTopDiff
                                        }
                                    }
                                    if (o.options.sidebarBehavior == 'stick-to-top') {
                                        top = options.additionalMarginTop
                                    }
                                    if (o.options.sidebarBehavior == 'stick-to-bottom') {
                                        top = windowOffsetBottom - o.stickySidebar.outerHeight()
                                    }
                                    if (scrollTopDiff > 0) {
                                        top = Math.min(top, windowOffsetTop)
                                    } else {
                                        top = Math.max(top, windowOffsetBottom - o.stickySidebar.outerHeight())
                                    }
                                    top = Math.max(top, staticLimitTop);
                                    top = Math.min(top, staticLimitBottom - o.stickySidebar.outerHeight());
                                    var sidebarSameHeightAsContainer = o.container.height() == o.stickySidebar.outerHeight();
                                    if (!sidebarSameHeightAsContainer && top == windowOffsetTop) {
                                        position = 'fixed'
                                    } else if (!sidebarSameHeightAsContainer && top == windowOffsetBottom - o.stickySidebar.outerHeight()) {
                                        position = 'fixed'
                                    } else if (scrollTop + top - o.sidebar.offset().top - o.paddingTop <= options.additionalMarginTop) {
                                        position = 'static'
                                    } else {
                                        position = 'absolute'
                                    }
                                }
                                if (position == 'fixed') {
                                    var scrollLeft = $(document).scrollLeft();
                                    o.stickySidebar.css({
                                        'position': 'fixed',
                                        'width': getWidthForObject(o.stickySidebar) + 'px',
                                        'transform': 'translateY(' + top + 'px)',
                                        'left': (o.sidebar.offset().left + parseInt(o.sidebar.css('padding-left')) - scrollLeft) + 'px',
                                        'top': '0px'
                                    })
                                } else if (position == 'absolute') {
                                    var css = {};
                                    if (o.stickySidebar.css('position') != 'absolute') {
                                        css.position = 'absolute';
                                        css.transform = 'translateY(' + (scrollTop + top - o.sidebar.offset().top - o.stickySidebarPaddingTop - o.stickySidebarPaddingBottom) + 'px)';
                                        css.top = '0px'
                                    }
                                    css.width = getWidthForObject(o.stickySidebar) + 'px';
                                    css.left = '';
                                    o.stickySidebar.css(css)
                                } else if (position == 'static') {
                                    resetSidebar()
                                }
                                if (position != 'static') {
                                    if (o.options.updateSidebarHeight == true) {
                                        o.sidebar.css({
                                            'min-height': o.stickySidebar.outerHeight() + o.stickySidebar.offset().top - o.sidebar.offset().top + o.paddingBottom
                                        })
                                    }
                                }
                                o.previousScrollTop = scrollTop
                            };
                            o.onScroll(o);
                            $(document).on('scroll.' + o.options.namespace, function(o) {
                                return function() {
                                    o.onScroll(o)
                                }
                            }(o));
                            $(window).on('resize.' + o.options.namespace, function(o) {
                                return function() {
                                    o.stickySidebar.css({
                                        'position': 'static'
                                    });
                                    o.onScroll(o)
                                }
                            }(o));
                            if (typeof ResizeSensor !== 'undefined') {
                                new ResizeSensor(o.stickySidebar[0], function(o) {
                                    return function() {
                                        o.onScroll(o)
                                    }
                                }(o))
                            }

                            function resetSidebar() {
                                o.fixedScrollTop = 0;
                                o.sidebar.css({
                                    'min-height': '1px'
                                });
                                o.stickySidebar.css({
                                    'position': 'static',
                                    'width': '',
                                    'transform': 'none'
                                })
                            }

                            function getClearedHeight(e) {
                                var height = e.height();
                                e.children().each(function() {
                                    height = Math.max(height, $(this).height())
                                });
                                return height
                            }
                        })
                    }

                    function getWidthForObject(object) {
                        var width;
                        try {
                            width = object[0].getBoundingClientRect().width
                        } catch (err) {}
                        if (typeof width === "undefined") {
                            width = object.width()
                        }
                        return width
                    }
                    return this
                }
            })(jQuery);
            var postResults = postPerPage;
            var numOfPages = 2;
            var pageOf = ["Page", "of"];
            eval(function(p, a, c, k, e, d) {
                    e = function(c) {
                        return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
                    };
                    if (!''.replace(/^/, String)) {
                        while (c--) {
                            d[e(c)] = k[c] || e(c)
                        }
                        k = [function(e) {
                            return d[e]
                        }];
                        e = function() {
                            return '\\w+'
                        };
                        c = 1
                    };
                    while (c--) {
                        if (k[c]) {
                            p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c])
                        }
                    }
                    return p
                }
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s);
                js.id = id;
                js.src = 'https://www.facebook.com/Danbahadur2020/';
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));


            window['__wavt'] = 'AOuZoY6pSrksA4Wq4uQIdCWk_WAMaJ4ceA:1650120129405';
            _WidgetManager._Init('//www.blogger.com/rearrange?blogID\x3d8714821097839664717', '//ctevtpaper.blogspot.com/', '8714821097839664717');
            _WidgetManager._SetDataContext([{
                'name': 'blog',
                'data': {
                    'blogId': '8714821097839664717',
                    'title': 'CTEVT Paper',
                    'url': '',
                    'canonicalUrl': '',
                    'homepageUrl': '',
                    'searchUrl': '',
                    'canonicalHomepageUrl': '',
                    'blogspotFaviconUrl': '',
                    'bloggerUrl': '',
                    'hasCustomDomain': false,
                    'httpsEnabled': true,
                    'enabledCommentProfileImages': true,
                    'gPlusViewType': 'FILTERED_POSTMOD',
                    'adultContent': false,
                    'analyticsAccountNumber': '',
                    'encoding': 'UTF-8',
                    'locale': 'en',
                    'localeUnderscoreDelimited': 'en',
                    'languageDirection': 'ltr',
                    'isPrivate': false,
                    'isMobile': false,
                    'isMobileRequest': false,
                    'mobileClass': '',
                    'isPrivateBlog': false,
                    'isDynamicViewsAvailable': true,
                    'feedLinks': '\x3clink rel\x3d\x22alternate\x22 type\x3d\x22application/atom+xml\x22 title\x3d\x22CTEVT Paper - Atom\x22 href\x3d\x22https://ctevtpaper.blogspot.com/feeds/posts/default\x22 /\x3e\n\x3clink rel\x3d\x22alternate\x22 type\x3d\x22application/rss+xml\x22 title\x3d\x22CTEVT Paper - RSS\x22 href\x3d\x22https://ctevtpaper.blogspot.com/feeds/posts/default?alt\x3drss\x22 /\x3e\n\x3clink rel\x3d\x22service.post\x22 type\x3d\x22application/atom+xml\x22 title\x3d\x22CTEVT Paper - Atom\x22 href\x3d\x22https://www.blogger.com/feeds/8714821097839664717/posts/default\x22 /\x3e\n',
                    'meTag': '\x3clink rel\x3d\x22me\x22 href\x3d\x22https://www,
                    'adsenseClientId': 'ca-pub-6032219881249341',
                    'adsenseHostId': 'ca-host-pub-1556223355139109',
                    'adsenseHasAds': false,
                    'adsenseAutoAds': false,
                    'boqCommentIframeForm': false,
                    'loginRedirectParam': '',
                    'view': '',
                    'dynamicViewsCommentsSrc': '',
                    'dynamicViewsScriptSrc': '',
                    'plusOneApiSrc': '',
                    'disableGComments': true,
                    'sharing': {
                        'platforms': [{
                            'name': 'Get link',
                            'key': 'link',
                            'shareMessage': 'Get link',
                            'target': ''
                        }, {
                            'name': 'Facebook',
                            'key': 'facebook',
                            'shareMessage': 'Share to Facebook',
                            'target': 'facebook'
                        }, {
                            'name': 'BlogThis!',
                            'key': 'blogThis',
                            'shareMessage': 'BlogThis!',
                            'target': 'blog'
                        }, {
                            'name': 'Twitter',
                            'key': 'twitter',
                            'shareMessage': 'Share to Twitter',
                            'target': 'twitter'
                        }, {
                            'name': 'Pinterest',
                            'key': 'pinterest',
                            'shareMessage': 'Share to Pinterest',
                            'target': 'pinterest'
                        }, {
                            'name': 'Email',
                            'key': 'email',
                            'shareMessage': 'Email',
                            'target': 'email'
                        }],
                        'disableGooglePlus': true,
                        'googlePlusShareButtonWidth': 0,
                        'googlePlusBootstrap': ''
                    },
                    'hasCustomJumpLinkMessage': false,
                    'jumpLinkMessage': 'Read more',
                    'pageType': 'index',
                    'pageName': '',
                    'pageTitle': 'CTEVT Paper',
                    'metaDescription': 'ctevt notes, ctevt question paper, engineering paper, ctevt exam paper, solved paper for exam, ctevt, study material, study resources'
                }
            }, {
                'name': 'features',
                'data': {
                    'sharing_get_link_dialog': 'true',
                    'sharing_native': 'false'
                }
            }, {
                'name': 'messages',
                'data': {
                    'edit': 'Edit',
                    'linkCopiedToClipboard': 'Link copied to clipboard!',
                    'ok': 'Ok',
                    'postLink': 'Post Link'
                }
            }, {
                'name': 'template',
                'data': {
                    'name': 'custom',
                    'localizedName': 'Custom',
                    'isResponsive': true,
                    'isAlternateRendering': false,
                    'isCustom': true
                }
            }, {
                'name': 'view',
                'data': {
                    'classic': {
                        'name': 'classic',
                        'url': '?view\x3dclassic'
                    },
                    'flipcard': {
                        'name': 'flipcard',
                        'url': '?view\x3dflipcard'
                    },
                    'magazine': {
                        'name': 'magazine',
                        'url': '?view\x3dmagazine'
                    },
                    'mosaic': {
                        'name': 'mosaic',
                        'url': '?view\x3dmosaic'
                    },
                    'sidebar': {
                        'name': 'sidebar',
                        'url': '?view\x3dsidebar'
                    },
                    'snapshot': {
                        'name': 'snapshot',
                        'url': '?view\x3dsnapshot'
                    },
                    'timeslide': {
                        'name': 'timeslide',
                        'url': '?view\x3dtimeslide'
                    },
                    'isMobile': false,
                    'title': 'CTEVT Paper',
                    'description': 'ctevt notes, ctevt question paper, engineering paper, ctevt exam paper, solved paper for exam, ctevt, study material, study resources',
                    'url': '',
                    'type': 'feed',
                    'isSingleItem': false,
                    'isMultipleItems': true,
                    'isError': false,
                    'isPage': false,
                    'isPost': false,
                    'isHomepage': true,
                    'isArchive': false,
                    'isLabelSearch': false
                }
            }, {
                'name': 'widgets',
                'data': [{
                    'title': 'Css Options',
                    'type': 'LinkList',
                    'sectionId': 'sora-panel',
                    'id': 'LinkList70'
                }, {
                    'title': 'Default Variables',
                    'type': 'LinkList',
                    'sectionId': 'sora-panel',
                    'id': 'LinkList71'
                }, {
                    'title': '',
                    'type': 'LinkList',
                    'sectionId': 'top-bar-nav',
                    'id': 'LinkList72'
                }, {
                    'title': '',
                    'type': 'LinkList',
                    'sectionId': 'top-bar-social',
                    'id': 'LinkList73'
                }, {
                    'title': 'CTEVT Paper (Header)',
                    'type': 'Header',
                    'sectionId': 'header-logo',
                    'id': 'Header1'
                }, {
                    'title': 'Header Ads',
                    'type': 'HTML',
                    'sectionId': 'header-ads',
                    'id': 'HTML1'
                }, {
                    'title': 'Mobile Logo Settings',
                    'type': 'Image',
                    'sectionId': 'mobile-logo',
                    'id': 'Image70'
                }, {
                    'title': 'Main Menu',
                    'type': 'LinkList',
                    'sectionId': 'main-menu',
                    'id': 'LinkList74'
                }, {
                    'title': 'Blog Posts',
                    'type': 'Blog',
                    'sectionId': 'main',
                    'id': 'Blog1',
                    'posts': [{
                        'id': '6985167432554353635',
                        'title': 'Earn Crypto Currencies \x26 Digital Money 2021 | 100+ payout method | Idle Empire',
                        'featuredImage': '',
                        'showInlineAds': false
                    }, {
                        'id': '276532702217849308',
                        'title': 'Data Communication | Question Paper | CTEVT',
                        'featuredImage': '',
                        'showInlineAds': false
                    }, {
                        'id': '8844705463683347743',
                        'title': 'E-Commerce | Question Paper | CTEVT',
                        'featuredImage': '',
                        'showInlineAds': false
                    }, {
                        'id': '6964902239741202775',
                        'title': 'Artificial Intelligence | Question Paper | CTEVT',
                        'featuredImage': '',
                        'showInlineAds': false
                    }, {
                        'id': '7343527658008318401',
                        'title': 'Internet/Intranet (Elective-II) | Question Paper | CTEVT',
                        'featuredImage': '',
                        'showInlineAds': false
                    }, {
                        'id': '3777285414510766755',
                        'title': 'Multimedia Technology | Question Paper | CTEVT',
                        'featuredImage': '',
                        'showInlineAds': false
                    }, {
                        'id': '4220125005142103485',
                        'title': 'Object Oriented Analysis \x26 Design - OOAD | Question Paper | CTEVT',
                        'featuredImage': '',
                        'showInlineAds': false
                    }, {
                        'id': '9023207924026910358',
                        'title': 'OOAD - Object Oriented Analysis \x26 Design | Note | Diploma in Engineering | CTEVT',
                        'featuredImage': '',
                        'showInlineAds': false
                    }, {
                        'id': '2903145996122689621',
                        'title': 'Embedded System | PDF Note | Diploma In Engineering | CTEVT',
                        'featuredImage': '',
                        'showInlineAds': false
                    }, {
                        'id': '8741481554485076363',
                        'title': 'Visual Programming | Question Paper | CTEVT',
                        'featuredImage': '',
                        'showInlineAds': false
                    }],
                    'headerByline': {
                        'regionName': 'header1',
                        'items': [{
                            'name': 'author',
                            'label': 'Posted by:'
                        }, {
                            'name': 'timestamp',
                            'label': ''
                        }]
                    },
                    'footerBylines': [{
                        'regionName': 'footer1',
                        'items': [{
                            'name': 'share',
                            'label': ''
                        }, {
                            'name': 'comments',
                            'label': 'Comments'
                        }, {
                            'name': 'backlinks',
                            'label': 'Related Posts'
                        }]
                    }, {
                        'regionName': 'footer2',
                        'items': [{
                            'name': 'labels',
                            'label': 'Tags:'
                        }]
                    }, {
                        'regionName': 'footer3',
                        'items': [{
                            'name': 'reactions',
                            'label': 'Reactions'
                        }]
                    }],
                    'allBylineItems': [{
                        'name': 'author',
                        'label': 'Posted by:'
                    }, {
                        'name': 'timestamp',
                        'label': ''
                    }, {
                        'name': 'share',
                        'label': ''
                    }, {
                        'name': 'comments',
                        'label': 'Comments'
                    }, {
                        'name': 'backlinks',
                        'label': 'Related Posts'
                    }, {
                        'name': 'labels',
                        'label': 'Tags:'
                    }, {
                        'name': 'reactions',
                        'label': 'Reactions'
                    }]
                }, {
                    'title': 'View Profile On LinkedIn',
                    'type': 'HTML',
                    'sectionId': 'sidebar1',
                    'id': 'HTML2'
                }, {
                    'title': 'Social Links',
                    'type': 'LinkList',
                    'sectionId': 'social-widget',
                    'id': 'LinkList75'
                }, {
                    'title': 'Followers',
                    'type': 'Followers',
                    'sectionId': 'sidebar2',
                    'id': 'Followers1'
                }, {
                    'title': 'Subjects',
                    'type': 'Label',
                    'sectionId': 'sidebar2',
                    'id': 'Label1'
                }, {
                    'title': 'Menu Footer Widget',
                    'type': 'LinkList',
                    'sectionId': 'menu-footer',
                    'id': 'LinkList76'
                }]
            }]);
            _WidgetManager._RegisterWidget('_LinkListView', new _WidgetInfo('LinkList70', 'sora-panel', document.getElementById('LinkList70'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_LinkListView', new _WidgetInfo('LinkList71', 'sora-panel', document.getElementById('LinkList71'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_LinkListView', new _WidgetInfo('LinkList72', 'top-bar-nav', document.getElementById('LinkList72'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_LinkListView', new _WidgetInfo('LinkList73', 'top-bar-social', document.getElementById('LinkList73'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_HeaderView', new _WidgetInfo('Header1', 'header-logo', document.getElementById('Header1'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_HTMLView', new _WidgetInfo('HTML1', 'header-ads', document.getElementById('HTML1'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_ImageView', new _WidgetInfo('Image70', 'mobile-logo', document.getElementById('Image70'), {
                'resize': false
            }, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_LinkListView', new _WidgetInfo('LinkList74', 'main-menu', document.getElementById('LinkList74'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_BlogView', new _WidgetInfo('Blog1', 'main', document.getElementById('Blog1'), {
                'cmtInteractionsEnabled': false,
                'lightboxEnabled': true,
                'lightboxModuleUrl': '',
                'lightboxCssUrl': ''
            }, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_HTMLView', new _WidgetInfo('HTML2', 'sidebar1', document.getElementById('HTML2'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_LinkListView', new _WidgetInfo('LinkList75', 'social-widget', document.getElementById('LinkList75'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_FollowersView', new _WidgetInfo('Followers1', 'sidebar2', document.getElementById('Followers1'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_LabelView', new _WidgetInfo('Label1', 'sidebar2', document.getElementById('Label1'), {}, 'displayModeFull'));
            _WidgetManager._RegisterWidget('_LinkListView', new _WidgetInfo('LinkList76', 'menu-footer', document.getElementById('LinkList76'), {}, 'displayModeFull'));



            