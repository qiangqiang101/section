var pWidth;
var pHeight;
var scrollBar;
var mGameWindow;
var gameWindowName;
var isMobile = false;
var checkBal = false;
var getAllAccInfoDone = false;
mGameWindow = true;
gameWindowName = "GameWindow";
gameTabName = "_blank";
scrollBar = 0;
var dtflag;
openGameLink = function(gametype, gamecode, gamevendor, ff, width, height) {
    if (agreePage) {
        alert(agreeMsg);
    } else {
        if (loginFlag) {
            pWidth = width;
            pHeight = height;
            openGameProcedure(gametype, gamecode, gamevendor, ff);
        } else {
            alert(loginFirstMsg);
        }
    }
}
;
openGameProcedure = function(gametype, gamecode, gamevendor, ff) {
    if (mGameWindow)
        gameWindowName = "GameWindow" + Math.floor(Math.random() * 1000 + 1);
    launchGame(gameWindowName, gametype, gamecode, gamevendor, ff, true);
}
;
launchGame = function(target, gametype, gamecode, gamevendor, ff, checkBal) {
    var postfix = window.location.href.indexOf(".html") > -1 ? ".html" : "";
    if (target != "") {
        window.open("", target, "width=" + pWidth + ",height=" + pHeight + ",scrollbars=" + scrollBar + ",resizable=1,menubar=0;").focus();
    }
    submitForm("gameLaunch" + postfix, target, {
        ap: "1",
        gt: gametype,
        gc: gamecode,
        gp: gamevendor,
        ff: ff,
        scroll: scrollBar,
        isMobile: isMobile,
        checkBal: checkBal,
    });
}
;
launchGamesUrl = function(gdata) {
    var postfix = window.location.href.indexOf(".html") > -1 ? ".html" : "";
    var ra = gdata.split("::");
    if (ra[2] != "DC" && (ra[1] == "sports" || ra[1] == "es")) {
        window.open("launchinggame" + postfix + "?ap=1&sub=" + gdata, gameTabName);
    } else {
        if (loginFlag) {
            window.open("launchinggame" + postfix + "?ap=1&sub=" + gdata, gameTabName);
        } else {
            alert(loginFirstMsg);
        }
    }
}
;
getGameUrl = function(id, gt, gc, gp, ff) {
    var cclcheck = dtflag == "1" && !isMobile && checkBal ? "1" : "0";
    var trf = window._autoTransferGameCL || false;
    var finishedTransfer = false;
    var tmpData = null;
    var execution = function(data) {
        var proceed = true;
        if (data.status == "0") {
            var gameUrl = data.d.game.url;
            if (gameUrl == "u_under" || gameUrl == "u_blocked") {
                gameUrl += ".html";
            }
            if (cclcheck == "1") {
                if (ff != "true" && ff != "1") {
                    if (data.d.transfer == "1") {
                        proceed = false;
                        var to = data.d.game.transferTo;
                        var toType = data.d.game.transferToType;
                        launchTransferCL(gt, gc, gp, ff, to, toType, gameUrl);
                    }
                }
            }
            if (proceed) {
                executeFunctionByName(id, window, gameUrl);
            }
        }
    };
    var fn = function() {
        finishedTransfer = true;
        execution(tmpData);
    };
    if (trf) {
        doTransferToMain(function() {
            fn();
        });
    }
    $.ajax({
        type: "POST",
        url: "a/getGameUrl",
        data: {
            gt: gt,
            gc: gc,
            gp: gp,
            ff: ff,
            cclcheck: cclcheck
        },
        dataType: "json",
    }).success(function(data) {
        if (trf) {
            tmpData = data;
            if (finishedTransfer) {
                execution(tmpData);
            }
        } else {
            execution(data);
        }
    });
}
;
getGameUrlR = function(gt, gc, gp, ff, callback, checkBal) {
    var cclcheck = dtflag == "1" && checkBal ? "1" : "0";
    var trf = window._autoTransferGameCL || false;
    var finishedTransfer = false;
    var tmpData = null;
    var execution = function(data) {
        var proceed = true;
        if (data.status == "0") {
            var gameUrl = data.d.game.url;
            if (gameUrl == "u_under" || gameUrl == "u_blocked") {
                gameUrl += ".html";
            }
            if (cclcheck == "1") {
                if (ff != "true" && ff != "1") {
                    if (data.d.transfer == "1") {
                        proceed = false;
                        var to = data.d.game.transferTo;
                        var toType = data.d.game.transferToType;
                        GamelaunchTransferCL(gt, gc, gp, ff, to, toType, gameUrl);
                    }
                }
            }
            if (proceed) {
                callback(gameUrl);
                return gameUrl;
            }
        }
    };
    var fn = function() {
        finishedTransfer = true;
        execution(tmpData);
    };
    if (trf) {
        doTransferToMain(function() {
            fn();
        });
    }
    $.ajax({
        type: "POST",
        url: "a/getGameUrl",
        data: {
            gt: gt,
            gc: gc,
            gp: gp,
            ff: ff,
            cclcheck: cclcheck
        },
        dataType: "json",
    }).success(function(data) {
        if (trf) {
            tmpData = data;
            if (finishedTransfer) {
                execution(tmpData);
            }
        } else {
            execution(data);
        }
    });
}
;
GamelaunchTransferCL = function(gt, gc, gp, ff, to, toType, gameUrl) {
    var launchPage = function() {
        var mainccl = 0;
        $.ajax({
            type: "POST",
            url: "a/getGameCCL",
            data: {
                wallet: "main"
            },
            dataType: "json",
        }).success(function(data) {
            mainccl = data.d.ccl;
            if (window.location.href.indexOf(".html") > -1) {
                submitForm("gametransfer_cl.html", "_self", {
                    ap: "1",
                    mc: mainccl,
                    gt: gt,
                    gc: gc,
                    gp: gp,
                    ff: ff,
                    to: to,
                    toType: toType,
                    scroll: scrollBar,
                    gameUrl: gameUrl,
                });
            } else {
                submitForm("gametransfer_cl", "_self", {
                    ap: "1",
                    mc: mainccl,
                    gt: gt,
                    gc: gc,
                    gp: gp,
                    ff: ff,
                    to: to,
                    toType: toType,
                    scroll: scrollBar,
                    gameUrl: gameUrl,
                });
            }
        });
    };
    launchPage();
}
;
launchTransferCL = function(gt, gc, gp, ff, to, toType, gameUrl) {
    var trf = window._autoTransferGameCL || false;
    var launchPage = function() {
        var mainccl = 0;
        $.ajax({
            type: "POST",
            url: "a/getGameCCL",
            data: {
                wallet: "main"
            },
            dataType: "json",
        }).success(function(data) {
            mainccl = data.d.ccl;
            if (window.location.href.indexOf(".html") > -1) {
                submitForm("transfer_cl.html", "_self", {
                    ap: "1",
                    mc: mainccl,
                    gt: gt,
                    gc: gc,
                    gp: gp,
                    ff: ff,
                    to: to,
                    toType: toType,
                    scroll: scrollBar,
                    gameUrl: gameUrl,
                });
            } else {
                submitForm("transfer_cl", "_self", {
                    ap: "1",
                    mc: mainccl,
                    gt: gt,
                    gc: gc,
                    gp: gp,
                    ff: ff,
                    to: to,
                    toType: toType,
                    scroll: scrollBar,
                    gameUrl: gameUrl,
                });
            }
        });
    };
    launchPage();
}
;
getTransferCLData = function(id, gt) {
    $.ajax({
        type: "POST",
        url: "a/transferCL",
        data: {
            gt: gt
        },
        dataType: "json",
    }).success(function(data) {
        if (data.status == "0") {
            executeFunctionByName(id, window, data.d);
        }
    });
}
;
chkmaintenance = function(chkgame) {
    if (loginFlag) {
        $.ajax({
            type: "POST",
            url: "a/checkMaintenance",
            data: {
                game: chkgame
            },
            dataType: "json",
        }).success(function(data) {
            if (data.d.status == true) {
                alert(maintenance_msg);
            } else {
                getAccInfo(chkgame);
            }
        });
    } else {
        alert(loginFirstMsg);
    }
}
;
getAccInfo = function(prodgame) {
    $.ajax({
        type: "POST",
        url: "a/getAllAccPass",
        dataType: "json",
    }).success(function(data) {
        if (data.status == "0") {
            $.each(data.d, function(xid, info) {
                if (xid == prodgame) {
                    if (info.username != "") {
                        $("#" + prodgame + "_username").val(info.username);
                        $("#" + prodgame + "_password").val(info.password);
                    }
                }
            });
            if (typeof gpIsAvailable !== 'undefined' && gpIsAvailable && typeof data.d['gp'] == 'undefined') {
                getGpAccPass();
            }
        }
    });
}
;
getAllAccInfo = function(data) {
    if (data !== undefined) {
        resp = $.parseJSON(data);
        if (resp.status == "0") {
            $.each(resp.d, function(xid, info) {
                if (info.username != "") {
                    $("#" + xid + "_username").val(info.username);
                    $("#" + xid + "_password").val(info.password);
                    if (typeof info.username !== 'undefined' && typeof info.password !== 'undefined' && info.username != null && info.password != null) {
                        $("#" + xid + "_chgpass_btn_note").hide();
                        $("#" + xid + "_chgpass_btn").show();
                    }
                }
            });
            if (typeof gpIsAvailable !== 'undefined' && gpIsAvailable && typeof resp.d['gp'] == 'undefined') {
                getGpAccPass();
            }
        }
        getAllAccInfoDone = true;
    }
}
;
function getGpAccPass() {
    $.ajax({
        type: "POST",
        url: "a/getGpDownload",
        dataType: "json",
    }).success(function(data) {
        if (data.status == "0") {
            $("#gp_username").val(data.d.username);
            $("#gp_password").val(data.d.nowpass);
            if (typeof data.d.username !== 'undefined' && typeof data.d.nowpass !== 'undefined' && data.d.username != null && data.d.nowpass != null) {
                $("#gp_chgpass_btn_note").hide();
                $("#gp_chgpass_btn").show();
            }
        }
    })
}
function doTransferToMain(cb) {
    var doTransfer = function(data) {
        if (data.status == "0") {
            var counts = 0;
            for (var k in data.d) {
                if (k == "main") {
                    continue;
                }
                var v = data.d[k];
                if (v.s == "1") {
                    counts++;
                }
            }
            var done = 0;
            for (var k in data.d) {
                var v = data.d[k];
                if (k == "main" || v.s == "0") {
                    continue;
                }
                (function(key, value) {
                    $.ajax({
                        type: "POST",
                        url: "a/walletTransferAll",
                        data: {
                            product: key,
                            product_type: value.g,
                            action: "2",
                        },
                        dataType: "json",
                        success: function() {
                            done++;
                            if (done == counts) {
                                cb();
                            }
                        },
                        error: function() {
                            done++;
                            if (done == counts) {
                                cb();
                            }
                        },
                    });
                }
                )(k, v);
            }
        }
    };
    $.ajax({
        type: "POST",
        url: "a/getWallet",
        dataType: "json",
        success: function(data) {
            doTransfer(data);
        },
    });
}
