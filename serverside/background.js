'use strict';

function fetchEC2PricingData(request, callbackFunction) {
    const url = "https://a0.p.awsstatic.com/pricing/1.0/ec2/region/" + request.region + "/ondemand/linux/index.json";
    const deprecatedUrl = "https://a0.p.awsstatic.com/pricing/1.0/ec2/region/" + request.region + "/previous-generation/ondemand/linux/index.json";
    const spotUrl = "https://website.spot.ec2.aws.a2z.com/spot.js?callback=callback";

    fetch(url)
        .then(function (response) {
            response.json().then(function (data) {
                fetch(deprecatedUrl)
                    .then(function (deprecatedDataResponse) {
                        deprecatedDataResponse.json().then(function (deprecatedData) {
                            fetch(spotUrl)
                                .then(function (response) {
                                    response.text().then(function (text) {
                                        text = text.replace("callback(", "");
                                        text = text.replace(");", "");
                                        callbackFunction({
                                            "data": data,
                                            "deprecatedData": deprecatedData,
                                            "spotData": JSON.parse(text)
                                        });
                                    });
                                }).catch(function (err) {
                                console.log(err);
                            });
                        });
                    });
            });
        })
        .catch(function (err) {
            console.log(err);
        });
}

function fetchEBSPricingData(request, callbackFunction) {
    const url = "https://a0.p.awsstatic.com/pricing/1.0/ec2/region/" + request.region + "/ebs/index.json";

    fetch(url)
        .then(function (response) {
            response.json().then(data => callbackFunction(data));
        })
        .catch(function (err) {
            console.log(err);
        });
}

function fetchRDSPricingData(callbackFunction) {
    const mySQLurl = "https://a0.p.awsstatic.com/pricing/1.0/rds/mysql/ondemand/multi-az/index.json";
    const storageURL = "https://a0.p.awsstatic.com/pricing/1.0/rds/database-storage/index.json";

    fetch(mySQLurl)
        .then(function (response) {
            response.json().then(function (data) {
                fetch(storageURL)
                    .then(function (storageResponse) {
                        storageResponse.json().then(function (storageData) {
                            callbackFunction({"data": data, "storageData": storageData});
                        });
                    });
            });
        })
        .catch(function (err) {
            console.log(err);
        });
}

chrome.runtime.onMessage.addListener(function (request, sender, callbackFunction) {
        if (request.ec2) {
            fetchEC2PricingData(request, callbackFunction);
        } else if (request.ebs) {
            fetchEBSPricingData(request, callbackFunction);
        } else if (request.RDS) {
            fetchRDSPricingData(callbackFunction);
        }
        return true;
    }
);