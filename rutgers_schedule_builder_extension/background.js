chrome.runtime.onInstalled.addListener(function () {
    console.log("Extension installed");
});

chrome.action.onClicked.addListener(function (activeTab) {
    var url = "https://sims.rutgers.edu/csp/";
    chrome.tabs.create({ url: url });
});
