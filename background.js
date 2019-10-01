'use strict';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("In CORS...");
  var url = "https://a0.p.awsstatic.com/pricing/1.0/ec2/region/us-east-1/ondemand/suse/index.json";

  fetch(url)
      .then(function(response) { response.json().then(data => sendResponse(data)); } )
      .catch(function(err) { console.log(err)});

  return true;
});