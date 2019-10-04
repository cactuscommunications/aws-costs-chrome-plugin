function reportPerMonthNumber(number) {
    return number + "$/mo";
}

function reportPerHourNumber(number) {
    return number + "$/hr";
}

let curDirection = true;
function sortByIframe(selector, direction) {
    sortByInternal($("iframe#storage-gwt-frame").contents().find("table").last().find("tbody"), selector, direction);
}

function sortBy(selector, direction) {
    sortByInternal($("table").last().find("tbody"), selector, direction);
}

function sortByInternal(tbody, selector, direction) {
    const instanceTable = tbody.children().sort(function(a,b) {
        const price1 = parseFloat($(a).find(selector).text().split("$")[0]);
        const price2 = parseFloat($(b).find(selector).text().split("$")[0]);

        if(direction) {
            return price1 - price2;
        } else {
            return price2 - price1;
        }
    });

    instanceTable.appendTo(tbody);

    curDirection = !direction;
}