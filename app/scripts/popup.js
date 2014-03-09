'use strict';

window.onload = function() { start(); }

function start() {
    var entries = getList();
    console.log(entries);

    var table = document.getElementById("table");

    for (var i = 0; i < entries.length; i++) {
        addRow(table, entries[i].text, entries[i].gravatarUrl);
    }
}

function addRow(table, text, gravatarUrl) {
    var tr = document.createElement("tr");

    var imageTd = document.createElement("td");
    var textTd = document.createElement("td");

    textTd.innerText = text;

    var image = document.createElement("img");
    image.src = gravatarUrl;
    imageTd.appendChild(image);

    tr.appendChild(imageTd);
    tr.appendChild(textTd);

    table.appendChild(tr);
}
