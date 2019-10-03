'use strict';

self.setInterval(handleNewInstanceListPage, 1000);

let selectedItem = null;

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
                            elm.innerText += " (" + reportPerHourNumber(ec2Map[key].hour) + ", " + reportPerMonthNumber(ec2Map[key].month) + ")";
                        }
                    }
                });
            });
        }
    }
}