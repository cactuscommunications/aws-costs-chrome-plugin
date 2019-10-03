'use strict';

chrome.runtime.sendMessage({ebs: true}, function (ebsData) {
    writeEBSData(ebsData);
});

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

chrome.runtime.sendMessage({ec2: true}, function (ec2Data) {
    writeEC2Data(ec2Data);
});

chrome.runtime.sendMessage({ec2Deprecated: true}, function (ec2Deprecated) {
    writeEC2Data(ec2Deprecated);
});

const ec2Map = {};

function writeEC2Data(data) {
    for (const price of data.prices) {
        const type = price.attributes["aws:ec2:instanceType"];
        const cost = {
            "hour": parseFloat(price.price.USD).toFixed(3),
            "month": (parseFloat(price.price.USD) * 24 * 30).toFixed(0)
        };
        ec2Map[type] = cost;
    }
}