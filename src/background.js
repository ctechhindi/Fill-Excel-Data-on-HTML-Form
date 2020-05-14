global.browser = require('webextension-polyfill')

chrome.browserAction.onClicked.addListener(function (a) {
  chrome.windows.getCurrent(function (a) {
    parentWindowId = a.id
  });

  // Parse: Table ID and URL
  window.open(chrome.extension.getURL("popup/popup.html?tabid=" + encodeURIComponent(a.id) + "&url=" + encodeURIComponent(a.url)), "Excel Fill", "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=720,height=650")
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {

    // Action Chrome Key
    var actionURLKey = "objectVal__actionURL";
    // Keys and Element ID Data
    var keysElement = "objectVal__excelSheetKeys";
    // Excel JSON Data
    var excelJSONData = "objectVal__excelSheetJSONData";

    // Get Data
    chrome.storage.local.get([actionURLKey, excelJSONData, keysElement], function (k) {
      if (k[actionURLKey] !== undefined && k[actionURLKey] !== null) {
        var url = k[actionURLKey];
        if (url.action !== undefined && url.action !== "") {

          // console.log("tab", tab)

          /**
           * TODO: Check Page Path
           * -------------------
           * fullPath, pathName
           */
          if (url.actionType === "fullPath") {
            if (tab.url !== url.action) {
              console.error("Path Not Match", url);
              return
            }
          } else if (url.actionType === "pathName") {
            var tabURLData = new URL(tab.url);
            if (tabURLData.pathname !== url.action) {
              console.error("Path Not Match", url);
              return
            }
          } else {
            return
          }

          // console.log("url.actionType", url.actionType)
          // console.log("excel json data", k[excelJSONData])
          // console.log("keys data", k[keysElement])

          // Keys
          if (k[keysElement] !== undefined && k[keysElement] !== null && Object.keys(k[keysElement]).length > 0) {
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
            console.error("Keys and Element ID Data Not Found!");
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