'use strict';

/**
 * This object contains methods for creating and modifying a list of all events. This list will be shown on popuppage.
 */

var threshold = 5;

/**
 * Keys for the localStorage
 */
var prefix = "allEvent.";
var storageKeyCount = prefix + "count";
var storageKeyText = prefix + "text";
var storageKeyUrl = prefix + "url";
var storageKeyGravatarUrl = prefix + "gravatarUrl";

/**
 * Method for adding an item to the list. This method must also delete obsolete (old) events.
 */
function addItem(eventText, eventUrl, gravatarUrl) {
    var count = getNewListCount();

    // add new entry
    localStorage[storageKeyText + count] = eventText;
    localStorage[storageKeyUrl + count] = eventUrl;
    localStorage[storageKeyGravatarUrl + count] = gravatarUrl;

    // ok, delete old entry
    if (count > threshold) {
        var oldCount = count - threshold;
        localStorage.removeItem(storageKeyText + oldCount);
        localStorage.removeItem(storageKeyUrl + oldCount);
        localStorage.removeItem(storageKeyGravatarUrl + oldCount);
    }
}

/**
 * Function for getting the count of the list entries. Every call will increment this count.
 */
function getNewListCount() {
    var actualCount = localStorage.getItem(storageKeyCount);

    if (!actualCount) {
        localStorage.setItem(storageKeyCount, 1);
        return 1;
    } else {
        var newCount = parseInt(actualCount) + 1;
        localStorage.setItem(storageKeyCount, newCount);
        return newCount;
    }
}

/**
 * Function for getting the count of the list entries.
 */
function getListCount() {
    var actualCount = localStorage.getItem(storageKeyCount);

    if (!actualCount) {
        return 1;
    }

    return parseInt(actualCount);
}

/**
 * Method for getting the list containing all events saved for showing on popup page.
 */
function getList() {
    var result = [];

    // calculate count of first entry
    var count = getListCount() - threshold + 1;

    // if there are less entry than the threshold (count < 1), we want to begin with the first element
    if (count <= 0) {
        count = 1;
    }

    for (var i = 0; i < threshold; i++) {
        count++;
        console.log("count: " + count);

        // get data from localStorage
        var text =localStorage[storageKeyText + count];
        var url = localStorage[storageKeyUrl + count];
        var gravatarId = localStorage[storageKeyGravatarUrl + count];

        // if the text is undefined, we assume that there is no entry
        if (!text) {
            continue;
        }

        // build entry
        var entry = {
            text: text,
            url: url,
            gravatarUrl: "http://www.gravatar.com/avatar/" + gravatarId
        }
        result[i] = entry;
    }

    return result;
}

