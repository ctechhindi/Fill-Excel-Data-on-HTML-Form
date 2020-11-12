global.browser = require('webextension-polyfill')
const Excel = require("exceljs"); // https://github.com/exceljs/exceljs
import { saveAs } from 'file-saver';

function checkTabURLMatch(tabId, tabURL) {

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

/**
 * If click extension icon
 */
chrome.browserAction.onClicked.addListener(function (a) {
  chrome.windows.getCurrent(function (a) {
    parentWindowId = a.id
  });

  // Parse: Table ID and URL
  window.open(chrome.extension.getURL("popup/popup.html?tabid=" + encodeURIComponent(a.id) + "&url=" + encodeURIComponent(a.url)), "Excel Fill", "toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=660,height=1040,top=0,left=960")
});

/**
 * App Status Check :: checkbox value get
 */
function appStatusCheck() {
  chrome.storage.local.get('valFillExcel_appStatus', function (budget) {
    if (budget.valFillExcel_appStatus === undefined) {
      chrome.browserAction.setIcon({ path: "icons/icon_48.png" });
    } else {
      if (budget.valFillExcel_appStatus === true) {
        chrome.browserAction.setIcon({ path: "icons/icon_48.png" });
      } else {
        chrome.browserAction.setIcon({ path: "icons/icon_disable.png" });
      }
    }
  });
} appStatusCheck();

/**
 * keyboard shortcuts that trigger actions in your extension
 */
chrome.commands.onCommand.addListener(function (command, tab) {
  // console.log("TCL: command", command)
  // console.log("tab", tab)
  // console.log("tab", tab.url)

  // Start/Pause Application
  if (command == "start-stop-app-excel-fill") {
    chrome.storage.local.get('valFillExcel_appStatus', function (budget) {
      if (budget.valFillExcel_appStatus === true) {
        chrome.storage.local.set({ 'valFillExcel_appStatus': false });
      }
      else {
        chrome.storage.local.set({ 'valFillExcel_appStatus': true });
        // Again RUN Script (Again Fill Form Data)
        checkTabURLMatch(tab.id, tab.url)
      }
      appStatusCheck();
    });
  }
});

/**
 * Tabs
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {

    // Check URL Than RUN Script
    checkTabURLMatch(tab.id, tab.url)
  }
});

/**
 * Copy Field Address
 */
function onCopyElement(option, tab) {
  if (option.menuItemId === "copyFieldAddress") {
    chrome.tabs.sendMessage(tab.id, { target: "copyFieldAddress" });
  } else if (option.menuItemId === "insertSiteAddress") {
    var siteInsert = {
      site: tab.url,
      siteType: "fullPath",
      successPage: "",
      successTPageype: "fullPath",
      successMsg: "",
    };

    // Action Site and Site Columns Insert
    var allSiteData = []
    var allSiteColumnsData = []

    // Fetch Old All Action Site URLs
    chrome.storage.local.get(["objectVal__allActionSite", "objectVal__siteExcelColumns"], function (budget) {
      if (budget["objectVal__allActionSite"] != undefined && budget["objectVal__allActionSite"] !== "" && budget["objectVal__allActionSite"].length > 0) {
        allSiteData = budget["objectVal__allActionSite"]
        allSiteColumnsData = budget["objectVal__siteExcelColumns"]
        // Push New Site
        allSiteData.push(siteInsert)
        allSiteColumnsData.push({})
        chrome.storage.local.set({ "objectVal__allActionSite": allSiteData, objectVal__siteExcelColumns: allSiteColumnsData }, function () {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          }
        });
      } else {
        // Push New Site
        allSiteData.push(siteInsert)
        allSiteColumnsData.push({})
        chrome.storage.local.set({ "objectVal__allActionSite": allSiteData, objectVal__siteExcelColumns: allSiteColumnsData }, function () {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          }
        });
      }
    });

    // Open Extension Option Page
    window.open(chrome.runtime.getURL('options/options.html?tab=1&update=0'));

  } else if (option.menuItemId === "generateExcelTemplate") {

    // Generate Excel Template Using Active Page Form Fields
    chrome.tabs.sendMessage(tab.id, { target: "generateExcelTemplate" }, fields => {
      if (fields.length > 0) {
        console.log("Form Fields: ", fields)

        /**
         * Excel Main Sheet: Site Form Data
         */

        // Excel Sheet Content
        const workbook = new Excel.Workbook();
        const sheet = workbook.addWorksheet('Site Form Data'); // Site Form Data
        const sheetDoc = workbook.addWorksheet('Help', { properties: { tabColor: { argb: 'FF00FF00' } } }); // Add Doc/Help Sheet
        const sheetFormAddress = workbook.addWorksheet('Field Address(Not Delete)', { properties: { tabColor: { argb: 'FF4B26' } } });

        // Sheet Columns
        var sheetFirstColumns = []
        var sheetSecondColumns = []
        var sheetThirdColumns = []

        for (let index = 0; index < fields.length; index++) {
          const field = fields[index];
          const fieldKey = field.name + "_" + index

          /**
           * First Sheet: Push Table Column
           */
          sheetFirstColumns.push({ header: field.name, key: fieldKey, width: 10, hidden: false })
          sheet.columns = sheetFirstColumns

          // First Sheet: Get Sheet Column Address
          var col = sheet.getColumn(fieldKey)
          if (col === undefined || col.key === undefined) {
            console.error("This Excel Sheet Table Column Address Not Found!", field.name);
          } else {

            var cellAddress = col.letter + "" + 1 // A1, B2

            // Columns Border
            sheet.getCell(cellAddress).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            // Columns Font
            sheet.getCell(cellAddress).font = { family: 4, size: 11, bold: true };
            // Set cell to wrap-text
            sheet.getCell(cellAddress).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

            // Set Note
            if (field.value !== undefined) {
              if (typeof (field.value) === "object" && field.value.length > 0) {
                var columnComment = ""
                field.value.forEach(val => {
                  if (val.name !== undefined && val.value !== undefined) {
                    columnComment += val.name + " => " + val.value + "\n"
                  } else {
                    columnComment += val + "\n"
                  }
                });
                sheet.getCell(cellAddress).note = columnComment;
              } else {
                sheet.getCell(cellAddress).note = field.value;
              }
            }
          }

          /**
           * Second Sheet: Help Columns
           */
          if (field.field === "select") {
            // HTML Form Field Select
            var selectField_Key = fieldKey + "_Val"
            sheetSecondColumns.push({ header: field.name, key: fieldKey, width: 10, hidden: false })
            sheetSecondColumns.push({ header: field.name, key: selectField_Key, width: 10, hidden: false })
            sheetDoc.columns = sheetSecondColumns

            // Second Sheet: Get Sheet Column Address
            var col_Name = sheetDoc.getColumn(fieldKey)
            var col_Value = sheetDoc.getColumn(selectField_Key)
            if (col_Name === undefined || col_Name.key === undefined || col_Value === undefined || col_Value.key === undefined) {
              console.error("This Excel Sheet Table Column Address Not Found!", field.name);
            } else {
              var name_cellAddress = col_Name.letter + "" + 1 // A1, B2
              var value_cellAddress = col_Value.letter + "" + 1 // A1, B2
              // Marge Cell
              sheetDoc.mergeCells('"' + name_cellAddress + ':' + value_cellAddress + '"');
              // :: Apply Style
              // Columns Border
              sheetDoc.getCell(name_cellAddress).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
              // Columns Font
              sheetDoc.getCell(name_cellAddress).font = { family: 4, size: 11, bold: true };
              // Set cell to wrap-text
              sheetDoc.getCell(name_cellAddress).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            }

          } else {
            sheetSecondColumns.push({ header: field.name, key: fieldKey, width: 10, hidden: false })
            sheetDoc.columns = sheetSecondColumns

            // Second Sheet: Get Sheet Column Address
            var col = sheetDoc.getColumn(fieldKey)
            if (col === undefined || col.key === undefined) {
              console.error("This Excel Sheet Table Column Address Not Found!", field.name);
            } else {
              var cellAddress = col.letter + "" + 1 // A1, B2
              // :: Apply Style
              // Columns Border
              sheetDoc.getCell(cellAddress).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
              // Columns Font
              sheetDoc.getCell(cellAddress).font = { family: 4, size: 11, bold: true };
              // Set cell to wrap-text
              sheetDoc.getCell(cellAddress).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            }
          }

          // Second Sheet: Second Row for field value
          if (field.value !== undefined) {
            if (typeof (field.value) === "object" && field.value.length > 0) {
              if (field.field === "select") {
                // select box element
                // select box: name [], value []
                var startRow = 2
                field.value.forEach(option => {
                  const row = sheetDoc.getRow(startRow);
                  row.getCell(fieldKey).value = option.name
                  row.getCell(selectField_Key).value = option.value
                  startRow++
                });
              } else {
                // radio element
                var startRow = 2
                field.value.forEach(val => {
                  const row = sheetDoc.getRow(startRow);
                  row.getCell(fieldKey).value = val
                  startRow++
                });
              }

            } else {
              const row = sheetDoc.getRow(2);
              row.getCell(fieldKey).value = field.value
            }
          } else {
            const row = sheetDoc.getRow(2);
            row.getCell(fieldKey).value = ""
          }

          /**
           * Third Sheet: Form Field Address
           */
          if (index === 0) {
            for (const key of Object.keys(field)) {
              if (key === "value") { continue }
              sheetThirdColumns.push({ header: key, key: key, width: 10, hidden: false })
              sheetFormAddress.columns = sheetThirdColumns
            }
          }

          // Push Data in the Third Sheet
          sheetFormAddress.addRow(field)
        }

        // First Sheet: Set Height First Row
        sheet.getRow(1).height = 45;

        // Second Sheet: Row Height
        sheetDoc.getRow(1).height = 32

        // Fetch Site Host Name
        try {
          var urlObj = new URL(tab.url)
        } catch (error) {
          throw new Error("Invalid: Tab URL")
        }

        // Save as Excel Sheet in the PC
        workbook.xlsx.writeBuffer().then(function (res) {
          const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          const fileExtension = '.xlsx';
          const blob = new Blob([res], { type: fileType });
          var date = new Date()
          var dateFor = date.getDate() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getFullYear()
          saveAs(blob, urlObj.host + '-' + dateFor + fileExtension);
        });

      } else {
        console.error("Form Field Not Found.")
      }
    });

  } else if (option.menuItemId === "openOptionsPage") {
    // chrome.runtime.id
    // window.open(chrome.runtime.getURL('options.html'));
    chrome.runtime.openOptionsPage();
  }
};

chrome.contextMenus.create({ id: "copyFieldAddress", title: "Copy Field Address", contexts: ["all"] });
chrome.contextMenus.create({ type: "separator", id: "separator2", contexts: ["all"] });
chrome.contextMenus.create({ id: "insertSiteAddress", title: "Insert Site", contexts: ["all"] });
chrome.contextMenus.create({ id: "generateExcelTemplate", title: "Generate Excel Template", contexts: ["all"] });
chrome.contextMenus.create({ type: "separator", id: "separator1", contexts: ["all"] });
chrome.contextMenus.create({ id: "openOptionsPage", title: "Options Page", contexts: ["all"] });

chrome.contextMenus.onClicked.addListener(onCopyElement)