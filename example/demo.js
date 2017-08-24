"use strict";
window.onload = function () {
    var commonXhttp, frequencyXhttp, passwordField, passwordStatistics, passwordStrength;

    /**
     * When the user updates the password, recalculate stats and show them
     * again.
     */
    function recalc() {
        var ps, stats;

        ps = passwordStrength.check(passwordField.value);
        stats = "";

        if (ps) {
            Object.keys(ps).forEach(function (key) {
                if (ps[key] && typeof ps[key] === "object") {
                    stats += "<p>" + key + ": ";
                    Object.keys(ps[key]).forEach(function (innerKey) {
                        stats += "<br />&nbsp;&nbsp;" + innerKey + ": " + ps[key][innerKey];
                    });
                    stats += "</p>";
                } else {
                    stats += "<p>" + key + ": " + ps[key] + "</p>";
                }
            });
        }

        passwordStatistics.innerHTML = stats;
    }

    /**
     * Detect when a file gets loaded.
     *
     * @param {XMLHttpRequest} xhr
     * @param {string} passwordStrengthMethod Method name to call
     * @param {string} elementId What to update in the DOM
     */
    function setReadyStateChange(xhr, passwordStrengthMethod, elementId) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    passwordStrength[passwordStrengthMethod](JSON.parse(xhr.responseText));
                    document.getElementById(elementId).style.display = "none";
                    recalc();
                } else {
                    document.getElementById(elementId).innerHTML = "Unable to load (" + elementId + "): " + xhr.status;
                }
            }
        };
    }

    passwordField = document.getElementById("PasswordField");
    passwordStatistics = document.getElementById("PasswordStatistics");

    commonXhttp = new XMLHttpRequest();
    setReadyStateChange(commonXhttp, "addCommonPasswords", "commonXhttp");
    commonXhttp.open("GET", "../data/common-passwords.json", true);
    commonXhttp.send();

    frequencyXhttp = new XMLHttpRequest();
    setReadyStateChange(frequencyXhttp, "addTrigraphMap", "frequencyXhttp");
    frequencyXhttp.open("GET", "../data/trigraphs.json", true);
    frequencyXhttp.send();

    passwordStrength = new window.PasswordStrength();
    passwordField.onkeyup = recalc;

    // Expose this object so the console can diagnose and debug
    // issues.
    window.passwordStrength = passwordStrength;
};
