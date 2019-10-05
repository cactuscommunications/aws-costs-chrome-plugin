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

chrome.runtime.sendMessage({RDS: true}, function (data) {
    parseDBData(data["data"]);
    parseStorageData(data["storageData"]);
});

const rdsMap = {};
var rdsCostPerGBPerMonth = 0;

function parseDBData(dbData) {
    for (const data of dbData.prices) {
        const type = data.attributes["aws:rds:instanceType"];
        rdsMap[type] = (parseFloat(data.price.USD) * 24 * 30).toFixed(0);
    }
}

function parseStorageData(storageData) {
    for (const data of storageData.prices) {
        if (data.attributes["aws:rds:usagetype"] === "RDS:GP2-Storage") {
            rdsCostPerGBPerMonth = parseFloat(data.price.USD).toFixed(3);
        }
    }
}

const rdsAllocatedStorageMap = {};

self.setInterval(parseRDSTBUsed, 1000);

function parseAccount() {
    return $("a#nav-usernameMenu").children().first().text();
}

function getRDSDBSizeForAccount() {
    if (parseAccount() in rdsAllocatedStorageMap) {
        return rdsAllocatedStorageMap[parseAccount()];
    } else {
        return "Unknown";
    }
}

function parseRDSTBUsed() {
    if (!window.location.href.toString().endsWith(":")) {
        const accountKey = parseAccount();
        if (parseAccount() !== "Unknown") {
            const allocatedText = $("li:contains(Allocated):not(:has(li))").first().text();
            if(allocatedText !== undefined && allocatedText.indexOf("Allocated storage") !== -1 && allocatedText.indexOf("TB") !== -1) {
                const tb = parseFloat(allocatedText.split("(")[1].split(" ")[0]);

                rdsAllocatedStorageMap[accountKey] = tb;
            }
        }
    }
}