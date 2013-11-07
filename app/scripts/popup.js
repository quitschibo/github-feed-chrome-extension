'use strict';

function save() {
    localStorage["username"] = $('#username').val();
    localStorage["password"] = $('#password').val();
}

document.addEventListener('DOMContentLoaded', function () {
    $('#username').val(localStorage["username"]);
    $('#password').val(localStorage["password"]);

    document.querySelector('button').addEventListener('click', save);

    $(".checkbox").change(function() {
        // check which checkbox is used
        if (this.id == "create") {
            localStorage["CreateEvent"] = this.checked;
        } else if (this.id == "star") {
            localStorage["WatchEvent"] = this.checked;
        } else if (this.id == "opensource") {
            localStorage["PublicEvent"] = this.checked;
        }
    });
});