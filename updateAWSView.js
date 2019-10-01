'use strict';

self.setInterval(rewriteAWS, 1000);

var map = {};
var seenInstanceTypes = null;

chrome.runtime.sendMessage({prices: true}, function (data) {
    writeMap(data);
});

function writeMap(data) {
    for (const price of data.prices) {
        var type = price.attributes["aws:ec2:instanceType"];
        var cost = {
            "hour": parseFloat(price.price.USD).toFixed(4),
            "month": (parseFloat(price.price.USD) * 24 * 30).toFixed(2)
        };
        map[type] = cost;
    }
}

function rewriteAWS() {
    var tmpInstanceTypesSeen = new Set();

    Object.keys(map).forEach(function (key) {
        if(seenInstanceTypes == null || seenInstanceTypes.has(key)) {
            $("div:contains(" + key + ")").each(function (index, elm) {

                //Only change the div that is in the table => only if the text is inside a <td>
                if ($(this).closest("td").length === 1) {
                    if (!elm.textContent.includes("$")) {
                        elm.innerText += " (" + map[key].hour + "$ / hour, " + map[key].month + "$ / month)";
                    }
                    tmpInstanceTypesSeen.add(key);
                }
            });
        }
    });

    seenInstanceTypes = tmpInstanceTypesSeen;
    if(seenInstanceTypes.size === 0) {
        seenInstanceTypes = null;
    }
}

