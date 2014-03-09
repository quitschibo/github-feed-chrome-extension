'use strict';

window.onload = function() { start(); }

/**
 * Method for building the popup list.
 */
function start() {
    var entries = getList();
    console.log(entries);

    var table = document.getElementById("table");

    for (var i = 0; i < entries.length; i++) {
        addRow(table, entries[i].text, entries[i].gravatarUrl);
    }
}

/**
 * Method for adding a row to the popup table.
 *
 * @param table The table we want to add the row to
 * @param text The text we want to add
 * @param gravatarUrl The url to the picture we want to add
 */
function addRow(table, text, gravatarUrl) {
    var tr = document.createElement("tr");

    var imageTd = document.createElement("td");
    var textTd = document.createElement("td");

    textTd.innerText = text;

    var image = document.createElement("img");
    image.src = gravatarUrl;
    image.className = "gravatarPicture";
    imageTd.appendChild(image);

    tr.appendChild(imageTd);
    tr.appendChild(textTd);

    table.appendChild(tr);
}
