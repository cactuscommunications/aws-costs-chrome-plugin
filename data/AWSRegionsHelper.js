const regionToIDMap = {};
regionToIDMap["N. Virginia"] = "us-east-1";
regionToIDMap["US East (N. Virginia)"] = "us-east-1";

regionToIDMap["Ohio"] = "us-east-2";
regionToIDMap["US East (Ohio)"] = "us-east-2";

regionToIDMap["N. California"] = "us-west-1";
regionToIDMap["US West (N. California)"] = "us-west-1";

regionToIDMap["Oregon"] = "us-west-2";
regionToIDMap["US West (Oregon)"] = "us-west-2";

regionToIDMap["Central"] = "ca-central-1";
regionToIDMap["Canada (Central)"] = "ca-central-1";

regionToIDMap["Frankfurt"] = "eu-central-1";
regionToIDMap["EU (Frankfurt)"] = "eu-central-1";

regionToIDMap["Ireland"] = "eu-west-1";
regionToIDMap["EU (Ireland)"] = "eu-west-1";

regionToIDMap["London"] = "eu-west-2";
regionToIDMap["EU (London))"] = "eu-west-2";

regionToIDMap["Paris"] = "eu-west-3";
regionToIDMap["EU (Paris)"] = "eu-west-3";

regionToIDMap["Stockholm"] = "eu-north-1";
regionToIDMap["EU (Stockholm)"] = "eu-north-1";

regionToIDMap["Hong Kong"] = "ap-east-1";
regionToIDMap["Asia Pacific (Hong Kong)"] = "ap-east-1";

regionToIDMap["Tokyo"] = "ap-northeast-1";
regionToIDMap["Asia Pacific (Tokyo)"] = "ap-northeast-1";

regionToIDMap["Seoul"] = "ap-northeast-2";
regionToIDMap["Asia Pacific (Seoul)"] = "ap-northeast-2";

regionToIDMap["Osaka-Local"] = "ap-northeast-3";
regionToIDMap["Asia Pacific (Osaka-Local)"] = "ap-northeast-3";

regionToIDMap["Singapore"] = "ap-southeast-1";
regionToIDMap["Asia Pacific (Singapore)"] = "ap-southeast-1";

regionToIDMap["Sydney"] = "ap-southeast-2";
regionToIDMap["Asia Pacific (Sydney)"] = "ap-southeast-2";

regionToIDMap["Mumbai"] = "ap-south-1";
regionToIDMap["Asia Pacific (Mumbai)"] = "ap-south-1";

regionToIDMap["Bahrain"] = "me-south-1";
regionToIDMap["Middle East (Bahrain)"] = "me-south-1";

regionToIDMap["Sao Paulo"] = "sa-east-1";
regionToIDMap["South America (Sao Paulo)"] = "sa-east-1";

function getAWSRegion() {
    $("button").each(function (index, elm) {
        const btnControls = $(this).attr("aria-controls");
        if(btnControls != null && btnControls === "menu--regions") {
            const currentRegion = $(this).children().first().children().first().text();
            return regionToIDMap[currentRegion];
        }
    });

    //SGA - hack to get this runing for demo purposes
    return regionToIDMap["N. Virginia"];
}