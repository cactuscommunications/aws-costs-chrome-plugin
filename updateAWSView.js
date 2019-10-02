'use strict';

self.setInterval(rewriteEC2, 1000);
self.setInterval(rewriteEBS, 1000);

chrome.runtime.sendMessage({ec2: true}, function (ec2Data) {
    writeEC2Data(ec2Data);
});

chrome.runtime.sendMessage({ebs : true}, function (ebsData) {
    writeEBSData(ebsData);
});

chrome.runtime.sendMessage({ec2Deprecated : true}, function (ec2Deprecated) {
    writeEC2Data(ec2Deprecated);
});

var uiToEBSJSONMap = new Map();
uiToEBSJSONMap.set("Magnetic", "standard");
uiToEBSJSONMap.set("General Purpose", "gp2");

var ebsMap = {};

function writeEBSData(data) {
    for(const price of data.prices) {
        let type = price.attributes["aws:ec2:volumeType"];
        let cost = parseFloat(price.price.USD);

        if(uiToEBSJSONMap.has(type)) {
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


function rewriteEBS() {
    Object.keys(ebsMap).forEach(function (key) {
        $("iframe#storage-gwt-frame").contents().find("div:contains(" + key +")").each(function (index, elm) {
               //Only change the div that is in the table => only if the text is inside a <td>
                if ($(this).closest("td").length === 1) {

                    const sizeOfDiskElm = $(this).parent().prev().children(":first");
                    if (!sizeOfDiskElm.text().includes("$")) {
                        const numGb = parseInt(sizeOfDiskElm.text().split(" ")[0], 10);
                        sizeOfDiskElm.text(sizeOfDiskElm.text() + " (" + (ebsMap[key]*numGb) + "$ / month)");
                    }
                }
            });
    });
}



var ec2Map = {};
var seenInstanceTypes = null;

function rewriteEC2() {
    var tmpInstanceTypesSeen = new Set();

    Object.keys(ec2Map).forEach(function (key) {
        if(seenInstanceTypes == null || seenInstanceTypes.has(key)) {
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
    if(seenInstanceTypes.size === 0) {
        seenInstanceTypes = null;
    }
}

