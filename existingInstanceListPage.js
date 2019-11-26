'use strict';

self.setInterval(handleExistingInstanceListPage, 1000);

function addInstancePriceColumn() {
    if (!$("th:contains(Price)").length) {
        $("th:contains(Instance Type)").each(function (index, elm) {
            //Find the instance type columnn, and insert a TH for cost / hour
            $(this).after($("<th colspan=\"1\" id='hour_th' class=\"GLIWNNXDNKB GLIWNNXDMLB\" __gwt_column=\"column-gwt-uid-4280\"><div style=\"position:relative;zoom:1;\"><div __gwt_header=\"header-gwt-uid-4281\"><div class=\"GE42WOWBOKB\">Price / Hour</div></div><div resize-col=\"5\" class=\"GE42WOWBJLB\"></div></div></th>"));
            $("th#hour_th").click(function () {
                sortBy("div.price_hour_cell");
            });

            //Find the instance type columnn, and insert a TH for cost / mo
            const costPerHourTH = $(this).next();
            costPerHourTH.after($("<th colspan=\"1\" id='month_th' class=\"GLIWNNXDNKB GLIWNNXDMLB\" __gwt_column=\"column-gwt-uid-4280\"><div style=\"position:relative;zoom:1;\"><div __gwt_header=\"header-gwt-uid-4281\"><div class=\"GE42WOWBOKB\">Price / Month</div></div><div resize-col=\"5\" class=\"GE42WOWBJLB\"></div></div></th>"));
            $("th#month_th").click(function () {
                sortBy("div.price_month_cell");
            });

            //This is the index number of the Instance Type table header
            const indexNumber = $(this).index();
            const instanceTable = $("table").last();

            instanceTable.find("tr").each(function (index, elm) {
                $(this).find("td:eq(" + indexNumber + ")").after($("<td class=\"GE42WOWBDKB GE42WOWBHKB\"><div style=\"outline-style:none;\" __gwt_cell=\"cell-gwt-uid-2251\" class='price_hour_cell'>Price / Hour Cell</div></td>"));
                $(this).find("td:eq(" + (indexNumber + 1) + ")").after($("<td class=\"GE42WOWBDKB GE42WOWBHKB\"><div style=\"outline-style:none;\" __gwt_cell=\"cell-gwt-uid-2251\" class='price_month_cell'>Price / Month Cell</div></td>"));
            });
        });
    }
}

function isSpot(elm) {
    if(elm.parent().parent().find("td:contains(normal)").length) {
        return false;
    }
    return true;
}

function handleExistingInstanceListPage() {
    if (window.location.href.indexOf("#Instances:") > -1) {
        addInstancePriceColumn();

        $(".price_hour_cell").each(function (index, elm) {
            const instanceType = $(this).parent().prev().text();
            $(this).text(reportPerHourNumber(getEC2InstancePrices(instanceType, isSpot($(this))).hour));
        });

        $(".price_month_cell").each(function (index, elm) {
            const instanceType = $(this).parent().prev().prev().text();
            $(this).text(reportPerMonthNumber(getEC2InstancePrices(instanceType, isSpot($(this))).month));
        });
    }
}
