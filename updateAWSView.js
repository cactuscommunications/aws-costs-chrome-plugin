'use strict';

self.setInterval(handleNewInstanceListPage, 1000);
self.setInterval(handleExistingInstanceListPage, 1000);
self.setInterval(rewriteEBSTable, 1000);
self.setInterval(rewriteCreateVolumePage, 1000);
self.setInterval(clearCache, 1000);

var prevLocation = null;

function clearCache() {
    if (prevLocation === null) {
        prevLocation = window.location.href;
    }

    if (prevLocation.toString().indexOf(window.location.href.toString()) === -1) {
        prevLocation = window.location.href;
        seenInstanceTypes = null;
    }
}

chrome.runtime.sendMessage({ec2: true}, function (ec2Data) {
    writeEC2Data(ec2Data);
});

chrome.runtime.sendMessage({ebs: true}, function (ebsData) {
    writeEBSData(ebsData);
});

chrome.runtime.sendMessage({ec2Deprecated: true}, function (ec2Deprecated) {
    writeEC2Data(ec2Deprecated);
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

function writeEC2Data(data) {
    for (const price of data.prices) {
        var type = price.attributes["aws:ec2:instanceType"];
        var cost = {
            "hour": parseFloat(price.price.USD).toFixed(4),
            "month": (parseFloat(price.price.USD) * 24 * 30).toFixed(2)
        };
        ec2Map[type] = cost;
    }
}

function rewriteCreateVolumePage() {
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


var ec2Map = {};
var seenInstanceTypes = null;

function handleExistingInstanceListPage() {
    if (window.location.href.indexOf("#Instances:") > -1) {
        var tmpInstanceTypesSeen = new Set();

        Object.keys(ec2Map).forEach(function (key) {
            if (seenInstanceTypes == null || seenInstanceTypes.has(key)) {
                $("div:contains(" + key + ")").each(function (index, elm) {
                    //Only change the div that is in the table => only if the text is inside a <td>
                    if ($(this).closest("td").length === 1) {
                        if (!elm.textContent.includes("$")) {
                            elm.innerText += " (" + ec2Map[key].hour + "$ / hour, " + ec2Map[key].month + "$ / month)";
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

var selectedItem = null;

function handleNewInstanceListPage() {
    var forceRefresh = false;

    const newlySelectedItem = $("[aria-checked=true]").parent().parent().next().next().text();
    console.log(newlySelectedItem);

    if(selectedItem !== newlySelectedItem) {
        selectedItem = newlySelectedItem;
        forceRefresh = true;
    }

    if ((window.location.href.indexOf("#LaunchInstanceWizard:") > -1) && selectedItem == null || forceRefresh) {
        Object.keys(ec2Map).forEach(function (key) {
            $("div:contains(" + key + ")").each(function (index, elm) {
                //Only change the div that is in the table => only if the text is inside a <td>
                if ($(this).closest("td").length === 1) {
                    if (!elm.textContent.includes("$")) {
                        elm.innerText += " (" + ec2Map[key].hour + "$ / hour, " + ec2Map[key].month + "$ / month)";
                    }
                }
            });
        });
    }
}

