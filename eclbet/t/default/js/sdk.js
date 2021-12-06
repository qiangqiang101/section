$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || "");
        } else {
            o[this.name] = this.value || "";
        }
    });
    return o;
}
;
var _EVENTS = {
    PROMO_LOADED: "_S_PROMO_LOADED",
    PROMO_CAT_LOADED: "_S_PROMO_C_LOADED",
};
var _Validator = {
    vars: {
        unameExist: false,
        hasDuplicates: null,
        unameProceed: false,
    },
    registerCustomValidations: function() {
        $.validator.addMethod("alpha_numeric_firstname", function(value, element) {
            return this.optional(element) || /^[a-zA-Z0-9\s]+$/i.test(value);
        });
        $.validator.addMethod("alpha_numericRegex", function(value, element) {
            return this.optional(element) || /^[a-z0-9\-]+$/i.test(value);
        });
        $.validator.addMethod("email_format", function(value, element) {
            return this.optional(element) || /^[a-zA-Z0-9-_.@]+$/i.test(value);
        });
        $.validator.addMethod("checkUserName", function(value, element) {
            return !_Validator.vars.unameExist;
        });
        $.validator.addMethod("alpha_numericLINERegex", function(value, element) {
            return this.optional(element) || /^[a-z0-9_.-]+$/.test(value);
        });
    },
};
var _Util = {
    listenOnDom: function() {
        _Validator.registerCustomValidations();
        _Main.listen();
        _User.listen();
        _Wallet.listen();
        _Deposit.listen();
        _Withdrawal.listen();
        _Ticker.tick();
    },
    isMobile: function() {
        var c = _Util.getCookie("mobileView");
        return c.length > 0;
    },
    displayDecimal: function() {
        return typeof _showDecimal == "undefined" || _showDecimal;
    },
    dispatchEvent: function(name) {
        var event = document.createEvent("Event");
        event.initEvent(name, true, true);
        document.dispatchEvent(event);
    },
    getCookie: function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    compile: function(tpl, d) {
        var c;
        try {
            c = eval("`" + tpl + "`");
        } catch (e) {
            console.log("not support backtick");
            var vs = tpl.match(/\$\{(.*?)\}/g);
            for (var i = 0; i < vs.length; i++) {
                var v = vs[i].replace("${", "").replace("}", "");
                tpl = tpl.replace(vs[i], eval(v));
            }
            c = tpl;
        }
        var outerHtml = $("<div>").append($(c).clone());
        $(outerHtml).find('[tpl-if="false"]').remove();
        $(outerHtml).find("[tpl-class]").each(function() {
            var attrs = JSON.parse($(this).attr("tpl-class").replace(/\'/gi, '"'));
            for (var key in attrs) {
                attrs[key] ? $(this).addClass(key) : $(this).removeClass(key);
            }
        });
        $(outerHtml).find("[tpl-attrs]").each(function() {
            var attrs = JSON.parse($(this).attr("tpl-attrs").replace(/\'/gi, '\\"'));
            for (var key in attrs) {
                attrs[key][0] ? $(this).attr(key, attrs[key][1]) : $(this).prop(attrs[key][0], false);
            }
        });
        return $(outerHtml).html();
    },
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    post: function(url, d, cb, type) {
        var s = {
            type: "POST",
            url: url,
            dataType: type || "json",
        };
        if (d != null && ((typeof d == "string" && d.length > 0) || (typeof d == "object" && Object.keys(d).length !== 0))) {
            s.data = d;
        }
        $.ajax(s).success(cb).error(function(e) {
            console.log(e);
        });
    },
    getHtmlPostfix: function() {
        return window.location.href.indexOf(".html") > -1 ? ".html" : "";
    },
};
var _Ticker = {
    tick: function() {
        var today = moment();
        if ($("[data-ticker-format]").length > 0) {
            $("[data-ticker-format]").each(function() {
                var format = $(this).attr("data-ticker-format");
                $(this).html(today.format(format));
            });
            setTimeout(function() {
                _Ticker.tick();
            }, 1000);
        }
    },
};
var _Main = {
    vars: {
        webEventList: [],
    },
    listen: function() {
        _Main.getBanner();
        _Main.getAnnouncement();
        _Main.getWebEvent();
        _Main.getPromotion();
        _Main.getPromotionCategory();
    },
    generateNewGd: function(id, type) {
        (id = id || "gd_frame"),
        (type = type || "");
        var action = type == "reg" ? "?action=reg&" : "?";
        $("#" + id).attr("src", "a/gdcode" + action + "v=" + _Util.getRandomInt(0, 100));
    },
    getBanner: function() {
        if ($("[data-dom=banner]:not(.dom-registered)").length > 0) {
            _Util.post("a/getHomeBanner?" + lang, {}, function(data) {
                if (data != undefined) {
                    var tpl = $("#home-banner-tpl").html();
                    var count = 0;
                    $.each(data.d.homebanner, function(i, j) {
                        var bannerpath = (_Util.isMobile() ? j.mobile_content : j.content);
                        var d = {
                            R_HB_IMG: bannerpath.indexOf('http') === 0 ? bannerpath : data.d.imgPath + bannerpath,
                            R_HB_NAME: j.name,
                            R_HB_URL: data.url == "a/ssoTournament" ? "window.open('a/ssoTournament', '_blank');" : j.url,
                            R_HB_ID: count,
                            R_HB_ACTIVE: count == 0 ? "active" : "",
                        };
                        slide = _Util.compile(tpl, d);
                        $("[data-dom=banner]").append(slide);
                        count++;
                    });
                    if (_Registrar.bannerInitializer !== undefined) {
                        _Registrar.bannerInitializer();
                    }
                    $("[data-dom=banner]").addClass("dom-registered");
                }
            });
        }
    },
    getPromotion: function() {
        if ($("[data-dom=promotion]:not(.dom-registered)").length > 0) {
            _Util.post("a/getDisplayPromo", {}, function(data) {
                $("[data-dom=promotion]").html("");
                var tpl = $("#promo-tpl").html();
                var contentTpl = $("#promo-body-tpl").length > 0 ? $("#promo-body-tpl").html() : null;
                $.each(data.d.promoList, function(i, j) {
                    var contentObj = {
                        R_PROMO_IMG: j.img,
                        R_PROMO_TITLE: j.t,
                        R_PROMO_ID: j.id,
                        R_PROMO_CONTENT: j.c,
                        R_PROMO_SUB_TITLE: j.st,
                        R_PROMO_CATE_ID: j.ca,
                        R_PROMO_CODE: j.co,
                        R_PROMO_SUB_IMG: j.simg,
                        R_PROMO_SUB_TITLE: j.st,
                    };
                    $("[data-dom=promotion]").append(_Util.compile(tpl, contentObj));
                    if ($("[data-dom=promotion-body]").length > 0) {
                        $("[data-dom=promotion-body]").append(_Util.compile(contentTpl, contentObj));
                    }
                });
                setTimeout(function() {
                    _Util.dispatchEvent(_EVENTS.PROMO_LOADED);
                }, 500);
            });
            $("[data-dom=promotion]").addClass("dom-registered");
        }
    },
    getPromotionCategory: function() {
        if ($("[data-dom=promotionCategory]:not(.dom-registered)").length > 0) {
            _Util.post("a/getDisplayPromo", {}, function(data) {
                $("[data-dom=promotionCategory]").html("");
                var tpl = $("#promoCat-tpl").html();
                var CategoryTpl = $("#CategoryList-tpl").html();
                var CatTabhtml = "";
                var contentTpl = $("#promoCat-body-tpl").length > 0 ? $("#promoCat-body-tpl").html() : null;
                var i = 0;
                var firstCat = data.d.hasOwnProperty("promoCategoryRaw") ? Object.keys(data.d.promoCategoryRaw)[0] : null;
                var allId = firstCat != null ? firstCat.replace("+", "") : 0;
                if (data.d.promoCategory !== undefined) {
                    $.each(data.d.promoCategory, function(id, v) {
                        var tempId = id;
                        if (id.charAt(0) === "+")
                            id = id.slice(1);
                        if (data.d.promoCategoryRaw[tempId] == "ALL") {
                            allId = id;
                        }
                        var str = "";
                        if (data.d.promoList[id] !== undefined) {
                            CatTabhtml = _Util.compile(CategoryTpl, {
                                tabid: id,
                                rawid: data.d.promoCategoryRaw[tempId].toLowerCase(),
                                name: v,
                            });
                            $("[data-dom=promotion-Category]").append(CatTabhtml);
                            $("[data-dom=promoCategory-tab]").parent().first().addClass("active");
                            $("[data-dom=promoCategory-tab]").first().addClass("active");
                            $.each(data.d.promoList[id], function(i, j) {
                                var contentObj = {
                                    R_PROMO_IMG: j.img,
                                    R_PROMO_TITLE: j.t,
                                    R_PROMO_ID: j.id,
                                    R_PROMO_CONTENT: j.c,
                                    R_PROMO_CATE_ID: j.ca,
                                    R_PROMO_CODE: j.co,
                                    R_PROMO_SUB_IMG: j.simg,
                                    R_PROMO_SUB_TITLE: j.st,
                                };
                                $("[data-dom=promotionCategory]").append(_Util.compile(tpl, contentObj));
                                if ($("[data-dom=promotionCa-body]").length > 0) {
                                    $("[data-dom=promotionCa-body]").append(_Util.compile(contentTpl, contentObj));
                                }
                            });
                        }
                    });
                }
                $(".grid-item").hide();
                $(".pm-" + allId).show();
                setTimeout(function() {
                    _Util.dispatchEvent(_EVENTS.PROMO_CAT_LOADED);
                }, 500);
            });
            $("[data-dom=promotionCategory]").addClass("dom-registered");
        }
    },
    PromoCatTab: function(CatID) {
        $(".grid-item").hide("fast").filter(".pm-" + CatID).show("fast");
    },
    getAnnouncement: function() {
        if ($("[data-dom=announcement]:not(.dom-registered)").length > 0) {
            _Util.post("a/getAnnouncement?" + lang, {
                lang: lang,
                pop: "1",
            }, function(data) {
                var announcement = "";
                $.each(data.d.announcement, function(i, v) {
                    announcement += v.content + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                });
                $("[data-dom=announcement]").html(announcement);
                if (typeof $("[data-dom=announcement]").marquee === "function") {
                    $("[data-dom=announcement]").marquee({
                        duration: 25000,
                        gap: 0,
                        delayBeforeStart: 0,
                        direction: "left",
                        duplicated: true,
                        pauseOnHover: true,
                    });
                }
                $("[data-dom=announcement]").addClass("dom-registered");
            });
        }
    },
    getWebEvent: function() {
        if (["index", "main"].indexOf(_p) >= 0) {
            _Util.post("a/getWebEvent?ct=" + _currenthour + "&" + lang, {
                afterlogin: window.loginFlag == false ? "0" : "1",
            }, function(resp) {
                if (resp.d.status == 0 && typeof resp.d.webevent !== "undefined" && resp.d.webevent !== null) {
                    var webEventList = [];
                    $.each(resp.d.webevent, function(key, v) {
                        if (v.content != undefined) {
                            if (v.content.embeddedvideo == "1") {
                                webEventList.push({
                                    image: "",
                                    url: v.content.url,
                                    embeddedvideo: 1,
                                });
                            } else {
                                $.each(_Util.isMobile() ? v.content.mobile_banner : v.content.desktop_banner, function(k, b) {
                                    webEventList.push({
                                        image: b.indexOf('http') === 0 ? b : resp.d.imgPath + b,
                                        url: v.content.url,
                                        embeddedvideo: 0,
                                    });
                                });
                            }
                        }
                    });
                    _Main.vars.webEventList = webEventList;
                    _Main.showWebEvent();
                    $("#masklayer").click(function() {
                        _Main.showWebEvent();
                    });
                }
            });
        }
    },
    showWebEvent: function() {
        close_popup();
        $("#divWebEvent").html("");
        if ($("#popupLayer > iframe").length) {
            $("#popupLayer > iframe").attr("src", $("#popupLayer > iframe").attr("src"));
        }
        if (_Main.vars.webEventList.length > 0) {
            if (_Main.vars.webEventList[0].embeddedvideo == 0) {
                var tpl = $("#webevent-tpl").html();
                var str = _Util.compile(tpl, _Main.vars.webEventList[0]);
            } else {
                str = _Main.vars.webEventList[0].url;
            }
            $("#divWebEvent").html(str);
            setTimeout(function() {
                if (_Main.vars.webEventList.length > 0) {
                    if (_Main.vars.webEventList[0].embeddedvideo == 0) {
                        var pic_real_width, pic_real_height;
                        if (_Util.isMobile()) {
                            $("<img/>").attr("src", _Main.vars.webEventList[0].image).load(function() {
                                pic_real_width = window.innerWidth > 0 ? window.innerWidth : screen.width;
                                show_popup($("#divWebEvent").html(), pic_real_width - 15, 100);
                            });
                        } else {
                            $("<img/>").attr("src", _Main.vars.webEventList[0].image).load(function() {
                                pic_real_width = this.width + 40;
                                pic_real_height = this.height;
                                show_popup($("#divWebEvent").html(), pic_real_width, 100);
                            });
                        }
                    } else {
                        var wd = 40 + parseFloat($("#divWebEvent > iframe").attr("width"));
                        show_popup($("#divWebEvent").html(), wd);
                    }
                    _Main.vars.webEventList.shift();
                }
            }, 500);
        }
    },
};
var _Ruler = {
    load: function(cb) {
        if (typeof _rules == "undefined") {
            $.getScript(defJsUrl + "js/rules.js").done(function() {
                cb();
            }).fail(function(j, s, e) {
                console.log("_rules loaded error");
                console.log(e);
            });
        } else {
            cb();
        }
    },
};
var _User = {
    vars: {},
    listen: function() {
        _User.listenOnForgetPass();
        _User.listenOnLogin();
        _User.listenOnLogout();
        _User.listenOnRegister();
        _User.getUnreadMessage();
        _User.listenOnProfile();
        _User.listenOnChangePass();
    },
    getUnreadMessage: function() {
        if ($("[data-dom=mailbox]:not(.dom-registered)").length > 0 && loginFlag) {
            _Util.post("a/getPrivateMessage", {
                action: "unread"
            }, function(data) {
                if (data.status == "0") {
                    var tpl = $("#mailbox-tpl").html();
                    var mailbox = _Util.compile(tpl, data.d);
                    $("[data-dom=mailbox]").html(mailbox);
                    $("[data-dom=mailbox]").addClass("dom-registered");
                }
            });
        }
    },
    listenOnLogout: function() {
        if ($("[data-dom=logout]").length > 0) {
            $("[data-dom=logout]").each(function() {
                var setting = $(this).data("setting") || {};
                _User.vars.settings = setting;
                if ($(this).is(":not(.dom-registered)")) {
                    $(this).click(function() {
                        _User.logout();
                    });
                    $(this).addClass("dom-registered");
                }
            });
        }
    },
    listenOnForgetPass: function() {
        if ($("[data-dom=forget-pass-form]:not(.dom-registered)").length > 0) {
            $("[data-dom=forget-pass-form]").each(function() {
                var setting = $(this).data("setting") || {};
                var _form = $(this);
                _Ruler.load(function() {
                    var r = _rules.forgetPass;
                    if (typeof setting.selective != "undefined") {
                        for (var k in r.rules) {
                            if (setting.selective.indexOf(k) < 0) {
                                delete r.rules[k];
                                delete r.messages[k];
                            }
                        }
                    }
                    _form.validate($.extend(r, {
                        errorPlacement: function(err, $e) {
                            var name = $e.attr("name");
                            $("[data-dom=forget-pass-form] .form-error#" + name + "_msg:first").empty();
                            err.appendTo($("[data-dom=forget-pass-form] .form-error#" + name + "_msg:first"));
                            if (navigator.userAgent.indexOf("MSIE") > 0) {
                                $e.val($e.attr("placeholder"));
                            }
                        },
                        submitHandler: function(form) {
                            $(".submit").hide();
                            $(".loading").show();
                            _Util.post("a/forgetPassword", $(form).serialize(), function(data) {
                                if (data.status == "0") {
                                    if (data.d.success == "3") {
                                        $("[data-dom=forget-pass-form]").hide();
                                        $("[data-dom=success-message]").show();
                                    } else {
                                        $("#display_db_error").html('<ul class="default"><li><label>' + data.d.error + "</label></li></ul>");
                                        $(".submit").show();
                                        $(".loading").hide();
                                    }
                                } else {
                                    $("#display_db_error").html('<ul class="default"><li><label>' + data.msg + "</label></li></ul>");
                                    $(".submit").show();
                                    $(".loading").hide();
                                }
                            });
                        },
                    }));
                });
                $(this).addClass("dom-registered");
            });
        }
    },
    listenOnChangePass: function() {
        if ($("[data-dom=change-pass-form]:not(.dom-registered)").length > 0) {
            $("[data-dom=change-pass-form]").each(function() {
                var setting = $(this).data("setting") || {};
                var _form = $(this);
                _Ruler.load(function() {
                    var r = _rules.chgPassword;
                    _form.validate($.extend(r, {
                        errorPlacement: function(err, $e) {
                            var name = $e.attr("name");
                            $(".form-error#" + name + "_msg:first").empty();
                            err.appendTo($(".form-error#" + name + "_msg:first"));
                            if (navigator.userAgent.indexOf("MSIE") > 0) {
                                $e.val($e.attr("placeholder"));
                            }
                        },
                        submitHandler: function(form) {
                            _Util.post("a/setPassword", $(form).serialize(), function(data) {
                                var msg = "";
                                if (data.status == "0") {
                                    msg = _lang.update_successfully;
                                    form.reset();
                                } else {
                                    msg = data.msg;
                                }
                                showAlertMsg(_lang.status, msg);
                            });
                        },
                    }));
                });
                $(this).addClass("dom-registered");
            });
        }
    },
    listenOnProfile: function() {
        if ($("[data-dom=profile-form]:not(.dom-registered)").length > 0) {
            $("[data-dom=profile-form]").each(function() {
                var setting = $(this).data("setting") || {};
                var _form = $(this);
                _Ruler.load(function() {
                    var r = _rules.profile;
                    _form.validate($.extend(r, {
                        errorPlacement: function(err, $e) {
                            var name = $e.attr("name");
                            $(".form-error#" + name + "_msg:first").empty();
                            err.appendTo($(".form-error#" + name + "_msg:first"));
                            if (navigator.userAgent.indexOf("MSIE") > 0) {
                                $e.val($e.attr("placeholder"));
                            }
                        },
                        submitHandler: function(form) {
                            _Util.post("a/setProfile", $(form).serialize(), function(data) {
                                if (data.status == "0") {
                                    if (data.d.error == "1") {
                                        showAlertMsg(_lang.fail, _lang.err_exist_nickname);
                                    } else if (data.d.error == "2") {
                                        showAlertMsg(_lang.fail, _lang.err_format);
                                    } else if (data.d.error == "3") {
                                        showAlertMsg(_lang.fail, _lang.err_nickname_username);
                                    } else {
                                        showAlertMsg(_lang.success, _lang.update_successfully);
                                    }
                                } else {
                                    showAlertMsg(_lang.status, _lang.update_failed);
                                }
                                _User.getProfile();
                            });
                        },
                    }));
                });
                $(this).addClass("dom-registered");
            });
        }
    },
    listenOnLogin: function() {
        if ($("[data-dom=login-form]:not(.dom-registered)").length > 0) {
            $("[data-dom=login-form]").each(function() {
                var setting = $(this).data("setting") || {};
                _User.vars.settings = setting;
                $(this).submit(function() {
                    _User.login($(this).serializeObject(), setting.agree || 0);
                    return false;
                });
                $(this).addClass("dom-registered");
            });
        }
    },
    listenOnRegister: function() {
        if ($("[data-dom=register-form]:not(.dom-registered)").length > 0) {
            $("[data-dom=register-form]").each(function() {
                var setting = $(this).data("setting") || {};
                _User.vars.settings = setting;
                var _form = $(this);
                _Ruler.load(function() {
                    var r = JSON.parse(JSON.stringify(_rules.register));
                    if (["CN", "TH", "TW", "VN"].indexOf(country) > -1) {
                        delete r.rules.fr_first_name.alpha_numeric_firstname;
                    }
                    if (setting.rules) {
                        for (key in setting.rules) {
                            r.rules[key] = setting.rules[key];
                        }
                    }
                    if (setting.messages) {
                        for (key in setting.messages) {
                            r.messages[key] = setting.messages[key];
                        }
                    }
                    _Validator.vars.validation = _form.validate($.extend(r, {
                        errorPlacement: function(err, $e) {
                            var name = $e.attr("name");
                            $(".form-error#" + name + "_msg:first").empty();
                            err.appendTo($(".form-error#" + name + "_msg:first"));
                            if (navigator.userAgent.indexOf("MSIE") > 0) {
                                $e.val($e.attr("placeholder"));
                            }
                        },
                        submitHandler: function(form) {
                            $(".form-error").html("");
                            $(".submit").hide();
                            $(".loading").show();
                            var agreeTnc = setting.tnc == undefined ? true : setting.tnc;
                            var tncChecked = $("#fr_agree").length > 0 ? $("#fr_agree").is(":checked") : true;
                            if (agreeTnc && tncChecked) {
                                if (typeof _ctrl !== "undefined" && _ctrl !== null) {
                                    if (typeof _ctrl.track == "function") {
                                        _ctrl.track("register_event", "5");
                                    }
                                }
                                var link = typeof setting.link != "undefined" ? _User.vars.settings.link : "a/register";
                                _Util.post(link, $(form).serialize(), function(data) {
                                    if (data.status != "0") {
                                        if (data.d.val_err != undefined) {
                                            var val_err_arr = JSON.parse(data.d.val_err);
                                            for (var x in val_err_arr) {
                                                if (val_err_arr[x] == "1") {
                                                    $("#" + x).html(data.msg);
                                                } else if (typeof _err[val_err_arr[x]] !== "undefined") {
                                                    $("#" + x).html(_err[val_err_arr[x]]);
                                                } else {
                                                    $("#" + x).html("");
                                                }
                                            }
                                            $(".submit").show();
                                            $(".loading").hide();
                                        }
                                    } else {
                                        if (data.d.register != undefined) {
                                            var reg = JSON.parse(data.d.register)
                                              , dbErrs = [];
                                            if (reg.error.length > 0) {
                                                for (var i = 0; i < reg.error.length; i++) {
                                                    var x = reg.error[i];
                                                    switch (x) {
                                                    case "2":
                                                    case "3":
                                                    case "4":
                                                    case "5":
                                                        if ($('[data-form-error="' + x + '"]').length > 0) {
                                                            $('[data-form-error="' + x + '"]').append("<label>" + _err[x] + "</label>");
                                                        } else {
                                                            dbErrs.push("<li>" + _err[x] + "</li>");
                                                        }
                                                        break;
                                                    case "6":
                                                    case "7":
                                                        if ($("#fr_nickname_msg").length > 0) {
                                                            $("#fr_nickname_msg").append("<label>" + _err[x] + "</label>");
                                                        } else {
                                                            dbErrs.push("<li>" + _err[x] + "</li>");
                                                        }
                                                        break;
                                                    case "1":
                                                    case "8":
                                                        dbErrs.push("<li>" + _err[x] + "</li>");
                                                        break;
                                                    }
                                                }
                                                $("#display_db_error").html('<ul class="default">' + dbErrs.join("") + "</ul>");
                                                $("html, body").animate({
                                                    scrollTop: $("#display_db_error").position().top,
                                                }, 500);
                                                $(".submit").show();
                                                $(".loading").hide();
                                            } else if (reg.success == "1") {
                                                if (typeof _ctrl !== "undefined" && _ctrl !== null) {
                                                    if (typeof _ctrl.track == "function") {
                                                        _ctrl.track("register_success_page", "6");
                                                    }
                                                    if (typeof _ctrl.adform == "function") {
                                                        _ctrl.adform("register_success_page", reg.accountcode);
                                                    }
                                                }
                                                $("[data-dom=register-form]").hide();
                                                $("[data-display=username]").val("" + reg.accountcode + "").html("" + reg.accountcode + "");
                                                $("[data-display=password]").val("" + reg.password + "").html("" + reg.password + "");
                                                $("[data-dom=success-message]").show();
                                                $("html, body").animate({
                                                    scrollTop: $("[data-dom=success-message]").position().top,
                                                }, 500);
                                                setTimeout(function() {
                                                    _User.login({
                                                        fr_username: reg.accountcode,
                                                        fr_password: reg.password,
                                                        fr_gdcode: reg.gd_rno,
                                                        fr_submit: "2",
                                                    });
                                                }, 3 * 1000);
                                            }
                                        }
                                    }
                                });
                            } else {
                                showAlertMsg(_lang.error, _lang.reg_confirm_tnc);
                                $(".submit").show();
                                $(".loading").hide();
                            }
                        },
                    }));
                    $("#fr_username", _form).keyup(function(e) {
                        var value = $(this).val();
                        if (value.length >= 6) {
                            if (_Validator.vars.hasDuplicates == value) {
                                return null;
                            }
                            _Validator.vars.hasDuplicates = value;
                            setTimeout(function() {
                                $.ajax({
                                    type: "POST",
                                    dataType: "json",
                                    url: "a/checkAccExisting",
                                    data: {
                                        keyup_check_acc: value
                                    },
                                }).success(function(data) {
                                    result = data.d.check == false ? true : false;
                                    _Validator.vars.unameExist = !result;
                                    _Validator.vars.validation.element("#sign-up-form #fr_username");
                                }).error(function() {
                                    _Validator.vars.unameExist = false;
                                });
                            }, 300);
                        }
                    });
                });
                $(this).addClass("dom-registered");
            });
        }
    },
    getProfile: function() {
        _Util.post("a/getProfile", {}, function(data) {
            $("[data-profile]").each(function() {
                var k = $(this).attr("data-profile");
                if (typeof data.d[k] !== "undefined") {
                    var val = data.d[k];
                    if ($(this).is("input,select")) {
                        $(this).val(val);
                    } else {
                        $(this).html(val);
                    }
                    if (k == "nickname") {
                        if (val != null && val != "" && val.substring(0, 2) != "V-") {
                            $(this).prop("readonly", true);
                        }
                    } else if (k == "dob") {
                        var dob = new Date(val);
                        var dobstring = dob.toLocaleDateString("en-GB");
                        $(this).val(dobstring);
                    }
                } else if (k == "verify_mobileno") {
                    if (typeof data.d["verifylist"] !== "undefined" && data.d["verifylist"].includes("mobileno")) {
                        var tpl = $("#profile-tick-icon-tpl").html();
                    } else {
                        var tpl = $("#profile-cross-icon-tpl").html();
                        $(this).show();
                    }
                    if ($("[data-profile='mobile']").length > 0) {
                        if ($("[data-profile='mobile']").is("input,select")) {
                            $("[data-profile='mobile']").after(tpl);
                        } else {
                            $("[data-profile='mobile']").append(tpl);
                        }
                    }
                }
            });
            $.each(data.d.verifylist, function(vid, vname) {
                if ($('[data-profile="' + vname + '"]').length > 0) {
                    $('[data-profile="' + vname + '"]').prop("disabled", true);
                }
            });
        });
    },
    login: function(d, agree) {
        var postfix = _Util.getHtmlPostfix();
        var paths = location.pathname.substring(1).split("/");
        var m = paths[0].trim().length == 2 && paths[0].trim().toLowerCase() != '4d' ? paths[0].trim() + "/" : "";
        var link = "/" + m;
        var prevent_redirect = false;
        if (_User.vars.settings.redirect != undefined && _User.vars.settings.redirect.length > 0) {
            link = _User.vars.settings.redirect;
        }
        if (_User.vars.settings.prevent_redirect != undefined && _User.vars.settings.prevent_redirect === true) {
            prevent_redirect = true;
        }
        var ajaxLogin = function(d) {
            _Util.post("a/login", d, function(data) {
                if (data.status != "0") {
                    showAlertMsg(_lang.error, data.msg);
                } else if (ui_method == 2) {
                    if (!prevent_redirect) {
                        document.location.href = agree ? "agree" + postfix : link;
                    } else {
                        $('[data-loginprocess="inprogress"]').hide();
                        $('[data-loginprocess="done"]').show();
                    }
                } else {
                    if (!prevent_redirect) {
                        showPageContent(agree ? "agree" : "index");
                    } else {
                        $('[data-loginprocess="inprogress"]').hide();
                        $('[data-loginprocess="done"]').show();
                    }
                }
            });
        };
        if (typeof d.fr_visitor === "undefined" || d.fr_visitor.length == 0) {
            $.when($.getScript(defImgPath + "js/visitor.js?v=1.5"), $.getScript(defImgPath + "/js/fp.min.js?v=1.5"), $.Deferred(function(deferred) {
                $(deferred.resolve);
            })).done(function() {
                const fpPromise = FingerprintJS.load()
                fpPromise.then(fp=>fp.get()).then(result=>{
                    fpinfo = result.visitorId
                    $.when($.getScript(defImgPath + "js/platform.js?v=1.5"), $.getScript(defImgPath + "js/crypto-js.min.js?v=1.5"), $.Deferred(function(deferred) {
                        $(deferred.resolve);
                    })).done(function() {
                        var ct = getVisitorDetails();
                        d.fr_visitor = ct;
                        d.fr_fp = fpinfo;
                        ajaxLogin(d);
                    });
                }
                )
            });
        } else {
            ajaxLogin(d);
        }
    },
    logout: function() {
        var paths = location.pathname.substring(1).split("/");
        var m = paths[0].trim().length == 2 && paths[0].trim().toLowerCase() != '4d' ? paths[0].trim() + "/" : "";
        var link = "/" + m;
        if (_User.vars.settings.redirect != undefined && _User.vars.settings.redirect.length > 0) {
            link = _User.vars.settings.redirect;
        }
        _Util.post("a/logout", {}, function() {
            agreePage = false;
            if (ui_method == 2) {
                document.location.href = link;
            } else {
                showPageContent("index");
            }
        });
    },
};
var _Wallet = {
    vars: {
        sorted: null,
        wallets: null,
        isLoadingWallet: false,
        numberFormat: true,
        isDrawingWallet: {},
        totalCount: 0,
    },
    listen: function() {
        _Wallet.listenOnBalance();
        _Wallet.listenOnSingleWalletBalance();
        _Wallet.listenOnTransfer();
    },
    getWallet: function(cb) {
        if (_Wallet.vars.isLoadingWallet) {
            setTimeout(function() {
                _Wallet.getWallet(cb);
            }, 300);
            return;
        }
        if (_Wallet.vars.wallets != null) {
            cb(_Wallet.vars.sorted, _Wallet.vars.wallets);
        } else {
            _Wallet.vars.isLoadingWallet = true;
            _Util.post("a/getWallet", {}, function(data) {
                if (data.status == "0") {
                    _Wallet.vars.isLoadingWallet = false;
                    var keysSorted = Object.keys(data.d).sort(function(a, b) {
                        return data.d[a].seq - data.d[b].seq;
                    });
                    _Wallet.vars.sorted = keysSorted;
                    _Wallet.vars.wallets = data.d;
                    cb(keysSorted, data.d);
                }
            });
        }
    },
    populateWalletOption: function(type, reload) {
        if (typeof reload == "undefined") {
            reload = false;
        }
        if (type == "from" || (type == "to" && $("#t_from").val() != "")) {
            $("#t_" + type).append('<option value = "">- ' + _lang.PLEASE_SELECT + " -</option>");
        }
        var fn = function(sorted, data) {
            $.each(sorted, function(index, wallet) {
                var d = data[wallet];
                if (d.s == "1") {
                    if (type == "from") {
                        $("#t_" + type).append($("<option></option>").attr("value", wallet).text(d.t));
                    } else if (type == "to" && wallet != $("#t_from").val() && $("#t_from").val() != "") {
                        $("#t_" + type).append($("<option></option>").attr("value", wallet).text(d.t));
                    }
                }
            });
            if (type == "from") {
                $("#t_from").change(function() {
                    $("#t_to").empty();
                    _Wallet.populateWalletOption("to");
                });
            } else if (type == "to") {
                $("#t_to").change(function() {
                    var fromW = $("#t_from").val();
                    var toW = $("#t_to").val();
                    $("#t_from_type").val(data[fromW].g);
                    $("#t_to_type").val(data[toW].g);
                });
            }
        };
        if (reload || _Wallet.vars.sorted == null) {
            _Wallet.getWallet(fn);
        } else {
            fn(_Wallet.vars.sorted, _Wallet.vars.wallets);
        }
    },
    loadWalletBalances: function(prefix, wallets, walletData, $parent) {
        var trfInTpl = $("#wallet-transfer-in-tpl").length > 0 ? $("#wallet-transfer-in-tpl").html() : '<div id="transferin_${d.wallet}" style="float:right;cursor:pointer;margin-left:5px;"><img src="' + imgPath + 'images/white_deposit.png" title="${d.title_in}"></div>';
        var trfOutTpl = $("#wallet-transfer-out-tpl").length > 0 ? $("#wallet-transfer-out-tpl").html() : '<div id="transferout_${d.wallet}" style="float:right;cursor:pointer;margin-left:5px;"><img src="' + imgPath + 'images/white_withdraw.png" title="${d.title_out}"></div>';
        settings = _Wallet.vars.settings;
        $.each(wallets, function(i, wallet) {
            walvar = wallet.toLowerCase();
            if (typeof settings.skip_ccl != "undefined") {
                if (settings.skip_ccl.indexOf(wallet) >= 0) {
                    return;
                } else if (settings.skip_ccl.indexOf('games') >= 0 && ['main'].indexOf(wallet) < 0) {
                    return;
                }
            }
            if (["ezugi", "hg"].indexOf(wallet) < 0) {
                _Util.post("a/getGameCCL", {
                    wallet: wallet
                }, function(data) {
                    var balance = data.d.ccl == null ? "0" : data.d.ccl;
                    var keyName = "w" + prefix + "_" + wallet;
                    var $row = $('[data-wallet-display="' + keyName + '"]', $parent).parents("[data-dom=ccl-row]:first");
                    $('[data-wallet-value="' + keyName + '"]', $parent).val(balance);
                    if (balance != "-9999") {
                        var displayBalance = currencyLbl + " " + parseFloat(balance).toLocaleString("en", {
                            minimumFractionDigits: _Util.displayDecimal() ? 2 : 0,
                        });
                        var displayBalanceNoCurrency = parseFloat(balance).toLocaleString("en", {
                            minimumFractionDigits: _Util.displayDecimal() ? 2 : 0,
                        });
                        if (prefix.length == 0 && ["main", "scr888"].indexOf(wallet) < 0) {
                            var d = {
                                wallet: wallet,
                                title_in: _lang.transfer_in.replace("{game}", walletData[wallet].t),
                                title_out: _lang.transfer_out.replace("{game}", walletData[wallet].t),
                            };
                            if (_Wallet.vars.settings.notransfer !== undefined && _Wallet.vars.settings.notransfer == true) {} else {
                                var trfIn = _Util.compile(trfInTpl, d);
                                var trfOut = _Util.compile(trfOutTpl, d);
                                if ($("[data-dom=transfer-wrapper]", $row).length > 0) {
                                    if (_Wallet.vars.settings.display_trf_out_first !== undefined && _Wallet.vars.settings.display_trf_out_first == true) {
                                        $('[data-dom="transfer-wrapper"]', $row).append(trfOut);
                                        $('[data-dom="transfer-wrapper"]', $row).append(trfIn);
                                    } else {
                                        $('[data-dom="transfer-wrapper"]', $row).append(trfIn);
                                        $('[data-dom="transfer-wrapper"]', $row).append(trfOut);
                                    }
                                } else {
                                    if (_Wallet.vars.settings.display_trf_out_first !== undefined && _Wallet.vars.settings.display_trf_out_first == true) {
                                        displayBalance += trfOut;
                                        displayBalance += trfIn;
                                    } else {
                                        displayBalance += trfIn;
                                        displayBalance += trfOut;
                                    }
                                }
                            }
                        }
                        $('[data-wallet-display="' + keyName + '"]', $parent).html(displayBalance);
                        $('[data-wallet-display="' + keyName + '"][data-global]').html(displayBalance);
                        $('[data-wallet-display="' + wallet + '"][data-dom="wallet-single-balance"]').html(displayBalanceNoCurrency);
                        if (_Wallet.vars.settings.whitelist !== undefined && _Wallet.vars.settings.whitelist.indexOf(wallet) >= 0) {
                            $('[data-wallet-display="' + keyName + '"]').html(displayBalance);
                            $('[data-wallet-value="' + keyName + '"]').val(balance);
                        }
                        if (_Wallet.vars.settings.notransfer !== undefined && _Wallet.vars.settings.notransfer == true) {} else {
                            $("#transferin_" + wallet).off("click");
                            $("#transferout_" + wallet).off("click");
                            $("#transferin_" + wallet, $parent).click(function() {
                                _Wallet.drawTransferTable([wallet], walletData, "in", wallet);
                            });
                            $("#transferout_" + wallet, $parent).click(function() {
                                _Wallet.drawTransferTable([wallet], walletData, "out", wallet);
                            });
                        }
                    } else {
                        if (_Wallet.vars.settings.custom_maintenance !== undefined && _Wallet.vars.settings.custom_maintenance) {
                            $('[data-wallet-display="' + keyName + '"]', $parent).html("0.00");
                            $('[data-dom="transfer-wrapper"]', $row).html(_lang.under_maintenance);
                        } else if (_Wallet.vars.settings.CustomMsg !== undefined && _Wallet.vars.settings.CustomMsg.length > 0) {
                            $('[data-wallet-display="' + keyName + '"]', $parent).html(_Wallet.vars.settings.CustomMsg);
                        } else {
                            $('[data-wallet-display="' + keyName + '"]', $parent).html(_lang.under_maintenance);
                        }
                    }
                    _Wallet.vars.totalCount--;
                    if (_Wallet.vars.totalCount == 0) {
                        var type = $parent.attr('data-dom').replace('-body', '');
                        if (typeof _Wallet.vars.isDrawingWallet[type] != 'undefined') {
                            _Wallet.vars.isDrawingWallet[type] = false;
                        }
                    }
                    _Wallet.sum(wallet, prefix, $parent);
                });
            }
        });
    },
    sum: function(wallet, prefix, $parent) {
        var total = 0;
        if ($('[data-wallet-value="' + prefix + '_total"]', $parent).length > 0 || $('[data-wallet-display="wallet-total"]').length > 0) {
            $('[data-wallet-value^="w' + prefix + '_"]', $parent).each(function() {
                var val = $(this).val();
                if (val !== "-9999") {
                    total += parseFloat(val);
                }
            });
            var s = total.toString().replace(",", "");
            var n = parseFloat(s).toFixed(_Util.displayDecimal() ? 2 : 0);
            var n = parseFloat(n).toLocaleString("en", {
                minimumFractionDigits: _Util.displayDecimal() ? 2 : 0,
            });
            $('[data-wallet-value="' + prefix + '_total"]', $parent).val(total);
            $('[data-wallet-display="' + prefix + '_total"]', $parent).html(currencyLbl + " " + n);
            $('[data-wallet-display="wallet-total"]').html(n);
        }
    },
    drawBalance: function(type) {
        if ($("[data-dom=" + type + "-body]").length == 0) {
            return;
        }
        var prefix = type == "wallet-balance" ? "cur" : "";
        var settings = $("[data-dom=" + type + "-body]").attr("data-setting") || "";
        settings = settings.length > 0 ? JSON.parse(settings) : {};
        _Wallet.vars.settings = settings;
        if (typeof _Wallet.vars.isDrawingWallet[type] != 'undefined' && _Wallet.vars.isDrawingWallet[type] == true) {
            return;
        }
        _Wallet.vars.isDrawingWallet[type] = true;
        _Wallet.vars.totalCount = 0;
        _Wallet.getWallet(function(sorted, data) {
            var rowtpl = $("#" + type + "-row-tpl").html();
            var balancetpl = $("#" + type + "-tpl").html();
            var categorytpl = $("#" + type + "-category-tpl").html();
            var body = "";
            var superwalletDownArrow = $("#wallet-superwallet-down-arrow-tpl").length > 0 ? $("#wallet-superwallet-down-arrow-tpl").html() : '+';
            var superwalletUpArrow = $("#wallet-superwallet-up-arrow-tpl").length > 0 ? $("#wallet-superwallet-up-arrow-tpl").html() : '-';
            var hasCategory = _Wallet.vars.settings.categories != undefined;
            var categoriesHtml = {};
            if (hasCategory) {
                for (var key in _Wallet.vars.settings.categories) {
                    categoriesHtml[key] = "";
                }
                $.each(sorted, function(index, wallet) {
                    var d = data[wallet];
                    _Wallet.vars.totalCount++;
                    if (typeof settings.skip != "undefined") {
                        if (settings.skip.indexOf(wallet) >= 0) {
                            return "";
                        } else if (settings.skip.indexOf('games') >= 0 && ['main'].indexOf(wallet) < 0) {
                            return "";
                        }
                    }
                    var v = {
                        prefix: prefix,
                        wallet: wallet,
                        walletName: _lang.wallet[wallet.toLowerCase()] !== undefined ? _lang.wallet[wallet.toLowerCase()] : wallet.toUpperCase(),
                    };
                    var walletDiv = _Util.compile(rowtpl, v);
                    if (_Wallet.vars.settings.seamless && _Wallet.vars.settings.seamless_tpl_id && $("#" + _Wallet.vars.settings.seamless_tpl_id).html() && wallet === 'internal') {
                        var walletList = '';
                        $.each(_lang.wallet.internal2, function(i, v) {
                            walletList += v + '<br>';
                        })
                        v = {
                            prefix: prefix,
                            wallet: wallet,
                            walletName: _lang.wallet[wallet.toLowerCase()] !== undefined ? _lang.wallet[wallet.toLowerCase()] : wallet.toUpperCase(),
                            walletList: walletList,
                        };
                        walletDiv = _Util.compile($("#" + _Wallet.vars.settings.seamless_tpl_id).html(), v);
                    }
                    for (var key in _Wallet.vars.settings.categories) {
                        var walletlist = _Wallet.vars.settings.categories[key];
                        if (walletlist.indexOf(wallet) >= 0) {
                            categoriesHtml[key] += walletDiv;
                        }
                    }
                });
                for (var key in categoriesHtml) {
                    body += _Util.compile(categorytpl, {
                        category: _lang.wallet_categories[key],
                        categoryHtml: categoriesHtml[key],
                    });
                }
            } else {
                $.each(sorted, function(index, wallet) {
                    var d = data[wallet];
                    _Wallet.vars.totalCount++;
                    if (typeof settings.skip != "undefined") {
                        if (settings.skip.indexOf(wallet) >= 0) {
                            return "";
                        } else if (settings.skip.indexOf('games') >= 0 && ['main'].indexOf(wallet) < 0) {
                            return "";
                        }
                    }
                    var v = {
                        prefix: prefix,
                        wallet: wallet,
                        walletName: _lang.wallet[wallet.toLowerCase()] !== undefined ? _lang.wallet[wallet.toLowerCase()] : wallet.toUpperCase(),
                    };
                    var walletDiv = _Util.compile(rowtpl, v);
                    if (_Wallet.vars.settings.seamless && _Wallet.vars.settings.seamless_tpl_id && $("#" + _Wallet.vars.settings.seamless_tpl_id).html() && wallet === 'internal') {
                        var walletList = '';
                        $.each(_lang.wallet.internal2, function(i, v) {
                            walletList += v + '<br>';
                        })
                        v = {
                            prefix: prefix,
                            wallet: wallet,
                            walletName: _lang.wallet[wallet.toLowerCase()] !== undefined ? _lang.wallet[wallet.toLowerCase()] : wallet.toUpperCase(),
                            walletList: walletList,
                        };
                        walletDiv = _Util.compile($("#" + _Wallet.vars.settings.seamless_tpl_id).html(), v);
                    }
                    if (typeof settings.rowwrapper != "undefined") {
                        var cur = index - 1;
                        if (cur % settings.rowmax == 0) {
                            if (cur != 0) {
                                body += "</" + settings.rowwrapper + ">";
                            }
                            body += "<" + settings.rowwrapper + ">";
                        }
                    }
                    if (typeof settings.superwallet != "undefined") {
                        var walletLbl = "";
                        if (wallet.toLowerCase() == 'internal' && _lang.wallet[wallet.toLowerCase()] !== undefined) {
                            walletLbl += subWalletATxt + '<div class="expend-internal-wallet">' + superwalletDownArrow + '</div><div class="expend-internal-content">';
                            walletLbl += "<ul>";
                            $.each(_lang.wallet[wallet.toLowerCase()], function(i, v) {
                                walletLbl += "<li>" + v + "</li>";
                            });
                            walletLbl += "</ul></div>";
                        } else {
                            walletLbl += _lang.wallet[wallet.toLowerCase()] !== undefined ? _lang.wallet[wallet.toLowerCase()] : wallet.toUpperCase();
                        }
                        var v = {
                            prefix: prefix,
                            wallet: wallet,
                            walletName: walletLbl,
                        };
                        var walletDiv = _Util.compile(rowtpl, v);
                    }
                    body += walletDiv;
                });
                if (typeof settings.rowwrapper != "undefined") {
                    body += "</" + settings.rowwrapper + ">";
                }
            }
            var html = _Util.compile(balancetpl, {
                prefix: prefix,
                balanceBody: body,
            });
            $("[data-dom=" + type + "-body]").html(html);
            $('body').undelegate('.expend-internal-wallet', 'click');
            $('.expend-internal-wallet').off('click').click(function() {
                if ($(".expend-internal-content").is(":visible")) {
                    $(".expend-internal-content").hide();
                    $(".expend-internal-wallet").html(superwalletDownArrow);
                } else {
                    $(".expend-internal-content").show();
                    $(".expend-internal-wallet").html(superwalletUpArrow);
                }
            });
            if (typeof settings.display != "undefined") {} else {
                $("[data-dom=" + type + "-body]").show();
            }
            if (_Registrar.onAfterWalletDrawn !== undefined) {
                _Registrar.onAfterWalletDrawn();
            }
            _Wallet.loadWalletBalances(prefix, sorted, data, $("[data-dom=" + type + "-body]"));
        });
    },
    startTransferAllProcess: function() {
        _Wallet.getWallet(function(sorted, data) {
            _Wallet.drawTransferTable(sorted, data, "out", "all");
        });
    },
    drawTransferTable: function(sorted, data, ttype, as) {
        var transferTableTpl = $("#transfer-all-tpl").html();
        var transferTableRowTpl = $("#transfer-all-row-tpl").html();
        var body = "";
        var processData = {};
        $.each(sorted, function(index, wallet) {
            var d = data[wallet];
            processData[wallet] = d;
            var v = {
                wallet: wallet,
                walletName: _lang.wallet[wallet.toLowerCase()] !== undefined ? _lang.wallet[wallet.toLowerCase()] : wallet.toUpperCase(),
            };
            if (["main", "ezugi", "hg"].indexOf(wallet.toLowerCase()) < 0) {
                body += _Util.compile(transferTableRowTpl, v);
            }
        });
        var html = _Util.compile(transferTableTpl, {
            balanceBody: body,
        });
        show_popup(html, "520");
        if (as == "all") {
            $("#btnTransferConfirm").click(function() {
                _Wallet.confirmTransfer(processData, ttype, as);
            });
        } else {
            $("#btnTransferConfirm").hide();
            $("#btnTransferClose").hide();
            _Wallet.confirmTransfer(processData, ttype, as);
        }
    },
    confirmTransfer: function(data, ttype, as) {
        $("#btnTransferClose").hide();
        $("#btnTransferConfirm").hide();
        if (as !== undefined && as != "all") {
            _Wallet.loopTransfer(data, ttype);
        } else {
            _Wallet.getWallet(function(sorted, wData) {
                _Wallet.loopTransfer(wData, ttype);
            });
        }
    },
    loopTransfer: function(data, ttype) {
        $.each(data, function(index, d) {
            if (["main", "ezugi", "hg"].indexOf(index.toLowerCase()) < 0) {
                $("#transfer_" + index).html(d.s != "0" ? _lang.processing + '  <img src="' + defImgPath + 'images/loading.gif" height="20" width="20" style="text-align: center;">' : _lang.under_maintenance);
                if (d.s != "0") {
                    var n = ttype == "in" ? "1" : "2";
                    _Wallet.processTransfer(index, d.g, n);
                }
            }
        });
    },
    processTransfer: function(wallet, type, action) {
        _Util.post("a/walletTransferAll", {
            product: wallet,
            product_type: type,
            action: action
        }, function(data) {
            var color = (msg = "");
            if (data.status == 0) {
                color = "green";
                msg = _lang.transfer + _lang.space + _lang.successful;
            } else if (['230', '420'].indexOf(data.status) >= 0) {
                color = "white";
                msg = data.msg;
            } else {
                color = "white";
                msg = _lang.transfer + _lang.space + _lang.fail;
            }
            var str = '<span id="transfer_' + wallet + '_status" style="color:' + color + ';">' + msg + "</span>";
            $("#transfer_" + wallet).html(str);
            $("#btnTransferClose").show();
        });
    },
    refreshCclList: function() {
        $('[data-wallet-display]').html("0.00");
        _Wallet.drawBalance("wallet-ccl");
        _Wallet.loadSingleWalletBalance();
    },
    refreshCclList2: function() {
        $('[data-wallet-display]').html("0.00");
        _Wallet.drawBalance("wallet-ccl");
        _Wallet.drawBalance("wallet-ccl2");
        _Wallet.loadSingleWalletBalance();
    },
    refreshCclList2Only: function() {
        $('[data-wallet-display]').html("0.00");
        _Wallet.drawBalance("wallet-ccl2");
        _Wallet.loadSingleWalletBalance();
    },
    listenOnSingleWalletBalance: function() {
        if ($("[data-dom=wallet-single-balance]:not(.dom-registered)").length > 0) {
            _Wallet.loadSingleWalletBalance();
        }
    },
    loadSingleWalletBalance: function() {
        $("[data-dom=wallet-single-balance]").each(function() {
            var settings = $(this).attr("data-setting") || "";
            settings = settings.length > 0 ? JSON.parse(settings) : {};
            var keyName = $(this).attr("data-wallet-display");
            if (typeof keyName === 'string' && keyName != '') {
                $('[data-wallet-display="' + keyName + '"]').html("0.00");
                _Util.post("a/getGameCCL", {
                    wallet: keyName
                }, function(data) {
                    var balance = data.d.ccl == null ? "0" : data.d.ccl;
                    if (balance != "-9999") {
                        var displayBalance = parseFloat(balance).toLocaleString("en", {
                            minimumFractionDigits: _Util.displayDecimal() ? 2 : 0,
                        });
                        $('[data-wallet-display="' + keyName + '"]').html(displayBalance);
                    } else {
                        $('[data-wallet-display="' + keyName + '"]').html(_lang.under_maintenance);
                    }
                });
            }
        });
    },
    listenOnBalance: function() {
        if ($("[data-dom=wallet-balance]:not(.dom-registered)").length > 0) {
            $("[data-dom=wallet-balance]").each(function() {
                var settings = $(this).attr("data-setting") || "";
                settings = settings.length > 0 ? JSON.parse(settings) : {};
                if (settings.hover_to_display) {
                    $(this).mouseover(function() {
                        $("[data-dom=wallet-balance-body]").html("");
                        _Wallet.drawBalance("wallet-balance");
                    });
                } else {
                    $(this).click(function() {
                        if ($("[data-dom=wallet-balance-body]").html() == "") {
                            _Wallet.drawBalance("wallet-balance");
                        } else {
                            $("[data-dom=wallet-balance-body]").html("");
                        }
                    });
                }
                $(this).addClass("dom-registered");
            });
        }
        if ($("[data-dom=wallet-ccl-body]:not(.dom-registered)").length > 0) {
            _Wallet.drawBalance("wallet-ccl");
            $("[data-dom=wallet-ccl-body]").addClass("dom-registered");
        }
        if ($("[data-dom=wallet-ccl2-body]:not(.dom-registered)").length > 0) {
            _Wallet.drawBalance("wallet-ccl2");
            $("[data-dom=wallet-ccl2-body]").addClass("dom-registered");
        }
    },
    listenOnTransfer: function() {
        if ($("[data-dom=transfer-form]:not(.dom-registered)").length > 0) {
            $("[data-dom=transfer-form]").each(function() {
                var setting = $(this).data("setting") || {};
                var _form = $(this);
                _Ruler.load(function() {
                    var r = _rules.transfer;
                    _form.validate($.extend(r, {
                        errorPlacement: function(err, $e) {
                            var name = $e.attr("name");
                            $(".form-error#" + name + "_msg:first").empty();
                            err.appendTo($(".form-error#" + name + "_msg:first"));
                            if (navigator.userAgent.indexOf("MSIE") > 0) {
                                $e.val($e.attr("placeholder"));
                            }
                        },
                        submitHandler: function(form) {
                            $("#tfButton").prop("disabled", true);
                            show_proccessing();
                            _Util.post("a/walletTransfer", $(form).serialize(), function(data) {
                                var msg = "";
                                if (data.status == 0) {
                                    $("#t_to").empty();
                                    $("#t_from").empty();
                                    $("#t_to_type").val("");
                                    $("#t_from_type").val("");
                                    $("#t_amount").val("");
                                    _Wallet.populateWalletOption("from", true);
                                    _Wallet.drawBalance("wallet-ccl");
                                    if ($("[data-dom=wallet-ccl2-body]").hasClass("dom-registered")) {
                                        setTimeout(function() {
                                            _Wallet.drawBalance("wallet-ccl2");
                                        }, 500);
                                    }
                                    msg = _lang.transfer_success;
                                    showAlertMsg(_lang.success, msg);
                                } else {
                                    msg = data.msg;
                                    showAlertMsg(_lang.status, msg);
                                }
                                close_popup();
                                $("#tfButton").prop("disabled", false);
                            });
                        },
                    }));
                });
                $(this).addClass("dom-registered");
            });
        }
    },
};
var _Deposit = {
    vars: {
        banks0: null,
        banks1: null,
        settings: {},
        promotions: null,
        counterFB: 0,
        timerFB: null,
        winFB: null,
        reloadable: true,
    },
    listen: function() {
        _Deposit.listenOnActiveDeposit();
    },
    prepareDate: function() {
        if ($("#depoDateTime").val() != "" && $("#depoDateTime").val() != null) {
            var rawDepoDate = $("#depoDateTime").val();
            var depoDateTime = rawDepoDate.split(" ");
            var depoTime = depoDateTime[1].split(":");
            var depoDate = depoDateTime[0].split("/");
            $("#depDate").val(depoDate[2] + "/" + depoDate[1] + "/" + depoDate[0]);
            $("#depTimeHH").val(depoTime[0]);
            $("#depTimeMM").val(depoTime[1]);
        }
    },
    loadPromo: function() {
        _Util.post("a/getDepositPromo", {}, function(data) {
            $("#showPromo").html("");
            var settings = $("#showPromo").data("setting") || {};
            var tpl = $("#dep-promo-tpl").html();
            var autoselect = settings.autoselect && settings.autoselect === true;
            var autoselect_method = settings.autoselect_method;
            if (data.d.promotion != undefined) {
                _Deposit.vars.promotions = data.d.promotion;
                $.each(data.d.promotion, function(i, j) {
                    var html = _Util.compile(tpl, {
                        R_PROMO_IMG: j.img,
                        R_PROMO_TITLE: j.t,
                        R_PROMO_SUB_TITLE: j.st,
                        R_PROMO_ID: j.id,
                        R_PROMO_CONTENT: j.c,
                        R_PROMO_SUB_IMG: j.simg,
                        showTnc: true,
                    });
                    $("#showPromo").append(html);
                });
            }
            var html = _Util.compile(tpl, {
                R_PROMO_TITLE: _lang.proceed_without_promotion,
                R_PROMO_SUB_TITLE: _lang.proceed_without_promotion,
                R_PROMO_ID: "0",
                showTnc: false,
            });
            if (settings.method && settings.method == "prepend") {
                $("#showPromo").prepend(html);
                if (autoselect) {
                    if (autoselect_method == "radio") {
                        $("#showPromo input:radio:first").click();
                    } else if (autoselect_method == "option") {
                        $("#showPromo option:eq(0)").attr("selected", "selected");
                    }
                }
            } else {
                $("#showPromo").append(html);
                if (autoselect) {
                    if (autoselect_method == "radio") {
                        $("#showPromo input:radio:last").click();
                    } else if (autoselect_method == "option") {
                        $("#showPromo option:eq(0)").attr("selected", "selected");
                    }
                }
            }
        });
    },
    showPg: function(pgUrl) {
        $("#btnShowPg").text(_lang.sprocessing);
        $("#btnShowPg").prop("disabled", true);
        if (_Deposit.vars.counterFB == 0) {
            _Deposit.vars.winFB = window.open(pgUrl, "Payment", "width=800,height=700,toolbar=no, location=no, menubar=0;");
            _Deposit.vars.counterFB = 1;
            _Deposit.vars.timerFB = setInterval(function() {
                _Deposit.showPg(pgUrl);
            }, 1000);
        }
        window.addEventListener("message", function(event) {
            var data = event.data
              , reloadable = data.reloadable;
            if (typeof data.reloadable !== "undefined") {
                _Deposit.vars.reloadable = reloadable;
            }
        });
        if (_Deposit.vars.counterFB > 0) {
            if (_Deposit.vars.winFB.closed) {
                _Deposit.vars.counterFB = 0;
                clearInterval(_Deposit.vars.timerFB);
                if (_Deposit.vars.settings.redirect != undefined && _Deposit.vars.settings.redirect.length > 0) {
                    setTimeout(function() {
                        location.href = _Deposit.vars.settings.redirect;
                    }, 500);
                } else {
                    if (_Deposit.vars.reloadable) {
                        location.reload();
                    }
                }
            }
        }
    },
    showPromoTnc: function(id) {
        if (_Deposit.vars.promotions != null) {
            $.each(_Deposit.vars.promotions, function(i, j) {
                if (id != j.id) {
                    return "";
                }
                var html = _Util.compile($("#dep-promo-tnc-tpl").html(), {
                    R_PROMO_IMG: j.img,
                    R_PROMO_TITLE: j.t,
                    R_PROMO_ID: j.id,
                    R_PROMO_CONTENT: j.c,
                    R_PROMO_SUB_IMG: j.simg,
                });
                $("#promotc").html(html);
            });
        }
    },
    getBanks: function(type, cb, errcb) {
        if (type.length == 0 || type == null) {
            return;
        }
        if (_Deposit.vars["banks" + type] != null) {
            cb(_Deposit.vars["banks" + type]);
        } else {
            _Util.post("a/getBanks", {
                btype: type
            }, function(data) {
                if (data.status == "0") {
                    _Deposit.vars["banks" + type] = data.d;
                    cb(data.d);
                } else if (errcb != undefined) {
                    errcb(data);
                }
            });
        }
    },
    prepareBank: function(type) {
        var prefix = "";
        if (type == "0") {
            $("div.payment-gateway").hide();
            $("div.bank-deposit").show();
            prefix = "bank";
        } else if (type == "1") {
            $("div.bank-deposit").hide();
            $("div.payment-gateway").show();
            $("#depMinMaxAmount").empty();
            prefix = "pgBank";
        }
        _Deposit.getBanks(type, function(data) {
            $("#" + prefix + "Id").empty().append('<option value = "">- ' + _lang.PLEASE_SELECT + " -</option>");
            for (var i = 0; i < data.bankseq.length; i++) {
                var v = data.bankseq[i];
                $("#" + prefix + "Id").append($("<option></option>").attr("value", v).text(data.bank[v]));
            }
            $("#" + prefix + "Id").unbind();
            $("#" + prefix + "Id").on("change", function() {
                var val = $(this).val();
                $("#pgMinAmount").text("");
                if (val != "") {
                    _Deposit.prepareBankAccount(type, val);
                } else {
                    if (type == "0") {
                        $("#showBank").html("");
                    }
                }
            });
        });
    },
    prepareBankAccount: function(type, val) {
        var cb = function(type, data) {
            var prefix = "";
            if (type == "0") {
                prefix = "bankAcc";
            } else if (type == "1") {
                prefix = "pgBankAcc";
            }
            $("#" + prefix + "Id").val(data.bankAccId);
            if (type == "1") {
                $("#pgMinAmount").text(_lang.pg_min_deposit + data.minT);
                $("#pgBankOption").empty().append('<option value = "">- ' + _lang.PLEASE_SELECT + " -</option>");
                $("#depMinMaxAmount").html(_lang.min_max_limit.replace("##SYSMIN##", data.rMinT).replace("##SYSMAX##", data.rMaxT));
                var firstvar = 0;
                $.each(data.banklist, function(i, d) {
                    $("#pgBankOption").append("<option value='" + i + "'>" + d + "</option>");
                    if (firstvar == 0) {
                        firstvar = i;
                    }
                });
                $("#pgBankOption").val(firstvar).change();
            } else if (type == "0") {
                var tpl = $("#bank-info-tpl").html();
                var html = _Util.compile(tpl, {
                    bankName: $("#bankId").find('option[value="' + val + '"]').text(),
                    bankCom: data.bankName,
                    bankAccName: data.bankAccName,
                    bankAccNo: data.bankAccNo,
                    rMinT: data.rMinT,
                    rMaxT: data.rMaxT,
                });
                $("#showBank").html(html);
            }
        };
        if (_Deposit.vars["bankAccount" + type + "_" + val] != null) {
            cb(type, _Deposit.vars["bankAccount" + type + "_" + val]);
        } else {
            _Util.post("a/getBankAccount", {
                bankId: val
            }, function(data) {
                if (data.status == "0") {
                    _Deposit.vars["bankAccount" + type + "_" + val] = data.d;
                    cb(type, data.d);
                }
            });
        }
    },
    showSuccess: function() {
        var msg;
        if (_lang.dps_ok_msg.indexOf('XXX') >= 0) {
            msg = _lang.dps_ok_msg.replace('XXX', _Deposit.vars.trxId);
        } else {
            msg = _lang.dps_ok_msg + _Deposit.vars.trxId;
        }
        showAlertMsg(_lang.deposit_status, msg);
        setTimeout(function() {
            location.href = _Deposit.vars.settings.redirect;
        }, 5000);
    },
    uploadRec: function() {
        show_proccessing();
        var formData = new FormData($("#recUploadForm")[0]);
        $.ajax({
            type: "POST",
            url: "https://uploadv2.asiacdnpop.net/uploadv2.php",
            data: formData,
            async: true,
            dataType: "json",
            cache: false,
            contentType: false,
            processData: false,
        }).complete(function(data) {
            _Deposit.showSuccess();
            close_popup();
        });
    },
    checkBankLevel: function(reload) {
        if (reload === undefined)
            reload = false;
        _Deposit.getBanks("0", function(data) {
            if (Object.keys(data).length > 0) {
                $("#paymentMethod").append($("<option></option>").attr("value", "0").text(_lang.direct_deposit));
                $('#paymentMethod option[value="0"]').prop("selected", true);
                _Deposit.prepareBank("0");
            }
        });
        _Deposit.getBanks("1", function(data) {
            if (Object.keys(data).length > 0) {
                $("#paymentMethod").append($("<option></option>").attr("value", "1").text(_lang.payment_gateway));
                $('#paymentMethod option[value="1"]').prop("selected", true);
                _Deposit.prepareBank("1");
            }
        });
    },
    listenOnPaymentMethod: function() {
        $("#paymentMethod").change(function() {
            $("#pgMinAmount").text("");
            var method = $(this).val();
            _Deposit.prepareBank(method);
        });
    },
    listenOnActiveDeposit: function() {
        if (typeof singleDeposit !== "undefined" && singleDeposit === "1") {
            $.ajax({
                type: "POST",
                url: "a/getActiveDeposit",
                dataType: "json",
            }).complete(function(data) {
                if (data.responseJSON.d.active == "1") {
                    $("[data-dom=deposit-form-wrapper]").html($("#dep-active-tpl").html());
                } else {
                    _Deposit.listenOnDeposit();
                }
            });
        } else {
            _Deposit.listenOnDeposit();
        }
    },
    listenOnDeposit: function() {
        if ($("[data-dom=deposit-form]:not(.dom-registered)").length > 0) {
            checkAjaxStatus(_lang.deposit_forbidden_error_alert);
            _Deposit.loadPromo();
            _Deposit.checkBankLevel();
            _Deposit.listenOnPaymentMethod();
            $("[data-dom=deposit-form]").each(function() {
                var setting = $(this).data("setting") || {};
                _Deposit.vars.settings = setting;
                var _form = $(this);
                _Ruler.load(function() {
                    var r = _rules.deposit;
                    _form.validate($.extend(r, {
                        errorPlacement: function(err, $e) {
                            var name = $e.attr("name");
                            $(".form-error#" + name + "_msg:first").empty();
                            err.appendTo($(".form-error#" + name + "_msg:first"));
                            if (navigator.userAgent.indexOf("MSIE") > 0) {
                                $e.val($e.attr("placeholder"));
                            }
                        },
                        submitHandler: function(form) {
                            _Deposit.prepareDate();
                            $("#dpButton", $(form)).prop("disabled", true);
                            var selectedVal = "0";
                            selectedVal = $("#paymentMethod", $(form)).val();
                            if (typeof setting.form_version !== "undefined" && setting.form_version == "v3") {
                                var link = selectedVal == "1" ? "a/makePDeposit" : "a/makeBDepositV3";
                            } else {
                                var link = selectedVal == "1" ? "a/makePDeposit" : "a/makeBDeposit";
                            }
                            show_proccessing();
                            if (typeof _ctrl !== "undefined" && _ctrl !== null) {
                                if (typeof _ctrl.track == "function") {
                                    _ctrl.track("deposit_event", "9", "amount", 0);
                                }
                            }
                            _Util.post(link, $(form).serialize(), function(data) {
                                var msg = "";
                                if (data.status == 0) {
                                    _Deposit.vars.trxId = data.d.transId;
                                    if (selectedVal == "1") {
                                        var tpl = $("#pg-tpl").html();
                                        var html = _Util.compile(tpl, {
                                            R_PGURL: data.d.pgUrl,
                                        });
                                        $("[data-dom=deposit-form-wrapper]").html("");
                                        $("[data-dom=deposit-form-wrapper]").html(html);
                                        $("html,body").scrollTop($("[data-dom=deposit-form-wrapper]").position().top);
                                    } else if (selectedVal == "0") {
                                        if ($("#rec-upload-tpl").length > 0) {
                                            var tpl = $("#rec-upload-tpl").html();
                                            var html = _Util.compile(tpl, {
                                                transid: data.d.transId,
                                                token: data.d.token,
                                                ticketid: data.d.transId,
                                            });
                                            $("[data-dom=deposit-form-wrapper]").html("");
                                            $("[data-dom=deposit-form-wrapper]").html(html);
                                            if ($("#upload-receipt-name").length) {
                                                $("#receipt").change(function() {
                                                    var receiptFileName = $("#receipt")[0].files[0].name;
                                                    $("#upload-receipt-name").html(receiptFileName);
                                                });
                                            }
                                        } else {
                                            var receiptFiles = $("#receipt").length > 0 ? $("#receipt").get(0).files : [];
                                            if (receiptFiles.length > 0) {
                                                var formData = new FormData();
                                                formData.append("receipt", $("#receipt")[0].files[0]);
                                                formData.append("token", data.d.token);
                                                formData.append("t", data.d.transId);
                                                show_proccessing();
                                                $.ajax({
                                                    type: "POST",
                                                    url: "https://uploadv2.asiacdnpop.net/uploadv2.php",
                                                    data: formData,
                                                    async: true,
                                                    dataType: "json",
                                                    cache: false,
                                                    contentType: false,
                                                    processData: false,
                                                }).complete(function(data) {
                                                    _Deposit.showSuccess();
                                                    close_popup();
                                                });
                                            } else {
                                                _Deposit.showSuccess();
                                            }
                                        }
                                    } else if (selectedVal == "00") {
                                        _Deposit.showSuccess();
                                    }
                                    if (typeof _ctrl !== "undefined" && _ctrl !== null) {
                                        if (typeof _ctrl.track == "function") {
                                            _ctrl.track("confirmation_page", "10", "trans_value", data);
                                        }
                                    }
                                } else {
                                    msg = _lang.dps_failed_msg + "<br/>" + data.msg;
                                    showAlertMsg(_lang.deposit_status, msg);
                                }
                                close_popup();
                                $("#dpButton", $(form)).prop("disabled", false);
                            });
                        },
                    }));
                });
                $(this).addClass("dom-registered");
            });
        }
    },
};
var _Withdrawal = {
    vars: {
        banks: null,
        trxId: null,
        settings: {},
    },
    listen: function() {
        _Withdrawal.listenOnWithdrawal();
    },
    prepareBank: function(reload) {
        if (typeof reload == "undefined")
            reload = false;
        var fn = function(data) {
            $("#baBankId").empty();
            $("#baBankId").append('<option value = "">- ' + _lang.PLEASE_SELECT + " -</option>");
            $.each(data.bank, function(i, d) {
                $("#baBankId").append($("<option></option>").attr("value", i).text(d));
            });
        };
        if (reload || _Withdrawal.vars.banks == null) {
            _Util.post("a/getAllBanks", {
                btype: 0
            }, function(data) {
                if (data.status == "0") {
                    _Withdrawal.vars.banks = data.d;
                    fn(data.d);
                }
            });
        } else {
            fn(_Withdrawal.vars.banks);
        }
    },
    loadBankAccounts: function() {
        _Util.post("a/getMyBankAccVerified", {}, function(data) {
            if (data.status == "0") {
                if (data.d.BankAcc.count > 0) {
                    $("[data-dom=withdrawal-form] #bankAccId").empty();
                    $("[data-dom=withdrawal-form] #bankAccId").append('<option value = "">- ' + _lang.PLEASE_SELECT + " -</option>");
                    $.each(data.d.BankAcc.Acc, function(i, d) {
                        $("[data-dom=withdrawal-form] #bankAccId").append($("<option></option>").attr("value", d.bankaccountindex).text(d.bankname + " " + d.bankaccountno));
                    });
                } else {
                    $("#bankSelectitwo").click();
                }
            }
        });
    },
    listenOnSelectionChange: function() {
        $('input[type="radio"]', $("[data-dom=withdrawal-form]")).click(function() {
            var val = $(this).attr("value");
            if (val == "e") {
                $("[data-dom=withdrawal-form] #bankAccId").html("");
                _Withdrawal.loadBankAccounts();
            } else if (val == "n") {
                $("#baBankId").html("");
                $("#baNo").val("");
                _Withdrawal.prepareBank();
            }
            var $target = $("." + val);
            $(".witbox").not($target).slideUp(300);
            $target.slideDown(300);
        });
    },
    listenOnWithdrawal: function() {
        if ($("[data-dom=withdrawal-form]:not(.dom-registered)").length > 0) {
            _Withdrawal.prepareBank();
            _Withdrawal.listenOnSelectionChange();
            $("[data-dom=withdrawal-form]").each(function() {
                var setting = $(this).data("setting") || {};
                _Withdrawal.vars.settings = setting;
                var _form = $(this);
                _Ruler.load(function() {
                    var r = _rules.withdrawal;
                    _form.validate($.extend(r, {
                        errorPlacement: function(err, $e) {
                            var name = $e.attr("name");
                            $(".form-error#" + name + "_msg:first").empty();
                            err.appendTo($(".form-error#" + name + "_msg:first"));
                            if (navigator.userAgent.indexOf("MSIE") > 0) {
                                $e.val($e.attr("placeholder"));
                            }
                        },
                        submitHandler: function(form) {
                            $("#wdButton", $(form)).prop("disabled", true);
                            show_proccessing();
                            var wlink = setting.withdrawalV2 == true ? "a/makeWithdrawalV2" : "a/makeWithdrawal";
                            _Util.post(wlink, $(form).serialize(), function(data) {
                                var msg = "";
                                if (data.status == 0) {
                                    _Withdrawal.vars.trxId = data.d.transId;
                                    msg = _lang.withdraw_ok_msg.replace(/\\n/g, "\n");
                                    if (msg.indexOf('XXX') >= 0) {
                                        msg = msg.replace('XXX', data.d.transId);
                                    } else {
                                        msg += data.d.transId;
                                    }
                                    _Wallet.refreshCclList();
                                    $(form).find("textarea, :text, select").val("");
                                    $(".form-error").html("");
                                    if (_Withdrawal.vars.settings.redirect != undefined && _Withdrawal.vars.settings.redirect.length > 0) {
                                        setTimeout(function() {
                                            location.href = _Withdrawal.vars.settings.redirect;
                                        }, 5000);
                                    } else {
                                        setTimeout(function() {
                                            location.reload();
                                        }, 5000);
                                    }
                                } else {
                                    msg = _lang.withdraw_failed_msg.replace(/\\n/g, "\n") + data.msg;
                                }
                                showAlertMsg(_lang.status, msg);
                                close_popup();
                                $("#wdButton", $(form)).prop("disabled", false);
                            });
                        },
                    }));
                });
                $(this).addClass("dom-registered");
            });
        }
    },
};
