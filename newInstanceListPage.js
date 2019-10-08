'use strict';

self.setInterval(handleNewInstanceListPage, 1000);

function addCostColumnForNewInstance() {
    const typeDiv = $("span:contains(Type):not(:has(span)):not(:contains(Choose))").first();
    const thForType = typeDiv.parent().parent().parent().parent();
    const columnIndex = thForType.index();

    if (!$("#hourly_costs_th").length) {
        const perHourTh = $("<th id='hourly_costs_th' colspan=\"1\" class=\"GE42WOWBELD GE42WOWBDMD\"><div style=\"position:relative;zoom:1;\"><div><span><span class=\"GE42WOWBBNI\">Cost / hour</span> <span class=\"GE42WOWBCNI\"></span></span></div><div resize-col=\"2\" class=\"GE42WOWBLMD\"></div></div></th>");
        const perMonthTh = $("<th id='monthly_costs_th' colspan=\"1\" class=\"GE42WOWBELD GE42WOWBDMD\"><div style=\"position:relative;zoom:1;\"><div><span ><span class=\"GE42WOWBBNI\">Cost / month</span> <span class=\"GE42WOWBCNI\"></span></span></div><div resize-col=\"2\" class=\"GE42WOWBLMD\"></div></div></th>");

        thForType.after(perHourTh);
        thForType.next().after(perMonthTh);
    }

    const containingTable = thForType.closest("table");
    containingTable.find("tr").each(function (index, elm) {

        if(!$(this).find("div.cost_per_hour_cell").length) {

            let theClass = $(this).find("td").first().attr("class");

            const costsPerHourCell = $("<td class=\"" + theClass + "\"><div style=\"outline-style:none;\" __gwt_cell=\"cell-gwt-uid-2752\" class='cost_per_hour_cell'></div></td>");
            const costsPerMonthCell = $("<td class=\"" + theClass + "\"><div style=\"outline-style:none;\" __gwt_cell=\"cell-gwt-uid-2752\" class='cost_per_month_cell'></div></td>");

            const typeCell = $(this).find("td:eq(" + columnIndex + ")");

            typeCell.after(costsPerHourCell);
            typeCell.next().after(costsPerMonthCell);
        }

    });
}

let selectedItem = null;

function handleNewInstanceListPage() {
    if (window.location.href.indexOf("#LaunchInstanceWizard:") > -1) {
        addCostColumnForNewInstance();

        $(".cost_per_hour_cell").each(function (index, elm) {
            const type = $(this).parent().prev().text().replace("Free tier eligible", "");
            $(this).text(reportPerHourNumber(getEC2InstancePrices(type).hour));
        });

        $(".cost_per_month_cell").each(function (index, elm) {
            const type = $(this).parent().prev().prev().text().replace("Free tier eligible", "");
            $(this).text(reportPerMonthNumber(getEC2InstancePrices(type).month));
        });
    }
}