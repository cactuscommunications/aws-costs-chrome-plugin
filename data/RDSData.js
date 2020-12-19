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
