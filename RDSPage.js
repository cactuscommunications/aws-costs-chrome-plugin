'use strict';

self.setInterval(rewriteRDSTable, 1000);

function addRDSColumns() {
    const sizeSpan = $("span:contains(Size):not(:has(span))").last();
    const sizeTh = sizeSpan.closest("th");

    if (!$("th:contains(Cost)").length) {
        //Find the instance type columnn, and insert a TH for cost / mo
        sizeTh.after($("<th id='instance_cost_th' onmouseover=\"this.style.cursor='pointer'\"><span class=\"awsui-table-header-content\" tabindex=\"0\"><span><span>Instance Cost</span></span><awsui-icon class=\"awsui-table-sorting-icon\" initialized=\"true\"><span class=\"awsui-icon awsui-icon-size-normal awsui-icon-variant-normal\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" focusable=\"false\"><path class=\"filled stroke-linejoin-round\" d=\"M4 5h8l-4 6-4-6z\"></path></svg></span></awsui-icon></span></th>"));
        $("th#instance_cost_th").click(function () {
            sortBy("span.instance_month_cell");
        });

        sizeTh.next().after($("<th id='storage_cost_th' onmouseover=\"this.style.cursor='pointer'\"><span class=\"awsui-table-header-content\" tabindex=\"0\"><span><span>Storage Cost</span></span><awsui-icon class=\"awsui-table-sorting-icon\" initialized=\"true\"><span class=\"awsui-icon awsui-icon-size-normal awsui-icon-variant-normal\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\" focusable=\"false\"><path class=\"filled stroke-linejoin-round\" d=\"M4 5h8l-4 6-4-6z\"></path></svg></span></awsui-icon></span></th>"));
        $("th#storage_cost_th").click(function () {
            sortBy("span.storage_month_cell");
        });

    }

    //This is the index number of the Instance Type table header
    const indexNumber = sizeTh.index();
    const table = $("table.awsui-table-nowrap");

    table.find("tr").each(function (index, elm) {
        if (!$(this).find("span.instance_month_cell").length) {
            $(this).find("td:eq(" + indexNumber + ")").after($("<td class=\"dark-bottom-border\"><span><span class='instance_month_cell'></span></span></td>"));
            $(this).find("td:eq(" + (indexNumber+1) + ")").after($("<td class=\"dark-bottom-border\"><span><span class='storage_month_cell'></span></span></td>"));
        }
    });
}

function rewriteRDSTable() {
    if (window.location.href.toString().indexOf("#databases:") !== -1) {
        addRDSColumns();

        const storageSpan = $("span:contains(Storage):not(:has(span))").last();
        const storageTh = storageSpan.closest("th");

        $("span.instance_month_cell").each(function (index, elm) {
            const rdsType = $(this).closest("td").prev().text();
            const numGb = parseInt($(this).closest("tr").find("td:eq(" + storageTh.index() + ")").first().text().split(" ")[0]);

            if(!$(this).text().includes("$")) {
                $(this).text(reportPerMonthNumber((rdsMap[rdsType])));
                $(this).closest("td").next().find("span.storage_month_cell").first().text(reportPerMonthNumber((numGb * rdsCostPerGBPerMonth).toFixed(2)));
            }
        });
    }
}