openSubLink = function(paraP, paraK) {
    if (agreePage) {
        alert(agreeMsg);
    } else {
        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", "opWallet");
        form.setAttribute("target", "Wallet System");
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", "page");
        hiddenField.setAttribute("value", paraP);
        form.appendChild(hiddenField);
        document.body.appendChild(form);
        var hiddenField2 = document.createElement("input");
        hiddenField2.setAttribute("type", "hidden");
        hiddenField2.setAttribute("name", "key");
        hiddenField2.setAttribute("value", paraK);
        form.appendChild(hiddenField2);
        document.body.appendChild(form);
        var hiddenField2 = document.createElement("input");
        hiddenField2.setAttribute("type", "hidden");
        hiddenField2.setAttribute("name", "ap");
        hiddenField2.setAttribute("value", '1');
        form.appendChild(hiddenField2);
        document.body.appendChild(form);
        window.open('', 'Wallet System', 'width=930,height=650,scrollbars=0,resizable=1,menubar=0;').focus();
        form.submit();
    }
}
generateTransferTable = function(walletData, refresh) {
    var walletLbl = '';
    var str = '';
    str = '<div style="position:relative;"><table border="0" cellspacing="0" cellpadding="0" class="tblTransferAll">';
    str += '<tr><td class="thWallet">' + wallet_cap + '</td><td class="thStatus">' + status_cap + '</td></tr>';
    $.each(walletData, function(index, d) {
        if (index.toLowerCase() != 'main' && index.toLowerCase() != 'ezugi' && index.toLowerCase() != 'hg') {
            walletLbl = product_cap[index.toLowerCase()] !== undefined ? product_cap[index.toLowerCase()] : index.toUpperCase();
            str += '<tr><td class="tdWallet"><input type="hidden" name="transfer_bal_' + index + '" id="transfer_bal_' + index + '" value="0"><span>' + walletLbl + '</span></td><td class="tdStatus"><span id="transfer_' + index + '" style="padding:10px;text-align:center;"></span></td></tr>';
        }
    });
    str += '</table><br>';
    str += '<div id="divTransferClose" style="position:relative;bottom:5px;text-align:center;"><a name="btnTransferConfirm" id="btnTransferConfirm" class="btnTransferConfirm" href="javascript:void(0)">' + confirm_cap + '</a>&nbsp;<a name="btnTransferClose" id="btnTransferClose" class="btnTransferClose" href="javascript:void(0)" onclick="close_popup();' + refresh + '();">' + close_cap + '</a></div>';
    str += '</div>';
    show_popup(str, '520');
}
startTransferAllProcess = function(refresh) {
    $.ajax({
        type: 'POST',
        url: 'a/getWallet',
        dataType: 'json'
    }).success(function(data) {
        if (data.status == '0') {
            if (typeof (drawTransferTableCustom) == typeof (Function)) {
                drawTransferTableCustom(data.d);
            } else {
                drawTransferTable(data.d, refresh);
            }
        }
    });
}
drawTransferTable = function(walletData, refresh) {
    generateTransferTable(walletData, refresh);
    $("#btnTransferConfirm").click(function() {
        confirmTransfer(walletData);
    });
}
confirmTransfer = function(walletData) {
    $.each(walletData, function(index, d) {
        if (index.toLowerCase() != 'main' && index.toLowerCase() != 'ezugi' && index.toLowerCase() != 'hg') {
            if (d.s != '0') {
                $("#transfer_" + index).html(processing + '&nbsp;&nbsp;<img height="16px" width="16px" src="' + imgPath + 'images/loading.gif" style="text-align: center;">');
            } else {
                $("#transfer_" + index).html(underMain);
            }
        }
    });
    $.each(walletData, function(index, d) {
        if (index.toLowerCase() != 'main' && index.toLowerCase() != 'ezugi' && index.toLowerCase() != 'hg') {
            if (d.s != '0')
                processTransfer(index, d.g);
        }
    });
}
processTransfer = function(wallet, type) {
    $.ajax({
        type: 'POST',
        url: 'a/walletTransfer',
        data: {
            t_from: wallet,
            t_to: 'main',
            t_from_type: type,
            t_to_type: 'main',
            t_amount: '1',
            t_transferall: '1'
        },
        dataType: 'json'
    }).success(function(data) {
        var str = '';
        if (data.status == 0) {
            str = '<span id="transfer_' + wallet + '_status" style="color:green;">' + transfer_successful + '</span>';
        } else if (data.status == 230) {
            str = '<span id="transfer_' + wallet + '_status" style="color:white;">' + data.msg + '</span>';
        } else {
            str = '<span id="transfer_' + wallet + '_status" style="color:red;">' + transfer_fail + '</span>';
        }
        $("#transfer_" + wallet).html(str);
    });
}
newstartTransferAllProcess = function(refresh) {
    $.ajax({
        type: 'POST',
        url: 'a/getWallet',
        dataType: 'json'
    }).success(function(data) {
        if (data.status == '0') {
            if (typeof (newdrawTransferTableCustom) == typeof (Function)) {
                newdrawTransferTableCustom(data.d);
            } else {
                newdrawTransferTable(data.d, refresh, 'out', 'all');
            }
        }
    });
}
newdrawTransferTable = function(walletData, refresh, ttype, as) {
    generateTransferTable(walletData, refresh);
    if (as == 'all') {
        $("#btnTransferConfirm").click(function() {
            newconfirmTransfer(walletData, ttype, as);
        });
    } else {
        $("#btnTransferConfirm").hide();
        $("#btnTransferClose").hide();
        newconfirmTransfer(walletData, ttype, as);
    }
}
newconfirmTransfer = function(walletData, ttype, as) {
    $("#btnTransferClose").hide();
    $("#btnTransferConfirm").hide();
    if (as !== undefined && as != 'all') {
        loopTransfer(walletData, ttype);
    } else {
        $.ajax({
            type: 'POST',
            url: 'a/getWallet',
            dataType: 'json'
        }).success(function(data) {
            if (data.status == '0') {
                var walletData = new Object();
                walletData = data.d;
                loopTransfer(walletData, ttype);
            }
        });
    }
}
loopTransfer = function(walletData, ttype) {
    $.each(walletData, function(index, d) {
        if (index.toLowerCase() != 'main' && index.toLowerCase() != 'ezugi' && index.toLowerCase() != 'hg') {
            if (d.s != '0') {
                $("#transfer_" + index).html(processing + '&nbsp;&nbsp;<img src="' + imgPath + 'images/loading.gif" style="text-align: center; width: 16px; height: 16px;">');
            } else {
                $("#transfer_" + index).html(underMain);
            }
        }
    });
    $.each(walletData, function(index, d) {
        if (index.toLowerCase() != 'main' && index.toLowerCase() != 'ezugi' && index.toLowerCase() != 'hg') {
            if (d.s != '0') {
                if (ttype !== undefined) {
                    if (ttype == 'in') {
                        newprocessTransfer(index, d.g, '1');
                    } else if (ttype == 'out') {
                        newprocessTransfer(index, d.g, '2');
                    }
                } else {
                    newprocessTransfer(index, d.g, '1');
                }
            }
        }
    });
}
newprocessTransfer = function(wallet, type, action) {
    $.ajax({
        type: 'POST',
        url: 'a/walletTransferAll',
        data: {
            product: wallet,
            product_type: type,
            action: action
        },
        dataType: 'json'
    }).success(function(data) {
        var str = '';
        if (data.status == 0) {
            str = '<span id="transfer_' + wallet + '_status" style="color:green;">' + transfer_successful + '</span>';
        } else if (data.status == 230) {
            str = '<span id="transfer_' + wallet + '_status" style="color:white;">' + data.msg + '</span>';
        } else {
            str = '<span id="transfer_' + wallet + '_status" style="color:red;">' + transfer_fail + '</span>';
        }
        $("#transfer_" + wallet).html(str);
        $("#btnTransferClose").show();
    });
}
