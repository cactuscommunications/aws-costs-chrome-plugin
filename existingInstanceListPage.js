'use strict';

self.setInterval(handleExistingInstanceListPage, 1000);
self.setInterval(clearCache, 1000);

let prevLocation = null;
let seenInstanceTypes = null;

function clearCache() {
    if (prevLocation === null) {
        prevLocation = window.location.href;
    }

    if (prevLocation.toString().indexOf(window.location.href.toString()) === -1) {
        prevLocation = window.location.href;
        seenInstanceTypes = null;
    }
}

function handleExistingInstanceListPage() {
    if (window.location.href.indexOf("#Instances:") > -1) {
        const tmpInstanceTypesSeen = new Set();

        Object.keys(ec2Map).forEach(function (key) {
            if (seenInstanceTypes == null || seenInstanceTypes.has(key)) {
                $("div:contains(" + key + ")").each(function (index, elm) {
                    //Only change the div that is in the table => only if the text is inside a <td>
                    if ($(this).closest("td").length === 1) {
                        if (!elm.textContent.includes("$")) {
                            elm.innerText += " (" + ec2Map[key].hour + "$ / hour, " + ec2Map[key].month + "$ / month)";
                        }
                        tmpInstanceTypesSeen.add(key);
                    }
                });
            }
        });

        seenInstanceTypes = tmpInstanceTypesSeen;
        if (seenInstanceTypes != null && seenInstanceTypes.size === 0) {
            seenInstanceTypes = null;
        }
    }
}
