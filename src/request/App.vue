<template>
  <div class="Request">
    <Header></Header>
    <b-tabs v-model="activeTabIndex" position="is-centered" expanded class="block">
      <!-- Request Data -->
      <b-tab-item label="Request Form Data" icon="earth">
        <div class="container">
          <b-field grouped>
            <!-- Request Submit URL -->
            <b-field label="Request Submit URL" expanded>
              <b-input v-model="request.url" placeholder="Enter Request Submit URL"></b-input>
            </b-field>
            <!-- Request Method -->
            <b-field label="Request Method" expanded>
              <b-select placeholder="Select Request Method" v-model="request.type" expanded>
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="DELETE">DELETE</option>
                <option value="OPTIONS">OPTIONS</option>
              </b-select>
            </b-field>
            <!-- Request Data Type -->
            <b-field label="Request Data Type" expanded>
              <b-select placeholder="Select Request Data Type" v-model="request.dataType" expanded>
                <option value="form">Form Data</option>
                <option value="json">JSON Data</option>
              </b-select>
            </b-field>
          </b-field>
          <b-field grouped>
            <!-- Request Successful Message -->
            <b-field label="Request Successful Message" expanded>
              <b-input v-model="request.successMsg" placeholder="Enter Request Successful Message"></b-input>
            </b-field>
            <!-- Request Success Status Code -->
            <b-field label="Request Success Status Code" expanded>
              <b-input v-model="request.successStatusCode" placeholder="Enter Request Success Status Code"></b-input>
            </b-field>
            <!-- Request Error Message -->
            <b-field label="Request Error Message" expanded>
              <b-input v-model="request.errorMsg" placeholder="Enter Request Error Message"></b-input>
            </b-field>
          </b-field>

          <RequestHeaders v-if="request.headers.length > 0" v-model="request.headers"></RequestHeaders>

          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <h3 class="title is-5">Request Field</h3>
              </div>
            </div>
            <div class="level-right">
              <b-tooltip label="Insert New Request Field">
                <b-button type="is-success" icon-left="plus" @click="insertNewField"></b-button>
              </b-tooltip>&nbsp;
              <b-tooltip label="Clear All Request Field" type="is-danger">
                <b-button type="is-danger" icon-left="delete" @click="deleteRequestFieldData"></b-button>
              </b-tooltip>
              &nbsp;|&nbsp;
              <b-tooltip label="Import Request Field Data" type="is-primary">
                <b-upload v-model="imporFieldsJSONFile" :required="true" @input="importRequestFieldData">
                  <a class="button is-primary">
                    <b-icon icon="file-import"></b-icon>
                    <span>Import</span>
                  </a>
                </b-upload>
              </b-tooltip>&nbsp;
              <a id="exportFieldDataHref" style="display:none"></a>
              <b-tooltip label="Export Request Field Data" type="is-dark">
                <b-button type="is-dark" icon-left="file-export" @click="exportRequestFieldData">Export</b-button>
              </b-tooltip>
            </div>
          </nav>
          <!-- Table: Request Field's -->
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth" v-show="Object.keys(requestFieldData).length > 0">
            <thead>
              <th>Field Required</th>
              <th>Field</th>
              <th>Excel Data Key</th>
              <th>Field Default Value</th>
              <th>Action</th>
            </thead>
            <tbody>
              <tr v-for="(data, index) in requestFieldData" :key="index">
                <td>
                  <b-checkbox v-model="data.isFieldRequired" type="is-danger" :title="'Required: '+ data.isFieldRequired"></b-checkbox>
                </td>
                <td>{{ index }}</td>
                <td>
                  <b-field>
                    <b-select v-model="data.key" placeholder="Select excel key name" expanded>
                      <option value="">--- Empty Value --- </option>
                      <option v-for="option in excelSheetKeys" :value="option.key" :key="option.key">
                        {{ option.key }}
                      </option>
                    </b-select>
                  </b-field>
                </td>
                <td>
                  <b-input v-model="data.defaultValue" placeholder="Enter Field Default Value"></b-input>
                </td>
                <td>
                  <b-tooltip :type="(data.is_runJScript == true)? 'is-success':'is-warning'" label="Insert JS Script">
                    <b-button :type="(data.is_runJScript == true)? 'is-success':'is-warning'" icon-left="nodejs" @click="openScriptModel(index)"></b-button>
                  </b-tooltip>&nbsp;
                  <b-tooltip type="is-danger" label="Delete Field">
                    <b-button type="is-danger" icon-left="delete" @click="deleteFieldData(index)"></b-button>
                  </b-tooltip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-tab-item>
      <!-- Excel Sheet Data -->
      <b-tab-item label="Excel Sheet Data" icon="database">
        <div class="container" v-if="Object.keys(excelSheetJSONData).length > 0">
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth" v-if="Object.keys(excelSheetJSONData.keys).length > 0">
            <thead>
              <th>Saved!</th>
              <th>#</th>
              <th v-for="key in excelSheetJSONData.keys" :key="key">{{ key }}</th>
              <th>Status</th>
              <th>Action</th>
            </thead>
            <tbody>
              <tr v-for="(data, index) in excelSheetJSONData.obj" :key="index" :class="(data.status == true)? 'is-selected':''">
                <td>
                  <div class="field">
                    <b-checkbox v-model="data.status"></b-checkbox>
                  </div>
                </td>
                <td>{{ index + 1}}</td>
                <td v-for="key in excelSheetJSONData.keys" :key="key">{{ data[key] }}</td>
                <td>
                  <b-tooltip label="Reset Request Loading" type="is-danger">
                    <p @click="resetRequestLoading(index)">{{ data.isLoading }}</p>
                  </b-tooltip>
                </td>
                <td>
                  <b-tooltip :type="(data.status === true)? 'is-success':'is-warning'" label="Run Request">
                    <b-button :type="(data.status === true)? 'is-success':'is-warning'" icon-left="run" :label="data.totalErrorRequest.toString()" :loading="data.isLoading" @click="runRequestOnData(index)"></b-button>
                  </b-tooltip>
                </td>
              </tr>
            </tbody>
          </table>
          <table v-else class="table is-bordered is-fullwidth">
            <tr>
              <td class="has-text-centered">
                <p class="has-text-danger is-size-3">Not Data Found!</p>
                <p class="has-text-link is-size-6 is-family-code">Please go to options page.</p>
              </td>
            </tr>
          </table>
        </div>
      </b-tab-item>
    </b-tabs>
    <!-- Key JS Model -->
    <b-modal :active.sync="jsModelData.isOpen" scroll="keep">
      <div class="card">
        <header class="card-header has-background-dark">
          <p class="card-header-title has-text-white">
            JS Script for this key: {{ jsModelData.key }}
          </p>
        </header>
        <div>
          <codemirror v-model="jsModelData.code" :options="jsModelData.options" />
        </div>
        <footer class="card-footer">
          <div class="card-footer-item">
            <div class="field">
              <b-checkbox v-model="jsModelData.isRunScript">Run Script</b-checkbox>
            </div>
          </div>
          <div class="card-footer-item" @click="updateScriptInKey(jsModelData.key)">
            <strong>Save</strong>
          </div>
        </footer>
      </div>
    </b-modal>
    <Footer></Footer>
  </div>
</template>

<script>
import Vue from 'vue'
import VueCodemirror from 'vue-codemirror'
// import base style
import 'codemirror/lib/codemirror.css'
// import language js
import 'codemirror/mode/javascript/javascript.js'
// import theme style
// import 'codemirror/theme/base16-dark.css'
import 'codemirror/theme/monokai.css'
Vue.use(VueCodemirror, /* {
  options: { theme: 'base16-dark', ... },
  events: ['scroll', ...]
} */)

import Header from "../components/Header";
import Footer from "../components/Footer";
import CreateRequest from "../class/CreateRequest"
import RequestHeaders from "../components/RequestHeaders";

export default {
  name: "App",
  components: {
    Header,
    Footer,
    RequestHeaders
  },
  data() {
    return {
      // Active Tab Index
      activeTabIndex: 0,
      // Excel Sheet Keys
      excelSheetKeys: {},
      // Excel JSON Data
      excelSheetJSONData: {},

      // Request Data
      request: {
        url: "",
        type: "POST",
        dataType: "form",
        headers: [],
        successMsg: "",
        successStatusCode: "",
        errorMsg: "",
      },
      // Request Field's Data
      requestFieldData: {},

      // Import Field JSON File
      imporFieldsJSONFile: null,

      // JS Script Model Settings
      jsModelData: {
        isOpen: false,
        key: "",
        isRunScript: false,
        code: "",
        options: {
          tabSize: 2,
          mode: 'text/javascript',
          theme: 'monokai',
          lineNumbers: true,
          line: true,
        },
      },
    }
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
     * Add New Request Field
     */
    insertNewField() {
      this.$buefy.dialog.prompt({
        message: `Field Name`,
        inputAttrs: {
          placeholder: 'Enter Request Field Name',
        },
        trapFocus: true,
        onConfirm: (value) => {
          var fields = value.split(",");
          for (let i = 0; i < fields.length; i++) {
            var fieldName = fields[i];
            if (this.requestFieldData[fieldName] === undefined) {
  
              var newKey = {
                'key': "",
                'field': fieldName,
                'defaultValue': "",
                'jscript': "",
                'isFieldRequired': false,
                'is_runJScript': false,
              };
              
              // Set New Key in the Object
              this.$set(this.requestFieldData, fieldName, newKey)
  
            } else {
              this.$buefy.toast.open({
                message: `This field already exists in the request data.`,
                position: 'is-bottom',
                type: 'is-danger'
              })
            }
          }
        }
      })
    },

    /**
     * Remove Request ALL Field Data
     */
    deleteRequestFieldData() {
      this.$buefy.dialog.confirm({
        title: 'Deleting All Fields',
        message: 'Are you sure you want to <b>delete</b> all fields data? This action cannot be undone.',
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          this.requestFieldData = {};
        }
      });
    },

    /**
     * Delete Request Field Data
     */
    deleteFieldData(index) {
      this.$buefy.dialog.confirm({
        title: 'Deleting Field',
        message: 'Are you sure you want to <b>delete</b> this field? This action cannot be undone.',
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          if (this.requestFieldData[index] !== undefined) {
            this.$delete(this.requestFieldData, index)
          }
        }
      });
    },
    
    /**
     * Import Request Field Data
     */
    importRequestFieldData() {
      var that = this
      if (this.imporFieldsJSONFile !== null && this.imporFieldsJSONFile.type !== undefined) {
        if (this.imporFieldsJSONFile.type === "application/json") {

          var reader = new FileReader();
          reader.onload = function (e) {
            var data = e.target.result;
            if (data !== undefined && data !== "") {
              var jsonData = JSON.parse(data);
              if (jsonData !== "" && jsonData !== null && Object.keys(jsonData).length > 0) {

                /**
                 * Import JSON Data in the Vue js Variable
                 * ----------------------------------------
                 * formFields: this.requestFieldData,
                 * requestSettings: this.request
                 */
                if (jsonData.formFields !== undefined)
                  that.requestFieldData = jsonData.formFields
                if (jsonData.requestSettings !== undefined)
                  that.request = jsonData.requestSettings

              } else {
                that.imporFieldsJSONFile = null
                that.$buefy.toast.open({
                  message: `Field JSON Data Not Found!`,
                  type: 'is-danger'
                })
              }

            } else {
              that.imporFieldsJSONFile = null
              that.$buefy.toast.open({
                message: `File Data Not Found!`,
                type: 'is-danger'
              })
            }
          }
  
          reader.readAsBinaryString(this.imporFieldsJSONFile);
        } else {
          this.imporFieldsJSONFile = null
        }
      } else {
        this.imporFieldsJSONFile = null
      }
    },

    /**
     * Export Request Field's Data
     */
    exportRequestFieldData() {
      if (typeof(this.requestFieldData) === "object" && Object.keys(this.requestFieldData).length > 0) {
        
        // JSON File Content
        var jsonFileContent = {
          formFields: this.requestFieldData,
          requestSettings: this.request
        };

        // Current DateTime
        var dateObj = new Date();
        var date = dateObj.getDate() + "-"+ dateObj.getMonth() + "-"+ dateObj.getFullYear() +"-"+ dateObj.getHours() +"-"+ dateObj.getMinutes() +"-"+ dateObj.getSeconds();
        // Download JSON File
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonFileContent));
        var dlAnchorElem = document.getElementById('exportFieldDataHref');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "fill_extension_request_data-" + date + ".json");
        dlAnchorElem.click();
      }
    },

    /**
     * Add Script in the Key Data
     */
    openScriptModel(index) {
      if (this.requestFieldData[index] !== undefined && Object.keys(this.requestFieldData[index]).length > 0) {
        var keyData = this.requestFieldData[index];
        // console.log("openScriptModel -> keyData", keyData)

        if (keyData.jscript === undefined) {
          this.jsModelData.code = ""
        } else {
          this.jsModelData.code = keyData.jscript
        }

        if (keyData.is_runJScript !== undefined)
          this.jsModelData.isRunScript = keyData.is_runJScript

        // Update Key
        this.jsModelData.key = index
        setTimeout(() => {
          this.jsModelData.isOpen = true
        }, 200);
      }
    },

    /**
     * Update Script in the Key Data
     */
    updateScriptInKey(index) {
      if (this.requestFieldData[index] !== undefined && Object.keys(this.requestFieldData[index]).length > 0) {
        var keyData = this.requestFieldData[index];
        console.log("updateScriptInKey -> keyData", keyData)
        // console.log("updateScriptInKey -> jsModelData.code", this.jsModelData.code)

        keyData["jscript"] = this.jsModelData.code
        keyData["is_runJScript"] = this.jsModelData.isRunScript

        this.$buefy.toast.open({
          message: 'JS Script Updated.',
          type: 'is-success'
        })
      }
    },

    /**
     * Reset Request Loading [False]
     */
    resetRequestLoading(index) {
      if (this.excelSheetJSONData.obj[index] !== undefined && this.excelSheetJSONData.obj[index] !== null) {
        this.excelSheetJSONData.obj[index]['isLoading'] = false;
      }
    },

    /**
     * Run Request
     */
    runRequestOnData(index) {
      var that = this
      if (Object.keys(this.excelSheetJSONData).length > 0 && this.excelSheetJSONData.obj !== undefined)  {
        if (typeof(this.excelSheetJSONData.obj) === "object" && this.excelSheetJSONData.obj.length > 0) {
          if (this.excelSheetJSONData.obj[index] !== undefined && this.excelSheetJSONData.obj[index] !== null) {
            
            // TODO: More Power FULL
            try {

              // Genereate Request Data
              var req = new CreateRequest({
                "url": this.request.url,
                "field": this.requestFieldData,
                "data": this.excelSheetJSONData.obj[index],
                "successMsg": this.request.successMsg,
                "successStatusCode": this.request.successStatusCode,
                // "errorMsg": this.request.errorMsg,
              });
              console.log("runRequestOnData -> req", req)

              // Start: Request Loading
              this.excelSheetJSONData.obj[index].isLoading = true

              // Send Request
              req.sentRequest().then(
                res => {
                  if (res === "Request Success") {
                    console.log("runRequestOnData -> res", res)

                    // Update Excel Data
                    this.excelSheetJSONData.obj[index].status = true

                    // STOP: Request Loading
                    this.excelSheetJSONData.obj[index].isLoading = false
                  }
                },
                error => {
                  console.error("runRequestOnData -> error", error)
                  if (typeof(error.resp) === "string") {
                    var errorMsg = error.resp
                  } else if (typeof(error.resp) === "object") {
                    var errorMsg = JSON.stringify(error.resp)
                  }

                  that.$buefy.toast.open({
                    message: errorMsg,
                    position: 'is-bottom',
                    type: 'is-danger'
                  })

                  // STOP: Request Loading
                  this.excelSheetJSONData.obj[index].isLoading = false

                  // Increase: Total Error Request
                  ++this.excelSheetJSONData.obj[index].totalErrorRequest;
                }
              )

            } catch (e) {
              console.error("CreateRequest ", e)
              that.$buefy.toast.open({
                message: e.toString(),
                position: 'is-bottom',
                type: 'is-danger'
              })
            }
          }
        }
      }
    }
  },

  watch: {

    // Active Tab Index
    activeTabIndex: function (newValue) {
      this.setValueINExtensionStorage(newValue, 'tabVal2__activeTabIndex');
    },

    // Request Data
    request: {
      handler: function(newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__requestData");
      },
      deep: true
    },

    // Request Field Data
    requestFieldData: {
      handler: function(newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__requestFieldData");
      },
      deep: true
    },

    // Excel Sheet JSON Data
    excelSheetJSONData: {
      handler: function(newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__excelSheetJSONData");
      },
      deep: true
    },
  },

  created() {

    this.setDataINVariable("objectVal__excelSheetKeys", "excelSheetKeys");
    this.setDataINVariable("objectVal__excelSheetJSONData", "excelSheetJSONData");

    this.setDataINVariable("objectVal__requestData", "request");
    this.setDataINVariable("objectVal__requestFieldData", "requestFieldData");
  },
  mounted() {
    var that = this

    // Tab 2 Index
    chrome.storage.local.get('tabVal2__activeTabIndex', function (budget) {
      if (budget.tabVal2__activeTabIndex != undefined)
        that.activeTabIndex = budget.tabVal2__activeTabIndex;
    });
  },
}
</script>