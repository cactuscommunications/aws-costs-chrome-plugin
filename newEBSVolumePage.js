'use strict';

self.setInterval(rewriteCreateVolumePage, 1000);

function rewriteCreateVolumePage() {
    if(window.location.href.toString().indexOf("#CreateVolume:") > -1) {
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

        const infoDiv = sizeDiv.parent().next().next();

        if (!infoDiv.text().includes("$")) {
            infoDiv.text(reportPerMonthNumber(costPerMonth) + " " + infoDiv.text());
        } else {
            const stdText = infoDiv.text().split("(")[1];
            infoDiv.text(reportPerMonthNumber(costPerMonth )+ "$ (" + stdText);
        }
    }
}







