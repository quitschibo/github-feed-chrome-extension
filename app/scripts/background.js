'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

/**
 * Method for creating basic auth header.
 *
 * @param user The user who wants to authenticate
 * @param password The password of the user who wants to authenticate
 * @returns {string} The resulting header for basic auth to get the given user authenticated
 */
function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return "Basic " + hash;
}

/**
 * Get all feeds from Github for the user and select the public feed.
 */
function getFeedUrl() {
    console.log("get new feed url");
    try {
        // call github api
        $.ajax({type:'GET', dataType:'json', url: 'https://api.github.com/feeds', timeout:5000, success:parseFeed, async: false, beforeSend: function (xhr){ xhr.setRequestHeader('Authorization', make_base_auth(localStorage["username"], localStorage["password"]));}});
    } catch (e) {
        console.log("Error fetching feed list from Github. The server might be down or the api has changed. Will try it again the next time.");
    }
}

function parseFeed(result) {
    console.log(result.current_user_url);
    localStorage["feedUrl"] = result.current_user_url;
}

/**
 * Get the public feed from Github and parse events
 */
function getFeed() {
    try {
        $.ajax({type:'GET', dataType:'json', url: localStorage["feedUrl"], timeout:5000, success:parsePrivateFeed, error:recoverFromWrongPrivateFeed, async: false});
    } catch (e) {
        console.log("Calling the feed resulted in error. Recovering in progress.");
    }

}

function parsePrivateFeed(result) {
    console.log(result);
    for (var i = result.length - 1; i >= 0; i--) {
        var entry = result[i];
        var createdAt = entry.created_at;
        var gravatarId = entry.actor_attributes.gravatar_id;

        console.log(entry);

        // create event workflow
        if (entry.type == "CreateEvent" && isEventActive("CreateEvent")) {
            if (localStorage["lastEntry"] < createdAt) {
                notify("New repository", entry.actor + " has created a new repository! Click to get there!", entry.url, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        // star event workflow
        } else if (entry.type == "WatchEvent" && isEventActive("WatchEvent")) {
            if (localStorage["lastEntry"] < createdAt) {
                notify("Repository starred", entry.actor + " has starred a repository! Click to get there!", entry.url, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        // open source event workflow
        } else  if (entry.type == "PublicEvent" && isEventActive("PublicEvent")) {
            if (localStorage["lastEntry"] < createdAt) {
                notify("Repository open sourced", entry.actor + " has open sourced a repository! Click to get there!", entry.url, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        }
    }
}

/**
 * We want to cache the private url for the user, so we do not have to make two call every minute. When something went
 * wrong (maybe the url changes), we want to retrieve the new one.
 */
function recoverFromWrongPrivateFeed() {
    console.log("get feed failed!");
    getFeedUrl();
}

function isEventActive(eventName) {
    if (localStorage[eventName] == null) {
        return false;
    }

    return localStorage[eventName];
}

/**
 * Send notification to user.
 *
 * @param title The title of the notification
 * @param text The text of the notification
 * @param link The link we want to send the user when he clicks the notification
 */
function notify(title, text, link, gravatarId) {
    var not = webkitNotifications.createNotification("http://www.gravatar.com/avatar/" + gravatarId, title, text);
    not.addEventListener("click", function () {
        window.open(link);
        not.close();
    });
    not.show();
}

// initialize the localStorage for lastEntry
if (localStorage["lastEntry"] == null) {
    localStorage["lastEntry"] = 0;
}

/**
 * Method for polling. Gets the public feed and parses events.
 */
function run() {
    // just call the feedUrl, when nothing is set. If it expires, the next call will it recover -> cache pattern
    if (localStorage["feedUrl"] == null) {
        getFeedUrl();
    }
    getFeed();
    window.setTimeout(run, 60000);
}

// initial run when extension is ready
run();

