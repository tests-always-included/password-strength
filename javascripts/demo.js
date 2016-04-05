window.onload = function () {
    "use strict";

    var commonXhttp, frequencyXhttp, passwordField, passwordInfo, passwordStatistics, passwordStrength;

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

    function setReadyStateChange(xhr, passwordStrengthMethod, elementId) {
        xhr.onreadystatechange = function () {
            var result;

            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    passwordStrength[passwordStrengthMethod](JSON.parse(xhr.responseText));
                    document.getElementById(elementId).style.display = 'none';
                    recalc();
                } else {
                    document.getElementById(elementId).innerHTML = "Unable to load (" + elementId + "): " + xhr.status;
                }
            }
        };
    }

    passwordField = document.getElementById('PasswordField');
    passwordInfo = document.getElementById('PasswordInfo');
    passwordStatistics = document.getElementById('PasswordStatistics');

    commonXhttp = new XMLHttpRequest();
    setReadyStateChange(commonXhttp, 'addCommonPasswords', 'commonXhttp');
    commonXhttp.open("GET", "javascripts/common-passwords.json", true);
    commonXhttp.send();

    frequencyXhttp = new XMLHttpRequest();
    setReadyStateChange(frequencyXhttp, 'addTrigraphMap', 'frequencyXhttp');
    frequencyXhttp.open("GET", "javascripts/trigraphs.json", true);
    frequencyXhttp.send();

    passwordStrength = new window.PasswordStrength();
    passwordField.onkeyup = recalc;

    // Expose this object so the console can diagnose and debug
    // issues.
    window.passwordStrength = passwordStrength;
};
