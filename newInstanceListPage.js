'use strict';

self.setInterval(handleNewInstanceListPage, 1000);

chrome.runtime.sendMessage({ec2: true}, function (ec2Data) {
    writeEC2Data(ec2Data);
});

function writeEC2Data(data) {
    for (const price of data.prices) {
        const type = price.attributes["aws:ec2:instanceType"];
        const cost = {
            "hour": parseFloat(price.price.USD).toFixed(3),
            "month": (parseFloat(price.price.USD) * 24 * 30).toFixed(0)
        };
        ec2Map[type] = cost;
    }
}

var ec2Map = {};
var selectedItem = null;

function handleNewInstanceListPage() {
    if (window.location.href.indexOf("#LaunchInstanceWizard:") > -1) {
        let forceRefresh = false;

        const newlySelectedItem = $("[aria-checked=true]").parent().parent().next().next().text();

        if (selectedItem !== newlySelectedItem) {
            selectedItem = newlySelectedItem;
            forceRefresh = true;
        }

        if (selectedItem == null || forceRefresh) {
            Object.keys(ec2Map).forEach(function (key) {
                $("div:contains(" + key + ")").each(function (index, elm) {
                    //Only change the div that is in the table => only if the text is inside a <td>
                    if ($(this).closest("td").length === 1) {
                        if (!elm.textContent.includes("$")) {
                            elm.innerText += " (" + ec2Map[key].hour + "$ / hour, " + ec2Map[key].month + "$ / month)";
                        }
                    }
                });
            });
        }
    }
}