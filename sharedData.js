'use strict';
const regionToIDMap = {};
regionToIDMap["US East (N. Virginia)"] = "us-east-1";
regionToIDMap["US East (Ohio)"] = "us-east-2";
regionToIDMap["US West (N. California)"] = "us-west-1";
regionToIDMap["US West (Oregon)"] = "us-west-2";
regionToIDMap["Canada (Central)"] = "ca-central-1";
regionToIDMap["EU (Frankfurt)"] = "eu-central-1";
regionToIDMap["EU (Ireland)"] = "eu-west-1";
regionToIDMap["EU (London))"] = "eu-west-2";
regionToIDMap["EU (Paris)"] = "eu-west-3";
regionToIDMap["EU (Stockholm)"] = "eu-north-1";
regionToIDMap["Asia Pacific (Hong Kong)"] = "ap-east-1";
regionToIDMap["Asia Pacific (Tokyo)"] = "ap-northeast-1";
regionToIDMap["Asia Pacific (Seoul)"] = "ap-northeast-2";
regionToIDMap["Asia Pacific (Osaka-Local)"] = "ap-northeast-3";
regionToIDMap["Asia Pacific (Singapore)"] = "ap-southeast-1";
regionToIDMap["Asia Pacific (Sydney)"] = "ap-southeast-2";
regionToIDMap["Asia Pacific (Mumbai)"] = "ap-south-1";
regionToIDMap["Middle East (Bahrain)"] = "me-south-1";
regionToIDMap["South America (São Paulo)"] = "sa-east-1\n";

const regionToEC2Map = {};

function getAWSRegion() {
    const currentRegion = $("div#regionMenuContent").children().first().text();
    const regionID = regionToIDMap[currentRegion];
    return regionID;
}

function getEC2InstancePrices(instanceType) {
    const awsRegion = getAWSRegion();
    const nullMap = {"hour" : 0.0, "month" : 0.0};

    if(Object.keys(regionToEC2Map).includes(awsRegion)) {
        const map = regionToEC2Map[awsRegion];
        if(map != null) {
            return map[instanceType];
        } else {
            return nullMap;
        }
    } else {
        chrome.runtime.sendMessage({ec2 : true, region : awsRegion}, function (data) {
            writeEC2Data(data["data"], data["deprecatedData"], awsRegion);
        });

        return nullMap;
    }
}

function writeEC2Data(data, deprecatedData, awsRegion) {
    const tmpMap = {};
    for (const price of data.prices) {
        const type = price.attributes["aws:ec2:instanceType"];
        const cost = {
            "hour": parseFloat(price.price.USD).toFixed(3),
            "month": (parseFloat(price.price.USD) * 24 * 30).toFixed(0)
        };
        tmpMap[type] = cost;
    }
    for (const price of deprecatedData.prices) {
        const type = price.attributes["aws:ec2:instanceType"];
        const cost = {
            "hour": parseFloat(price.price.USD).toFixed(3),
            "month": (parseFloat(price.price.USD) * 24 * 30).toFixed(0)
        };
        tmpMap[type] = cost;
    }

    regionToEC2Map[awsRegion] = tmpMap;
}








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