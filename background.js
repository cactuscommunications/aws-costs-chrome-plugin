'use strict';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    let url;

    if (request.ec2) {
        url = "https://a0.p.awsstatic.com/pricing/1.0/ec2/region/us-east-1/ondemand/linux/index.json";

        fetch(url)
            .then(function (response) {
                response.json().then(data => sendResponse(data));
            })
            .catch(function (err) {
                console.log(err);
            });
    } else if (request.ebs) {
        url = "https://a0.p.awsstatic.com/pricing/1.0/ec2/region/us-east-1/ebs/index.json";

        fetch(url)
            .then(function (response) {
                response.json().then(data => sendResponse(data));
            })
            .catch(function (err) {
                console.log(err);
            });
    } else if (request.ec2Deprecated) {
        url = "https://a0.p.awsstatic.com/pricing/1.0/ec2/region/us-east-1/previous-generation/ondemand/linux/index.json";

        fetch(url)
            .then(function (response) {
                response.json().then(data => sendResponse(data));
            })
            .catch(function (err) {
                console.log(err);
            });
    } else if (request.RDS) {
        const mySQLurl = "https://a0.p.awsstatic.com/pricing/1.0/rds/mysql/ondemand/multi-az/index.json";
        const storageURL = "https://a0.p.awsstatic.com/pricing/1.0/rds/database-storage/index.json";

        fetch(mySQLurl)
            .then(function (response) {
                response.json().then(function (data) {
                        fetch(storageURL)
                                .then(function (storageResponse) {
                                    storageResponse.json().then(function (storageData) {
                                        sendResponse( { "data" : data, "storageData" : storageData } );
                                    });
                            })
                    });
            })
            .catch(function (err) {
                console.log(err);
            });
    }
    return true;
});