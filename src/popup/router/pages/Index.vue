<template>
  <div class="popup">
    <div class="container" style="margin: 10px;">
      <nav class="level" style="margin-top: 25px;">
        <div class="level-left">
          <div class="level-item">
            <span>
              <h3 class="title is-5">HTML Form Field's Identity</h3>
              <p>Here you can choose which column of Excel data will go in which field of the form.</p>
            </span>
          </div>
        </div>
        <div class="level-right"></div>
      </nav>
      <hr />
      <table
        class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
        v-if="allActionSite.length > 0 && selectActionSite !== null"
      >
        <thead>
          <th>Select</th>
          <th title="Excel Column Name">Excel Column</th>
          <th>Field Type</th>
          <th>Field Address</th>
        </thead>
        <tbody>
          <tr v-for="(data, index) in siteExcelColumns[selectActionSite]" :key="index">
            <td title="Inspect">
              <a @click="inspect(index)">
                <i class="mdi mdi-cursor-default"></i>
              </a>
            </td>
            <td>{{ index }}</td>
            <td style="width: 200px;">
              <b-field>
                <b-select
                  size="is-small"
                  v-model="data.element_type"
                  placeholder="Select element type"
                  expanded
                >
                  <option value="id">ID</option>
                  <option value="class">Class</option>
                  <option value="querySelector">document.querySelector()</option>
                </b-select>
              </b-field>
            </td>
            <td>
              <b-input size="is-small" v-model="data.element" placeholder="Enter element"></b-input>
            </td>
          </tr>
        </tbody>
      </table>
      <table v-else>
        <tr>
          <th style="color: red;">
            <h3>No Data Found!</h3>
            <p>Please First Upload Excel Data in the Option Page.</p>
            <p v-if="selectActionSite === null">Action site not match this site url.</p>
          </th>
        </tr>
      </table>
      <ul>
        <li>
          <a @click="showDropdownBoxValue_Request"># Show the drop-down value because by this we can select the drop-down option.</a>
        </li>
        <li>
          <a @click="showCheckBoxValue_Request"># Show the checkbox value because by this we can select the checkbox.</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "Popup",
  data() {
    return {
      // All Action Site
      allActionSite: [],
      // Select Action Site
      selectActionSite: null,
      // Site Columns
      siteExcelColumns: [],
      // Active Tab Data
      activeTab: {
        id: "",
        url: ""
      }
    };
  },
  methods: {
    /**
     * [Promise]
     * Set Extension Local Data in Vue js Variable
     * @param {*} key
     * @param {*} variable
     * @param {boolean} merge
     */
    setDataINVariable: function(key, variable, merge = false) {
      var that = this;
      return new Promise(function(resolve, reject) {
        chrome.storage.local.get([key], function(budget) {
          if (budget[key] != undefined && budget[key] !== "") {
            if (merge === true) {
              var newData = _.merge(budget[key], that[variable]);
              that[variable] = _.values(newData);
              resolve({ status: true, data: that[variable] });
            } else {
              that[variable] = budget[key];
              resolve({ status: true, data: that[variable] });
            }
          } else {
            resolve({ status: false, key: key, data: "No Not Found!" });
          }
        });
      });
    },

    /**
     * Set Vue JS Variable Value in Extension Local Storage
     */
    setValueINExtensionStorage: function(value, key) {
      try {
        var obj = {};
        obj[key] = value;
        chrome.storage.local.set(obj, function() {
          // Notify that we saved.
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            console.log("Key : " + key + "| New Value : ", value);
          }
        });
      } catch (e) {
        console.error("Caught", e);
      }
    },

    /**
     * Fetch Active Tab Data (id, url)
     */
    fetchActiveTabData() {
      for (
        var b = window.location.search.substring(1), c = b.split("&"), d = 0;
        d < c.length;
        d++
      ) {
        var e = c[d].split("=");
        if (decodeURIComponent(e[0]) === "url") {
          this.activeTab.url = decodeURIComponent(e[1]);
          // check this url in the `allActionSite`
          this.checkURLInActionSite()
        } else if (decodeURIComponent(e[0]) === "tabid") {
          this.activeTab.id = parseInt(e[1]);
        }
      }
    },

    /**
     * Check Active URL in the `allActionSite`
     */
    checkURLInActionSite() {
      try {
        var url = new URL(this.activeTab.url)

        // Check All Action Site Data Found
        if (this.allActionSite.length > 0) {
          for (let index = 0; index < this.allActionSite.length; index++) {
            const item = this.allActionSite[index];
            if (!item.site || !item.siteType) { continue }

            // Check Active URL Match 
            if (item.siteType === "fullPath") { // "fullPath", "pathName"
              if (url.href === item.site) {
                this.selectActionSite = index
                break
              } else { continue }
            } else if (item.siteType === "pathName") {
              if (url.pathname === item.site) {
                this.selectActionSite = index
                break
              } else { continue }
            } else {
              continue
            }
          }

          // Check this tab url match in the action url `successPage` Page
          for (let index2 = 0; index2 < this.allActionSite.length; index2++) {
            const page = this.allActionSite[index2];
            if (!page.successPage || !page.successTPageype) { continue }

            // Check Active URL Match 
            if (page.successTPageype === "fullPath") { // "fullPath", "pathName"
              if (url.href === page.successPage) {
                this.selectActionSite = index2
                break
              } else { continue }
            } else if (page.successTPageype === "pathName") {
              if (url.pathname === page.successPage) {
                this.selectActionSite = index2
                break
              } else { continue }
            } else {
              continue
            }
          }
          console.log("checkURLInActionSite -> this.selectActionSite", this.selectActionSite)
        }

      } catch (error) {
        that.$buefy.toast.open({
          message: error,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },

    /**
     * Inspect
     */
    inspect(index) {
      var that = this;

      // Check Tab Id is Valid
      if (!this.activeTab.id) {
        return console.error("Tab ID Invalid.");
      }

      try {
        // Send Request in the Active Tab and Fetch Request in the onload.js file
        // chrome.tabs.sendMessage
        // chrome.tabs.sendRequest
        chrome.tabs.sendRequest(
          this.activeTab.id,
          { action: "getElementIdentity", keyIndex: index },
          function(resp) {
            if (chrome.runtime.lastError) {
              console.error("inspect -> chrome.runtime.lastError", chrome.runtime.lastError.message);
              that.$buefy.toast.open({
                message: "Please Reload Form Site.",
                position: "is-bottom",
                type: "is-danger"
              });
            } else {
              if (resp) {
                if (!resp.excelKey) {
                  return console.error(" Column Key Not Found!");
                }

                /**
                 * Field (ID)
                 */
                if (resp.id !== undefined && resp.id !== "") {
                  // Update Excel Sheet Data
                  that.siteExcelColumns[that.selectActionSite][resp.excelKey].element_type = "id";
                  if (that.siteExcelColumns[that.selectActionSite][resp.excelKey].element === "") {
                    that.siteExcelColumns[that.selectActionSite][resp.excelKey].element = resp.id;
                  } else {
                    that.siteExcelColumns[that.selectActionSite][resp.excelKey].element =
                      that.siteExcelColumns[that.selectActionSite][resp.excelKey].element +
                      "," +
                      resp.id;
                  }
                }

                /**
                 * Field (querySelector)
                 */
                if (resp.querySelector) {
                  // Update Excel Sheet Data
                  that.siteExcelColumns[that.selectActionSite][resp.excelKey].element_type =
                    "querySelector";
                  if (that.siteExcelColumns[that.selectActionSite][resp.excelKey].element === "") {
                    that.siteExcelColumns[that.selectActionSite][resp.excelKey].element =
                      resp.querySelector;
                  } else {
                    that.siteExcelColumns[that.selectActionSite][resp.excelKey].element =
                      that.siteExcelColumns[that.selectActionSite][resp.excelKey].element +
                      "," +
                      resp.querySelector;
                  }
                }

                // TODO: Get Tab Id: Popup Window and Focus Tab
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                  var currTab = tabs[0];
                  if (currTab) {
                    console.log("inspect -> currTab", currTab)
                    chrome.tabs.update(currTab.id, {selected: true});
                  }
                });

                that.$buefy.toast.open({
                  message: "Form field address has been catched.",
                  position: "is-bottom",
                  type: "is-success"
                });
              }
            }
          }
        );
      } catch (error) {
        console.error("inspect -> error", error);
        that.$buefy.toast.open({
          message: error,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },

    /**
     * Show Checkbox Value in the Form Page
     */
    showCheckBoxValue_Request() {
      var that = this;

      if (!this.activeTab.id) {
        return console.error("Tab ID Invalid.");
      }

      try {
        chrome.tabs.sendRequest(
          this.activeTab.id, { action: "showCheckboxValue"},
          function(resp) {
            if (chrome.runtime.lastError) {
              console.error("inspect -> chrome.runtime.lastError", chrome.runtime.lastError.message);
              that.$buefy.toast.open({
                message: "Please Reload Form Site.",
                position: "is-bottom",
                type: "is-danger"
              });
            } else {
            }
          }
        );
      } catch (error) {
        console.error("inspect -> error", error);
        that.$buefy.toast.open({
          message: error,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    },

    /**
     * Show Drop-down Box Value in the Form Page
     * 1. change select to ul list
     * 2. download name and value list in the excel sheet
     */
    showDropdownBoxValue_Request() {
      var that = this;

      if (!this.activeTab.id) {
        return console.error("Tab ID Invalid.");
      }

      try {
        chrome.tabs.sendRequest(
          this.activeTab.id, { action: "showSelectBoxValue"},
          function(resp) {
            if (chrome.runtime.lastError) {
              console.error("inspect -> chrome.runtime.lastError", chrome.runtime.lastError.message);
              that.$buefy.toast.open({
                message: "Please Reload Form Site.",
                position: "is-bottom",
                type: "is-danger"
              });
            } else {
            }
          }
        );
      } catch (error) {
        console.error("inspect -> error", error);
        that.$buefy.toast.open({
          message: error,
          position: "is-bottom",
          type: "is-danger"
        });
      }
    }
  },
  watch: {
    siteExcelColumns: {
      handler: function(newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__siteExcelColumns");
      },
      deep: true
    },

    // Action All Site
    allActionSite: {
      handler: function (newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__allActionSite");
      },
      deep: true,
    },
  },
  async created() {
    await this.setDataINVariable("objectVal__siteExcelColumns", "siteExcelColumns");
    var out = await this.setDataINVariable("objectVal__allActionSite", "allActionSite");
    if (out.status === true) {
      if (out.data !== undefined && out.data.length > 0) {
        // {@call}
        this.fetchActiveTabData();
      }
    }
  },
  mounted() {}
};
</script>