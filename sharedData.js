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
regionToIDMap["South America (Sao Paulo)"] = "sa-east-1";

const regionToEC2Map = {};

function getAWSRegion() {
    const currentRegion = $("div#regionMenuContent").children().first().text();
    const regionID = regionToIDMap[currentRegion];
    return regionID;
}

function getEC2InstancePrices(instanceType, isSpot) {
    const awsRegion = getAWSRegion();
    const nullMap = {"ondemand": {"hour": 0.0, "month": 0.0}, "spot": {"hour": 0.0, "month": 0.0}};
    var spotString = "";
    if(isSpot) {
        spotString = "spot";
    } else {
       spotString = "ondemand";
    }

    if (Object.keys(regionToEC2Map).includes(awsRegion)) {
        const map = regionToEC2Map[awsRegion];
        if (map != null) {
            return map[instanceType][spotString];
        } else {
            return nullMap[spotString];
        }
    } else {
        chrome.runtime.sendMessage({ec2: true, region: awsRegion}, function (data) {
            writeEC2Data(data["data"], data["deprecatedData"], data["spotData"], awsRegion);
        });

        return nullMap;
    }
}

function spotPriceInRegion(spotData, instanceType, awsRegion) {
    let awsRegionToFind = awsRegion;
    if(awsRegion === "us-east-1") {
        awsRegionToFind = "us-east";
    }

    //console.log("Trying to find spot price for " + instanceTypeToFind + " in " + awsRegion);

    const regionsArray = spotData.config.regions;
    for(let regionArrayIndex in regionsArray) {
        const theRegion = regionsArray[regionArrayIndex];
        const theRegionName = regionsArray[regionArrayIndex].region;

        if(theRegionName === awsRegionToFind) {
            const instanceTypeGroups = theRegion.instanceTypes;
            for (let instanceTypeGroup in instanceTypeGroups) {
                let instanceTypesInRegion = instanceTypeGroups[instanceTypeGroup].sizes;
                for (let instanceTypeIndex in instanceTypesInRegion) {
                    const theInstanceType = instanceTypesInRegion[instanceTypeIndex];
                    if (theInstanceType.size === instanceType) {
                        const priceForLinux = theInstanceType.valueColumns[0].prices.USD;
                        return priceForLinux;
                    }
                }
            }
        }
    }
    return 0.0;
}

function writeEC2Data(data, deprecatedData, spotData, awsRegion) {
    const tmpMap = {};
    for (const price of data.prices) {
        const type = price.attributes["aws:ec2:instanceType"];
        const spotPricePerHour = spotPriceInRegion(spotData, type, awsRegion);
        const cost = {
            "ondemand": {
                "hour": parseFloat(price.price.USD).toFixed(3),
                "month": (parseFloat(price.price.USD) * 24 * 30).toFixed(0)
            },
            "spot": {
                "hour": parseFloat(spotPricePerHour).toFixed(3),
                "month": (parseFloat(spotPricePerHour) * 24 * 30).toFixed(0)
            }
        };
        tmpMap[type] = cost;
    }
    for (const price of deprecatedData.prices) {
        const type = price.attributes["aws:ec2:instanceType"];
        const spotPricePerHour = spotPriceInRegion(spotData, type, awsRegion);
        const cost = {
            "ondemand": {
                "hour": parseFloat(price.price.USD).toFixed(3),
                "month": (parseFloat(price.price.USD) * 24 * 30).toFixed(0)
            },
            "spot": {
                "hour": parseFloat(spotPricePerHour).toFixed(3),
                "month": (parseFloat(spotPricePerHour) * 24 * 30).toFixed(0)
            }
        };
        tmpMap[type] = cost;
    }

    regionToEC2Map[awsRegion] = tmpMap;
}

const uiToEBSJSONMap = new Map();
uiToEBSJSONMap.set("Magnetic", "standard");
uiToEBSJSONMap.set("General Purpose", "gp2");
uiToEBSJSONMap.set("Cold HDD", "sc1");
uiToEBSJSONMap.set("Provisioned IOPS", "io1");
uiToEBSJSONMap.set("Throughput Optimized HDD", "st1");

const regionToEBSMap = {};

function writeEBSData(data, awsRegion) {
    const tmpMap = {};
    for (const price of data.prices) {
        let type = price.attributes["aws:ec2:volumeType"];
        let cost = parseFloat(price.price.USD);

        if (uiToEBSJSONMap.has(type)) {
            tmpMap[uiToEBSJSONMap.get(type)] = cost;
        }
    }

    regionToEBSMap[awsRegion] = tmpMap;
}

function getEBSMap() {
    const map = regionToEBSMap[awsRegion];
    if (map != null) {
        return map;
    } else {
        return {};
    }
}

function getEBSMonthlyPricePerGB(ebsType) {
    const awsRegion = getAWSRegion();
    const nullMap = {ebsType: 0.0};

    if (Object.keys(regionToEBSMap).includes(awsRegion)) {
        const map = regionToEBSMap[awsRegion];
        if (map != null) {
            return map[ebsType];
        } else {
            return nullMap;
        }
    } else {
        chrome.runtime.sendMessage({ebs: true, region: awsRegion}, function (ebsData) {
            writeEBSData(ebsData, awsRegion);
        });

        return nullMap;
    }
}


const regionToRDSCostMap = {};

function getRDSCosts() {
    const awsRegion = getAWSRegion();
    const nullMap = {driveCost: 0.0};

    if (Object.keys(regionToRDSCostMap).includes(awsRegion)) {
        const map = regionToRDSCostMap[awsRegion];
        if (map != null) {
            return map;
        } else {
            return nullMap;
        }
    } else {
        chrome.runtime.sendMessage({RDS: true, region: awsRegion}, function (data) {
            parseInstanceData(data["data"], data["storageData"], awsRegion);
        });

        return nullMap;
    }
}

function parseInstanceData(dbData, storageData, awsRegion) {
    const tmpMap = {};
    for (const data of dbData.prices) {
        const type = data.attributes["aws:rds:instanceType"];
        tmpMap[type] = (parseFloat(data.price.USD) * 24 * 30).toFixed(0);
    }

    for (const data of storageData.prices) {
        if (data.attributes["aws:rds:usagetype"] === "RDS:GP2-Storage") {
            tmpMap["gbpCost"] = parseFloat(data.price.USD).toFixed(3);
        }
    }

    regionToRDSCostMap[awsRegion] = tmpMap;
}
