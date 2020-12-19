const uiToEBSJSONMap = new Map();
uiToEBSJSONMap.set("Magnetic", "standard");
uiToEBSJSONMap.set("General Purpose", "gp2");
uiToEBSJSONMap.set("General Purpose SSD (gp2)", "gp2");
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

export function getEBSMap() {
    const map = regionToEBSMap[getAWSRegion()];
    if (map != null) {
        return map;
    } else {
        return {};
    }
}

export function getEBSMonthlyPricePerGB(ebsType) {
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