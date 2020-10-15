global.browser = require('webextension-polyfill')

chrome.browserAction.onClicked.addListener(function (a) {
  chrome.windows.getCurrent(function (a) {
    parentWindowId = a.id
  });

  // Parse: Table ID and URL
  window.open(chrome.extension.getURL("popup/popup.html?tabid=" + encodeURIComponent(a.id) + "&url=" + encodeURIComponent(a.url)), "Excel Fill", "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=660,height=1040,top=0,left=960")
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {

    // Action Page Settings
    var actionURLs = "objectVal__allActionSite";
    // Site Excel Columns
    var siteColumns = "objectVal__siteExcelColumns";
    // Excel JSON Data
    var excelJSONData = "objectVal__excelSheetJSONData";

    // Get Data
    chrome.storage.local.get([actionURLs, excelJSONData, siteColumns], function (k) {
      if (k[actionURLs] !== undefined && k[actionURLs] !== null) {
        var url = k[actionURLs];
        if (url !== null && url.length > 0) {
          // console.log("Tab Option: ", tab)
          // console.log("Action URLs", url)

          // Site Excel Column Data
          if (k[siteColumns] !== undefined && k[siteColumns] !== null && siteColumns.length > 0) {
            // Excel JSON Data
            if (k[excelJSONData] !== undefined && k[excelJSONData] !== null && Object.keys(k[excelJSONData]).length > 0) {
              var excelJSONObj = k[excelJSONData];
              if (excelJSONObj.obj !== undefined && excelJSONObj.obj.length > 0) {

                // Execute Script
                chrome.tabs.executeScript(tabId, {
                  file: '/script/run.js',
                }, function () {
                  if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                  }
                });

              } else {
                console.error("Excel JSON Data Not Found!");
              }

            } else {
              console.error("Excel JSON Object Not Found!");
            }

          } else {
            console.error("Action Site Excel Columns Data Not Found.");
          }

        } else {
          console.error("Action URL Key Not Found");
        }
      } else {
        console.error("Action URLs Key Not Found");
      }
    });
  }
});