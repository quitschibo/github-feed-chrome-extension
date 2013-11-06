'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

// get authenticated
function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return "Basic " + hash;
}

function getFeedUrl() {
    // call github api
    $.ajax({type:'GET', dataType:'json', url: 'https://api.github.com/feeds', timeout:5000, success:parseFeed, async: false, beforeSend: function (xhr){ xhr.setRequestHeader('Authorization', make_base_auth(localStorage["username"], localStorage["password"]));}});
}

function parseFeed(result) {
    console.log(result.current_user_url);
    localStorage["feedUrl"] = result.current_user_url;
}

function getFeed() {
    $.ajax({type:'GET', dataType:'json', url: localStorage["feedUrl"], timeout:5000, success:parsePrivateFeed, async: false, beforeSend: function (xhr){ xhr.setRequestHeader('Authorization', make_base_auth(localStorage["username"], localStorage["password"]));}});
}

function parsePrivateFeed(result) {
    console.log(result);
    for (var i = result.length - 1; i >= 0; i--) {
        if (result[i].type == "CreateEvent") {
            if (localStorage["lastEntry"] < result[i].created_at) {
                notify("New repository", result[i].actor + " has created a new repository! Click to get there!", result[i].url);
                localStorage["lastEntry"] = result[i].created_at;
            }
        }
    }
}

function notify(title, text, link) {
    var not = webkitNotifications.createNotification("images/icon-16.png", title, text);
    not.addEventListener("click", function () {
        window.open(link);
        not.close();
    });
    not.show();
}

if (localStorage["lastEntry"] == null) {
    localStorage["lastEntry"] = 0;
}

function run() {
    getFeedUrl();
    getFeed();
    window.setTimeout(run, 5000);
}
run();

