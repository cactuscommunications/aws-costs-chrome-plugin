const regionToEC2Map = {};

export function getEC2InstancePrices(instanceType, isSpot) {
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