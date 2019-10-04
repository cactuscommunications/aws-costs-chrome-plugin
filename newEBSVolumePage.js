'use strict';

self.setInterval(rewriteCreateVolumePage, 1000);

function addNewEBSVolumeRow() {
    const frame = $("iframe#storage-gwt-frame").contents();
    if (!frame.find("#costs_div").length) {
        console.log("Writing row");
        const sizeDiv = frame.find("div:contains(Size):not(:has(div))").first();
        const fullSizeDiv = sizeDiv.parent().parent().parent();
        const costRow = $("<div id='costs_div'><div class=\"GLDQTD5BJEH\" style=\"padding-left: 25px;\"> <div class=\"GLDQTD5BPEH\" style=\"width: 230px;\"> <div class=\"GLDQTD5BOEH\">Cost / month</div> </div> <div style=\"margin-left: 230px;\"> <div class=\"GLDQTD5BFFH\" style=\"margin-left: 10px;\"> <div class=\"GLDQTD5BNEH\"><div id='costs_div_inner'>HERE IS TEXT</div></div> <div class=\"GLDQTD5BLEH\" style=\"width: 245px; margin-top: -2px;\"></div> <div class=\"GLDQTD5BAFH\" style=\"display: none;\"> <span class=\"GLDQTD5BCFH GLDQTD5BP- GLDQTD5BO0\"></span></div> </div> </div> </div></div>");
        fullSizeDiv.after(costRow);
    }
}

function rewriteCreateVolumePage() {
    if (window.location.href.toString().indexOf("#CreateVolume:") > -1) {
        addNewEBSVolumeRow();

        const frame = $("iframe#storage-gwt-frame").contents();

        const volumeTypeDiv = frame.find("div#gwt-debug-VolumeType-label");
        const volumeType = volumeTypeDiv.text();

        const sizeDiv = frame.find("input#gwt-debug-Size");
        const size = parseInt(sizeDiv.val(), 10);

        let costPerMonth = 0;
        Object.keys(ebsMap).forEach(function (key) {
            if (volumeType.includes(key)) {
                const costPerGB = ebsMap[key];
                costPerMonth = costPerGB * size;
            }
        });

        const infoDiv = frame.find("#costs_div_inner").first();
        infoDiv.text(reportPerMonthNumber(costPerMonth));
    }
}







