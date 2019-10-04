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

function addPriceColumn() {
    if (window.location.href.indexOf("#Instances:") > -1 && !$("th:contains(Price)").length) {
        $("th:contains(Instance Type)").each(function (index, elm) {
            $(this).after($("<th colspan=\"1\" id='hour_th' class=\"GE42WOWBNKB GE42WOWBMLB\" __gwt_column=\"column-gwt-uid-4280\"><div style=\"position:relative;zoom:1;\"><div __gwt_header=\"header-gwt-uid-4281\"><div class=\"GE42WOWBOKB\">Price / Hour</div></div><div resize-col=\"5\" class=\"GE42WOWBJLB\"></div></div></th>"));
            $("th#hour_th").click(function () {
                sortByHour();
            });

            $(this).next().after($("<th colspan=\"1\" id='month_th' class=\"GE42WOWBNKB GE42WOWBMLB\" __gwt_column=\"column-gwt-uid-4280\"><div style=\"position:relative;zoom:1;\"><div __gwt_header=\"header-gwt-uid-4281\"><div class=\"GE42WOWBOKB\">Price / Month</div></div><div resize-col=\"5\" class=\"GE42WOWBJLB\"></div></div></th>"));
            $("th#month_th").click(function () {
                sortByMonth();
            });

            const indexNumber = $(this).index();
            const instanceTable = $("table").last();
            instanceTable.find("tr").each(function (index, elm) {
                $(this).find("td:eq(" + indexNumber + ")").after($("<td class=\"GE42WOWBDKB GE42WOWBHKB\"><div style=\"outline-style:none;\" __gwt_cell=\"cell-gwt-uid-2251\" class='price_hour_cell'>Price / Hour Cell</div></td>"));
                $(this).find("td:eq(" + (indexNumber+1) + ")").after($("<td class=\"GE42WOWBDKB GE42WOWBHKB\"><div style=\"outline-style:none;\" __gwt_cell=\"cell-gwt-uid-2251\" class='price_month_cell'>Price / Month Cell</div></td>"));
            });
        });
    }
}

let monthDirection = true;
function sortByMonth() {
    const perHourTbody = $("table").last().find("tbody");
    const instanceTable = perHourTbody.children().sort(function(a,b) {
        const price1 = parseFloat($(a).find("div.price_month_cell").text().split("$")[0]);
        const price2 = parseFloat($(b).find("div.price_month_cell").text().split("$")[0]);

        if(monthDirection) {
            return price1 - price2;
        } else {
            return price2 - price1;
        }
    });

    instanceTable.appendTo(perHourTbody);

    monthDirection = !monthDirection;
}

let hourDirection = true;
function sortByHour() {
    const perHourTbody = $("table").last().find("tbody");
    const instanceTable = perHourTbody.children().sort(function(a,b) {
        const price1 = parseFloat($(a).find("div.price_hour_cell").text().split("$")[0]);
        const price2 = parseFloat($(b).find("div.price_hour_cell").text().split("$")[0]);
        if(hourDirection) {
            return price1 - price2;
        } else {
            return price2 - price1;
        }
    });

    instanceTable.appendTo(perHourTbody);

    hourDirection = !hourDirection;
}

function handleExistingInstanceListPage() {
    addPriceColumn();

    if (window.location.href.indexOf("#Instances:") > -1) {
        const tmpInstanceTypesSeen = new Set();

        Object.keys(ec2Map).forEach(function (key) {
            if (seenInstanceTypes == null || seenInstanceTypes.has(key)) {
                $("div:contains(" + key + ")").each(function (index, elm) {
                    //Only change the div that is in the table => only if the text is inside a <td>
                    if ($(this).closest("td").length === 1) {
                        const theElm = $(this).parent().next();

                        if (!theElm.children().first().text().includes("$")) {
                            theElm.children().first().text(reportPerHourNumber(ec2Map[key].hour));
                        }

                        if(!theElm.next().children().first().text().includes("$")) {
                            theElm.next().children().first().text(reportPerMonthNumber(ec2Map[key].month));
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
