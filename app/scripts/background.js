'use strict';

/**
 * Method for creating basic auth header.
 *
 * Got function from here: http://stackoverflow.com/questions/5507234/how-to-use-basic-auth-and-jquery-and-ajax
 *
 * @param user The user who wants to authenticate
 * @param password The password of the user who wants to authenticate
 * @returns {string} The resulting header for basic auth to get the given user authenticated
 */
function makeBaseAuth(user, password) {
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
        // get all feeds for this user
        $.ajax({type:'GET', dataType:'json', url: 'https://api.github.com/user', timeout:5000, success:saveFeedUrl, async: false, beforeSend: function (xhr){ xhr.setRequestHeader('Authorization', makeBaseAuth(localStorage["oauthToken"], ""));}});
    } catch (e) {
        console.log("Error fetching feed list from Github. The server might be down or the api has changed. Will try it again the next time.");
    }
}

function saveFeedUrl(result) {
    console.log(result);
    localStorage["feedUrl"] = result.received_events_url;
}

/**
 * Get the public feed from Github and parse events
 */
function getFeed() {
    try {
        // call public feed for this user
        $.ajax({type:'GET', dataType:'json', url: localStorage["feedUrl"], timeout:5000, success:parsePublicFeed, error:recoverFromWrongPublicFeed, async: false, beforeSend: function (xhr){ xhr.setRequestHeader('Authorization', makeBaseAuth(localStorage["oauthToken"], ""));}});
    } catch (e) {
        console.log("Calling the feed resulted in error. Recovering in progress.");
    }

}

/**
 * Method checks all returned results from end to beginning (reverse), if more than one new event shows up we can show it
 * the user chronically correct.
 *
 * @param result The events in user feed provided by the Github API.
 */
function parsePublicFeed(result) {
    for (var i = result.length - 1; i >= 0; i--) {
        var entry = result[i];
        var createdAt = entry.created_at;
        var gravatarId = entry.actor.avatar_url;

        var repoName = entry.repo.name;
        var userName = entry.actor.login;
        var repoUrl = "https://github.com/" + entry.repo.name;

        console.log(entry);

        // create repository workflow
        if (entry.type == "CreateEvent" && isEventActive("CreateEvent") && entry.payload.ref_type == "repository") {
            if (localStorage["lastEntry"] < createdAt) {
                saveItemAndNotify("New repository " + repoName + " created", userName + " has created " + repoName + "! Click to get there!", repoUrl, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        // star event workflow
        } else if (entry.type == "WatchEvent" && isEventActive("WatchEvent")) {
            if (localStorage["lastEntry"] < createdAt) {
                saveItemAndNotify("Repository " + repoName + " starred", userName + " has starred " + repoName + "! Click to get there!", repoUrl, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        // open source event workflow
        } else  if (entry.type == "PublicEvent" && isEventActive("PublicEvent")) {
            if (localStorage["lastEntry"] < createdAt) {
                saveItemAndNotify("Repository " + repoName + " open sourced", userName + " has open sourced " + repoName + "! Click to get there!", repoUrl, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        // follow event workflow
        } else if (entry.type == "FollowEvent" && isEventActive("FollowEvent")) {
            if (localStorage["lastEntry"] < createdAt) {
                saveItemAndNotify(userName + " started following " + entry.payload.target.login, "Click to get there!", repoUrl, gravatarId);
                localStorage["lastEntry"] = createdAt;
            }
        }
    }
}

/**
 * We want to cache the private url for the user, so we do not have to make two call every minute. When something went
 * wrong (maybe the url changes), we want to retrieve the new one.
 */
function recoverFromWrongPublicFeed() {
    console.log("get feed failed!");
    getFeedUrl();
}

/**
 * Function for checking, if a event is active
 * @param eventName The name of the event we want to check.
 * @returns {*}
 */
function isEventActive(eventName) {
    if (localStorage.getItem(eventName) == null || localStorage[eventName] == false) {
        return false;
    }

    return true;
}

/**
 * Function for setting the listener for the notifications. This function will be called once.
 */
function setNotificationListener() {
        // notification onClick function
        chrome.notifications.onClicked.addListener(function () {

        // open link
        window.open(localStorage.getItem('allEvent.url1'));
    });
}

function saveItemAndNotify(title, text, link, gravatarId) {
    addItem(text, link, gravatarId);
    notify(title, text, link, gravatarId);
}

/**
 * Send notification to user.
 *
 * @param title The title of the notification
 * @param text The text of the notification
 * @param link The link we want to send the user when he clicks the notification
 */
function notify(title, text, link, gravatarId) {

    var notificationProperties = {
        type: "basic",
        title: title,
        iconUrl: gravatarId,
        message: text
    };

    var notificationId = "ghn-notification_" + title;

    chrome.notifications.create(notificationId, notificationProperties, function() { console.log('created!'); });

    // set notification timeout
    setTimeout(function() { chrome.notifications.clear(notificationId, function(wasCleared) { console.log("notification was cleared: " + wasCleared); }); }, 3000);
}

/**
 * Method for polling. Gets the public feed and parses events.
 */
function run() {
    // initialize the localStorage for lastEntry
    if (localStorage["lastEntry"] == null) {
        localStorage["lastEntry"] = 0;
    }

    // just call the feedUrl, when nothing is set. If it expires, the next call will it recover -> cache pattern
    if (localStorage["feedUrl"] == null) {
        getFeedUrl();
    }

    // get feed events
    getFeed();
    window.setTimeout(run, 60000);
}

// initial run when extension is ready
run();
setNotificationListener();

