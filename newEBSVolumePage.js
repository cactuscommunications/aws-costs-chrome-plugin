'use strict';

self.setInterval(rewriteCreateVolumePage, 1000);

chrome.runtime.sendMessage({ebs: true}, function (ebsData) {
    writeEBSData(ebsData);
});

var uiToEBSJSONMap = new Map();
uiToEBSJSONMap.set("Magnetic", "standard");
uiToEBSJSONMap.set("General Purpose", "gp2");
uiToEBSJSONMap.set("Cold HDD", "sc1");
uiToEBSJSONMap.set("Provisioned IOPS", "io1");
uiToEBSJSONMap.set("Throughput Optimized HDD", "st1");

var ebsMap = {};

function writeEBSData(data) {
    for (const price of data.prices) {
        let type = price.attributes["aws:ec2:volumeType"];
        let cost = parseFloat(price.price.USD);

        if (uiToEBSJSONMap.has(type)) {
            ebsMap[uiToEBSJSONMap.get(type)] = cost;
        }
    }
}

function rewriteCreateVolumePage() {
    if(window.location.href.toString().indexOf("#CreateVolume:") > -1 || window.location.href.toString().indexOf("#LaunchInstanceWizard:") > -1 ) {
        const frame = $("iframe#storage-gwt-frame").contents();

        const volumeTypeDiv = frame.find("div#gwt-debug-VolumeType-label");
        const volumeType = volumeTypeDiv.text();

        const sizeDiv = frame.find("input#gwt-debug-Size");
        const size = parseInt(sizeDiv.val(), 10);

        var costPerMonth = 0;
        Object.keys(ebsMap).forEach(function (key) {
            if (volumeType.includes(key)) {
                const costPerGB = ebsMap[key];
                costPerMonth = costPerGB * size;
            }
        });

        const infoDiv = sizeDiv.parent().next().next();

        if (!infoDiv.text().includes("$")) {
            infoDiv.text(costPerMonth + "$ / month " + infoDiv.text());
        } else {
            const stdText = infoDiv.text().split("(")[1];
            infoDiv.text(costPerMonth + "$ / month (" + stdText);
        }
    }
}







