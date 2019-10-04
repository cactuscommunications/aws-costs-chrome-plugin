'use strict';

self.setInterval(rewriteEBSTable, 1000);

function addEBSPriceColumn() {
    const iframe = $("iframe#storage-gwt-frame").contents();
    //We're on the instances page, and we havn't already added the columns we want
    if (!iframe.find("th:contains(Price)").length) {
        iframe.find("th:contains(Size)").each(function (index, elm) {

            //Find the instance type columnn, and insert a TH for cost / mo
            $(this).after($("<th colspan=\"1\" id='month_th' class=\"GLDQTD5BPJB GLDQTD5BOKB GLDQTD5BALB\"><div style=\"position:relative;zoom:1;padding-right:19px;\"><div style=\"position:absolute;top:50%;line-height:0px;margin-top:-10px;right:0px;\"></div><div __gwt_header=\"header-gwt-uid-1462\"><div class=\"GLDQTD5BAKB\">Price / Month</div></div><div class=\"GLDQTD5BLKB\"></div></div></th>"));
            iframe.find("th#month_th").click(function () {
                sortByIframe("div.price_month_cell", curDirection);
            });

            //This is the index number of the Instance Type table header
            const indexNumber = $(this).index();
            const instanceTable = iframe.find("table").last();

            instanceTable.find("tr").each(function (index, elm) {
                $(this).find("td:eq(" + indexNumber + ")").after($("<td class=\"GLDQTD5BFJB GLDQTD5BKKB\"><div style=\"outline-style:none;\" __gwt_cell=\"cell-gwt-uid-1964\" class='price_month_cell'></div></td>"));
            });
        });
    }
}

function rewriteEBSTable() {
    if (window.location.href.toString().indexOf("#Volumes:") !== -1) {
        addEBSPriceColumn();

        $("iframe#storage-gwt-frame").contents().find(".price_month_cell").each(function (index, elm) {
            const ebsType = $(this).parent().next().text();
            const numGb = parseInt($(this).parent().prev().text().split(" ")[0]);

            if(!$(this).text().includes("$")) {
                $(this).text(reportPerMonthNumber((ebsMap[ebsType] * numGb)))
            }
        });
    }
}