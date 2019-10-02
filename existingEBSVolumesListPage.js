
chrome.runtime.sendMessage({ebs: true}, function (ebsData) {
    writeEBSData(ebsData);
});

self.setInterval(rewriteEBSTable, 1000);

const uiToEBSJSONMap = new Map();
uiToEBSJSONMap.set("Magnetic", "standard");
uiToEBSJSONMap.set("General Purpose", "gp2");
uiToEBSJSONMap.set("Cold HDD", "sc1");
uiToEBSJSONMap.set("Provisioned IOPS", "io1");
uiToEBSJSONMap.set("Throughput Optimized HDD", "st1");

const ebsMap = {};

function writeEBSData(data) {
    for (const price of data.prices) {
        let type = price.attributes["aws:ec2:volumeType"];
        let cost = parseFloat(price.price.USD);

        if (uiToEBSJSONMap.has(type)) {
            ebsMap[uiToEBSJSONMap.get(type)] = cost;
        }
    }
}


function rewriteEBSTable() {
    if (window.location.href.toString().indexOf("LaunchInstanceWizard") === -1) {
        Object.keys(ebsMap).forEach(function (key) {
            $("iframe#storage-gwt-frame").contents().find("div:contains(" + key + ")").each(function (index, elm) {
                //Only change the div that is in the table => only if the text is inside a <td>
                if ($(this).closest("td").length === 1) {

                    const sizeOfDiskElm = $(this).parent().prev().children(":first");
                    if (!sizeOfDiskElm.text().includes("$")) {
                        const numGb = parseInt(sizeOfDiskElm.text().split(" ")[0], 10);
                        sizeOfDiskElm.text(sizeOfDiskElm.text() + " (" + (ebsMap[key] * numGb) + "$ / month)");
                    }
                }
            });
        });
    }
}