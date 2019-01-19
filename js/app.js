const chainId = "d5a3d18fbb3c084e3b1f3fa98c21014b5f3db536cc15d08f9f6479517c6a3d86";
const host = "api.bossweden.org";
const network = {
    blockchain: 'eos',
    host: host,
    port: 443,
    chainId: chainId
}
const eosOptions = {
    broadcast: true,
    sign: true,
    chainId: chainId,
}

var account;

/* setTimeout(function () {
    $(".login_btn").click();
}, 2000); */

// scatter登录
function getScatterUser() {
    if (window["scatter"]) {
        return window["scatter"].suggestNetwork(network)
            .then(() => {
                console.log("load network.")
                return window["scatter"].getIdentity({
                    accounts: [network]
                });
            }, err => {
                return Promise.reject(err);
            }).then(identity => {
                console.log("=======", identity)
                account = identity.accounts[0];
                return identity.accounts[0];
            }, err => {
                return Promise.reject(err);
            });
    } else {
        weui.toast("Scatter not loaded!");
        return Promise.reject("Scatter not loaded!");
    }
};

function getEOSjacksData() {
    let action =
    {
        "account": "eosjacksjack",
        "name": "claimbos",
        "authorization": [{
            "actor": account.name,
            "permission": account.authority
        }],
        "data": {
            "from": account.name
        }
    }
    return action;
}

function getMixData() {
    let action =
    {
        "account": "bosmixsystem",
        "name": "claim",
        "authorization": [{
            "actor": account.name,
            "permission": account.authority
        }],
        "data": {
            "user": account.name
        }
    }
    return action;
}

//点击登录(scatter)
$(".login_btn").on("click", function () {
    getScatterUser().then(user => {
        console.log(user);
        $(".account-name").val(user.name);
        $(".is-login").show();
        $(".login-area").hide();
    });
})

// 退出登录
$(".logout_btn").on("click", function () {
    account = undefined;
    $(".login-area").show();
    $(".is-login").hide();

    window["scatter"].forgetIdentity().then(() => { })
});

$(".info_btn").on("click", function () {
    window.open("https://bos.eosx.io/account/" + account.name, '_blank');
})

$(".claim").on("click", function () {
    if (account) {
        console.log($(this).text());
        let eos = window.scatter.eos(network, Eos, eosOptions, "https");
        var loading = weui.loading('生成交易', {
            className: 'custom-classname'
        });
        let actions = [];
        switch ($(this).text()) {
            case "BOS Jacks":
                actions.push(getEOSjacksData());
                break;
            case "Mix System":
                actions.push(getMixData());
                break;
            case "所有糖果":
                actions.push(getEOSjacksData());
                actions.push(getMixData());
                break;
        }
        /* options = {
            broadcast: true,
            sign: true
        } */
        console.log(actions);
        /* eos.transfer(account.name, "eosio", "0.0001 BOS", "test").then(res => { */
        eos.transaction({ "actions": actions }/* , options */).then(res => {
            loading.hide();
            weui.toast("成功", 2000);
            console.log(res.transaction_id);
            $(".tx-area").show();
            $(".tx-id").text(res.transaction_id);
            $(".tx-id").attr("href", "https://bos.eosx.io/tx/" + res.transaction_id);
        }).catch(err => {
            loading.hide();
            $(".tx-area").hide();
            let errString;
            console.log(typeof (err));
            if (typeof (err) == "object") {
                errString = JSON.stringify(err);
            } else {
                errString = err;
            }
            errString = "失败\n" + errString;
            console.log(errString);
            weui.alert(errString);
        })
    } else {
        weui.topTips("请登录!", 2000);
    }
});