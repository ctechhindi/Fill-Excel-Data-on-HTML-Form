<template>
  <div class="popup">
    <div class="container" style="margin: 10px;">
      <nav class="level">
        <div class="level-left">
          <div class="level-item">
            <h3 class="title is-5">HTML Form Field's Identity</h3>
          </div>
        </div>
        <div class="level-right"></div>
      </nav>
      <table
        class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
        v-show="Object.keys(excelSheetKeys).length > 0"
      >
        <thead>
          <th></th>
          <th>Key</th>
          <th>Element Type</th>
          <th>Action Element</th>
        </thead>
        <tbody>
          <tr v-for="(data, index) in excelSheetKeys" :key="index">
            <td title="Inspect">
              <a @click="inspect(index)">
                <i class="mdi mdi-link"></i>
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
    </div>
  </div>
</template>

<script>
export default {
  name: "Popup",
  data() {
    return {
      // Excel Sheet Keys
      excelSheetKeys: {},
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
        } else if (decodeURIComponent(e[0]) === "tabid") {
          this.activeTab.id = parseInt(e[1]);
        }
      }
    },

    /**
     * Inspect
     */
    inspect(index) {
      var that = this;
      // console.log("inspect -> this.activeTab", this.activeTab)

      // Check Tab Id is Valid
      if (
        this.activeTab.id === undefined ||
        this.activeTab.id === null ||
        this.activeTab.id === ""
      ) {
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
              console.error(
                "inspect -> chrome.runtime.lastError",
                chrome.runtime.lastError.message
              );
              that.$buefy.toast.open({
                message: chrome.runtime.lastError.message,
                position: "is-bottom",
                type: "is-danger"
              });
            } else {
              if (resp) {
                if (
                  resp.excelKey === undefined ||
                  resp.excelKey === null ||
                  resp.excelKey === ""
                ) {
                  return console.error("Excel Key Not Found!");
                }

                /**
                 * Field (ID)
                 */
                if (resp.id !== undefined && resp.id !== "") {
                  // Update Excel Sheet Data
                  that.excelSheetKeys[resp.excelKey].element_type = "id";
                  if (that.excelSheetKeys[resp.excelKey].element === "") {
                    that.excelSheetKeys[resp.excelKey].element = resp.id;
                  } else {
                    that.excelSheetKeys[resp.excelKey].element =
                      that.excelSheetKeys[resp.excelKey].element +
                      "," +
                      resp.id;
                  }
                }

                /**
                 * Field (querySelector)
                 */
                if (resp.querySelector) {
                  // Update Excel Sheet Data
                  that.excelSheetKeys[resp.excelKey].element_type = "querySelector";
                  if (that.excelSheetKeys[resp.excelKey].element === "") {
                    that.excelSheetKeys[resp.excelKey].element = resp.querySelector;
                  } else {
                    that.excelSheetKeys[resp.excelKey].element =
                      that.excelSheetKeys[resp.excelKey].element +
                      "," +
                      resp.querySelector;
                  }
                }
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
    }
  },
  watch: {
    excelSheetKeys: {
      handler: function(newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__excelSheetKeys");
      },
      deep: true
    }
  },
  created() {
    this.setDataINVariable("objectVal__excelSheetKeys", "excelSheetKeys");

    // {@call}
    this.fetchActiveTabData();
  },
  mounted() {}
};
</script>