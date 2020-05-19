<template>
  <div class="options">
    <b-loading :is-full-page="true" :active.sync="isFullPageLoading" :can-cancel="false"></b-loading>
    <Header></Header>
    <b-tabs v-model="activeTabIndex" position="is-centered" expanded class="block">
      <!-- Upload Excel Sheet Data -->
      <b-tab-item label="Upload Data" icon="upload">
        <div class="container">
          <b-field grouped>
            <!-- Excel Date Format Output -->
            <b-tooltip label="Default Format: yyyy-mm-dd" style="width: 100%;">
              <b-field label="Excel Date Format Output" expanded>
                <b-input v-model="excelFileSettings.dateFormat" placeholder="Enter Excel Date Format Output"></b-input>
              </b-field>
            </b-tooltip>
          </b-field>
          <b-collapse class="panel" :open="true">
            <div slot="trigger" class="panel-heading notification is-danger">
              <b-icon icon="upload"></b-icon>
              <strong>&nbsp;Upload Excel Sheet</strong>
            </div>
            <div class="panel-block">
              <div class="content is-small" style="width: -webkit-fill-available;">
                <nav class="level">
                  <div class="level-left">
                    <div class="level-item">
                      <div class="field">
                        <label class="label is-medium">Select excel (.xlsx) file for Upload :</label>
                        <input type="file" id="uploadExcel" @change="uploadExcelSheet($event)" />
                      </div>
                    </div>
                  </div>
                  <div class="level-right">
                    <p class="level-item">
                      <a target="_blank" href="../script/demo-excel-data.xlsx" class="button is-info">
                        <b-icon icon="file-excel"></b-icon>
                        <span>&nbsp;Excel Sample File</span>
                      </a>
                      &nbsp;
                      <button
                        @click="deleteExcelJSONData($event)"
                        class="button is-danger"
                      >
                        <b-icon icon="delete"></b-icon>
                        <span>&nbsp;Delete Data</span>
                      </button>
                    </p>
                  </div>
                </nav>
                <!-- JSON Viewer -->
                <b-field label="JSON Data">
                  <b-input id="json-input" v-model="excelSheetData" type="textarea" disabled></b-input>
                </b-field>
                <button class="button is-success" @click="checkJSONDataValid()">
                  <b-icon icon="check"></b-icon>
                  <span>Check Excel Data is Valid</span>
                </button>
                <hr />
                <p class="jsonError has-text-danger" style="display: none;">
                  There was a problem
                  with the provided JSON. Please check that the JSON is valid.
                </p>
                <div id="output-container" style="display: none;">
                  <h3>Output</h3>
                  <div id="json-container"></div>
                  <div class="demo-options" style="margin-top: 10px;">
                    <button @click="jsonDataExpanAll()" class="button is-primary is-small">Expand All</button>
                    <button @click="jsonDataCollapseAll()" class="button is-success is-small">
                      Collapse All
                    </button>
                    <button @click="jsonDataExpanLevels()" class="button is-danger is-small">
                      Expand Levels
                    </button>
                    Levels:
                    <input type="text" id="levels" value="1" />
                  </div>
                </div>
              </div>
            </div>
          </b-collapse>
        </div>
      </b-tab-item>
      <!-- Application Settings -->
      <b-tab-item label="Settings" icon="settings">
        <div class="container">
          <b-field grouped>
            <!-- Action URL Type -->
            <b-field label="Action URL Type" expanded>
              <b-select placeholder="Select a url type" v-model="url.actionType" @input="changeActionURLType" expanded>
                <option value="fullPath">Full Path</option>
                <option value="pathName">location.pathname</option>
              </b-select>
            </b-field>
            <!-- Action URL -->
            <b-field label="Action URL" expanded>
              <b-input v-model="url.action" placeholder="Enter Action URL"></b-input>
            </b-field>
            <!-- Error URL -->
            <!-- <b-field label="Error URL" expanded>
              <b-input v-model="url.error" placeholder="Enter Error URL"></b-input>
            </b-field> -->
          </b-field>

          <b-field grouped>
            <!-- Success URL Type -->
            <b-field label="Success URL Type" expanded>
              <b-select placeholder="Select a url type" v-model="url.successType" @input="changeSuccessURLType" expanded>
                <option value="fullPath">Full Path</option>
                <option value="pathName">location.pathname</option>
              </b-select>
            </b-field>
            <!-- Success URL -->
            <b-field label="Success URL" expanded>
              <b-input v-model="url.success" placeholder="Enter Success URL"></b-input>
            </b-field>
            <!-- Success URL: Message -->
            <b-field label="Success Message" expanded>
              <b-input v-model="url.successMsg" placeholder="Enter Success Message"></b-input>
            </b-field>
          </b-field>

          <!-- Excel Sheet Keys Data -->
          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <h3 class="title is-5">Excel Sheet Keys</h3>
              </div>
            </div>
            <div class="level-right">
              <b-tooltip label="Fetch Key from Excel Data">
                <b-button type="is-info" icon-left="key" @click="fetchKeysInExcelData"></b-button>
              </b-tooltip>&nbsp;
              <b-tooltip label="Insert New Key">
                <b-button type="is-success" icon-left="plus" @click="insertNewKey"></b-button>
              </b-tooltip>&nbsp;
              <b-tooltip label="Clear All Keys Data" type="is-danger">
                <b-button type="is-danger" icon-left="delete" @click="deleteKeysData"></b-button>
              </b-tooltip>
              &nbsp;|&nbsp;
              <b-tooltip label="Import Key's Data" type="is-primary">
                <b-upload v-model="importKeyJSONFile" :required="true" @input="importKeyData">
                  <a class="button is-primary">
                    <b-icon icon="file-import"></b-icon>
                    <span>Import</span>
                  </a>
                </b-upload>
              </b-tooltip>&nbsp;
              <a id="exportKeysDataHref" style="display:none"></a>
              <b-tooltip label="Export Key's Data" type="is-dark">
                <b-button type="is-dark" icon-left="file-export" @click="exportKeyData">Export</b-button>
              </b-tooltip>
            </div>
          </nav>
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth" v-show="Object.keys(excelSheetKeys).length > 0">
            <thead>
              <th>ON/OFF</th>
              <th>
                <b-tooltip label="Table Header Names in Excel Sheet" position="is-right">
                  Key
                </b-tooltip>
              </th>
              <th>Element Type</th>
              <th>Action Element</th>
              <th>Action</th>
            </thead>
            <tbody>
              <tr v-for="(data, index) in excelSheetKeys" :key="index">
                <td style="width: 130px;">
                  <div class="field">
                    <b-switch v-model="data.is_active" type="is-success">
                      {{ (data.is_active === true)? "ON":"OFF" }}
                    </b-switch>
                  </div>
                </td>
                <td>
                  <span v-if="index === 'form_submit'" title="After the form is successful submit, you can give what script you want to run."><code>{{ index }}</code></span>
                  <span v-else>{{ index }}</span>
                </td>
                <td style="width: 250px;">
                  <b-field>
                    <b-select v-model="data.element_type" placeholder="Select element type" expanded>
                      <option value="id">ID</option>
                      <!-- <option value="class">Class</option> -->
                      <option value="querySelector">document.querySelector()</option>
                    </b-select>
                  </b-field>
                </td>
                <td>
                  <b-input v-model="data.element" placeholder="Enter element"></b-input>
                </td>
                <td style="width: 120px;">
                  <b-tooltip :type="(data.is_runJScript == true)? 'is-success':'is-warning'" label="Insert JS Script">
                    <b-button :type="(data.is_runJScript == true)? 'is-success':'is-warning'" icon-left="nodejs" @click="openScriptModel(index)"></b-button>
                  </b-tooltip>&nbsp;
                  <b-tooltip type="is-danger" label="Delete Key">
                    <b-button type="is-danger" icon-left="delete" @click="deleteKeyData(index)"></b-button>
                  </b-tooltip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </b-tab-item>
      <!-- Data -->
      <b-tab-item label="Excel Data" icon="database">
        <div class="container">
          <!-- Excel Sheet Data -->
          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <h3 class="title is-5">
                  Excel Sheet Data
                  <b-tag type="is-info">{{ excelSheetJSONData.total }}</b-tag>
                </h3>
              </div>
            </div>
            <div class="level-right">
              <b-tooltip label="Fetch Excel Data">
                <b-button type="is-success" icon-left="file" @click="convertExcelData">Fetch Excel Data</b-button>
              </b-tooltip>
              &nbsp;
            </div>
          </nav>
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth" v-if="excelSheetJSONData.obj.length > 0">
            <thead>
              <th>Saved!</th>
              <th>#</th>
              <th v-for="key in excelSheetJSONData.keys" :key="key">{{ key }}</th>
              <th>Status</th>
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
                <td>{{ data.status }}</td>
              </tr>
            </tbody>
          </table>
          <table v-else class="table is-bordered is-fullwidth">
            <tr>
              <td class="has-text-centered">
                <p class="has-text-danger is-size-3">Not Data Found!</p>
                <p class="has-text-link is-size-6 is-family-code">Click Fetch Excel Data Button.</p>
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

// Header
import Header from "../components/Header";
import Footer from "../components/Footer";

export default {
  name: "App",
  components: {
    Header,
    Footer
  },
  data() {
    return {
      // Active Tab Index
      activeTabIndex: 0,
      // Excel Sheet Data
      excelSheetData: "",
      // Excel Date Format Output
      excelFileSettings: {
        dateFormat: "yyyy-mm-dd",
      },
      // Data Keys
      excelSheetKeys: {},
      // Action URL
      url: {
        actionType: "fullPath",
        action: "",
        successType: "fullPath",
        success: "",
        successMsg: "",
        error: "",
      },
      importKeyJSONFile: null,
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
      // Excel Sheet JSON Data
      excelSheetJSONData: {
        keys: [],
        obj: [],
        total: 0,
      },
      // Buefy: Full Page Loading
      isFullPageLoading: false,
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
     * Upload Excel File
     * @param {$event} e
     */
    uploadExcelSheet(e) {
      var that = this;
      e.preventDefault();

      if (this.excelFileSettings.dateFormat === null || that.excelFileSettings.dateFormat === "") {
        console.error("Date Format Invalid");
        return false
      }

      var files = e.target.files,
        f = files[0];
      var reader = new FileReader();

      // Ready The Event For When A File Gets Selected
      reader.onload = function(e) {
        var data = e.target.result;
        var workbook = XLS.read(data, {
          type: "binary",
          cellDates: true,
          dateNF: that.excelFileSettings.dateFormat
        });

        /* DO SOMETHING WITH workbook HERE */
        var first_sheet_name = workbook.SheetNames[0];
        /* Get worksheet */
        var worksheet = workbook.Sheets[first_sheet_name];

        var uploadData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          skipHeader: true
        });

        that.excelSheetData = JSON.stringify(uploadData);

        // Clear Upload Field Value
        $("#uploadExcel").val(null);
      };

      // Tell JS To Start Reading The File.. You could delay this if desired
      reader.readAsBinaryString(f);
    },

    /**
     * Fetch Keys in the Excel Sheet Data
     */
    fetchKeysInExcelData() {
      var that = this
      if (typeof(this.excelSheetData) === "string" && this.excelSheetData.length !== "") {
        var data = JSON.parse(this.excelSheetData);
        if (typeof(data) === "object" && data.length > 0 && data[0] !== undefined) {
          // Data Object Keys
          var dataKeys = Object.keys(data[0]);
          var t = { ...that.excelSheetKeys };
          dataKeys.forEach(item => {
            if (that.excelSheetKeys[item] === undefined) {
              console.log("fetchKeysInExcelData -> item", item)
              t[item] = {
                'key': item,
                'element_type': 'id',
                'element': '',
                'jscript': '',
                'is_runJScript': false,
                'is_active': true,
              };
            }
          });
          this.$set(this, 'excelSheetKeys', t)
          // this.$forceUpdate();
          console.log("fetchKeysInExcelData -> that.excelSheetKeys", that.excelSheetKeys)
        }
      }
    },

    /**
     * Delete Excel JSON Data
     */
    deleteExcelJSONData(e) {
      e.preventDefault();

      this.$buefy.dialog.confirm({
        title: 'Deleting Excel Data',
        message: 'Are you sure you want to <b>delete</b> excel data? This action cannot be undone.',
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          this.excelSheetData = ""
          this.excelSheetJSONData.keys = [];
          this.excelSheetJSONData.obj = [];
          this.excelSheetJSONData.total = 0;
        }
      });
    },

    /**
     * Insert New Key
     */
    insertNewKey() {
      this.$buefy.dialog.prompt({
        message: `Key Name`,
        inputAttrs: {
          placeholder: 'Enter Key Name',
        },
        trapFocus: true,
        onConfirm: (value) => {
          if (this.excelSheetKeys[value] === undefined) {

            var newKey = {
              'key': value,
              'element_type': 'id',
              'element': '',
              'jscript': '',
              'is_runJScript': false,
              'is_active': true,
            };
            
            // Set New Key in the Object
            this.$set(this.excelSheetKeys, value, newKey)

            // Push New Key in the Excel Data
            this.pushNewKeyInExcelData(value)

          } else {
            this.$buefy.toast.open({
              message: `This key already exists in the excel data.`,
              position: 'is-bottom',
              type: 'is-danger'
            })
          }
        }
      })
    },

    /**
     * Push New Key in the All Excel Data
     */
    pushNewKeyInExcelData(newKey) {
      if (this.excelSheetData && this.excelSheetData.length > 0) {

        // Start: Loading
        this.isFullPageLoading = true

        var newData = JSON.parse(this.excelSheetData).map(function(el) {
          var o = Object.assign({}, el);
          o[newKey] = "custom_key";
          return o;
        });

        // 
        this.excelSheetData = JSON.stringify(newData);

        // Start: Loading
        this.isFullPageLoading = false
      }
    },

    /**
     * Delete Key Data
     */
    deleteKeyData(index) {
      this.$buefy.dialog.confirm({
        title: 'Deleting Key',
        message: 'Are you sure you want to <b>delete</b> this key? This action cannot be undone.',
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          if (this.excelSheetKeys[index] !== undefined) {

            // Delete Key in the All Excel Sheet Data
            this.deleteKeyInExcelData(this.excelSheetKeys[index].key);

            this.$delete(this.excelSheetKeys, index);
          }
        }
      });
    },

    /**
     * Push New Key in the All Excel Data
     */
    deleteKeyInExcelData(newKey) {
      if (this.excelSheetData && this.excelSheetData.length > 0) {

        // Start: Loading
        this.isFullPageLoading = true

        var newData = JSON.parse(this.excelSheetData).map(function(el) {
          if (el[newKey] !== undefined) {
            delete el[newKey]
            return el
          }
        });

        this.excelSheetData = JSON.stringify(newData);

        // Start: Loading
        this.isFullPageLoading = false
      }
    },

    /**
     * Delete All Key Data
     */
    deleteKeysData() {
      this.$buefy.dialog.confirm({
        title: 'Deleting All Key',
        message: 'Are you sure you want to <b>delete</b> all keys data? This action cannot be undone.',
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          this.excelSheetKeys = {};
        }
      });
    },

    /**
     * Import Key's Data
     */
    importKeyData() {
      var that = this
      if (this.importKeyJSONFile !== null && this.importKeyJSONFile.type !== undefined) {
        if (this.importKeyJSONFile.type === "application/json") {

          var reader = new FileReader();
          reader.onload = function (e) {
            var data = e.target.result;
            if (data !== undefined && data !== "") {
              var jsonData = JSON.parse(data);
              if (jsonData !== "" && jsonData !== null && Object.keys(jsonData).length > 0) {

                // Import JSON Data in the Vue js Variable
                that.excelSheetKeys = jsonData

              } else {
                that.importKeyJSONFile = null
                that.$buefy.toast.open({
                  message: `Key's JSON Data Not Found!`,
                  type: 'is-danger'
                })
              }

            } else {
              that.importKeyJSONFile = null
              that.$buefy.toast.open({
                message: `File Data Not Found!`,
                type: 'is-danger'
              })
            }
          }
  
          reader.readAsBinaryString(this.importKeyJSONFile);
        } else {
          this.importKeyJSONFile = null
        }
      } else {
        this.importKeyJSONFile = null
      }
    },

    /**
     * Export Key's Data
     */
    exportKeyData() {
      // Current DateTime
      var dateObj = new Date();
      var date = dateObj.getDate() + "-"+ dateObj.getMonth() + "-"+ dateObj.getFullYear() +"-"+ dateObj.getHours() +"-"+ dateObj.getMinutes() +"-"+ dateObj.getSeconds();
      // Download
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.excelSheetKeys));
      var dlAnchorElem = document.getElementById('exportKeysDataHref');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", "fill_extension_keys_data-" + date + ".json");
      dlAnchorElem.click();
    },

    /**
     * Add Script in the Key Data
     */
    openScriptModel(index) {
      // console.log("openScriptModel -> index", index)
      if (this.excelSheetKeys[index] !== undefined && Object.keys(this.excelSheetKeys[index]).length > 0) {
        var keyData = this.excelSheetKeys[index];
        console.log("openScriptModel -> keyData", keyData)

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
      if (this.excelSheetKeys[index] !== undefined && Object.keys(this.excelSheetKeys[index]).length > 0) {
        var keyData = this.excelSheetKeys[index];
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
     * Change Action URL
     * --------------------------------
     * Change Full URL to pathname URL
     */
    changeActionURLType(val) {
      if (val) {
        if (val === "pathName" && this.url.action !== "") {
          try {
            var url = new URL(this.url.action);
            if (url.pathname) {
              this.url.action = url.pathname
            }
          } catch (error) {
            console.error("changeActionURLType -> error", error)
          }
        } else if (val === "fullPath" && this.url.action !== "") {
          try {
            var url = new URL(this.url.action);
            if (!url.pathname) {
              this.url.action = ""
            }
          } catch (error) {
            this.url.action = ""
            console.error("changeActionURLType -> error", error)
          }
        }
      }
    },

    /**
     * Change Success URL
     * --------------------------------
     * Change Full URL to pathname URL
     */
    changeSuccessURLType(val) {
      if (val) {
        if (val === "pathName" && this.url.success !== "") {
          try {
            var url = new URL(this.url.success);
            if (url.pathname) {
              this.url.success = url.pathname
            }
          } catch (error) {
            console.error("changeSuccessURLType -> error", error)
          }
        } else if (val === "fullPath" && this.url.success !== "") {
          try {
            var url = new URL(this.url.success);
            if (!url.pathname) {
              this.url.success = ""
            }
          } catch (error) {
            this.url.success = ""
            console.error("changeSuccessURLType -> error", error)
          }
        }
      }
    },

    /**______________ Convert Data _______________ */

    /**
     * Convert Excel Data to JSON
     * ---------------------------
     * Add Settings Keys
     * ----------------------------------------------------
     * 1. 'status' => Data Successful Saved!
     * 2. 'isLoading' => Request is Under Proccess..
     * 3. `totalErrorRequest` => Count Total Fail Request
     * 
     * Check These Key in the `/script/run.js` File.
     */
    convertExcelData() {
      var that = this

      // Empty Old keys
      this.excelSheetJSONData.keys = [];

      if (this.excelSheetData !== "") {
        var excelData = JSON.parse(this.excelSheetData);
        if (typeof(excelData) === "object" && excelData.length > 0) {
          // console.log("convertExcelData -> excelData", excelData)
          excelData.forEach(function (item, index) {

            // Insert Settings Keys
            excelData[index]['status'] = false;
            excelData[index]['isLoading'] = false;
            excelData[index]['totalErrorRequest'] = 0;

            // Fetch Excel Data Keys
            if (index === 0) {
              if (Object.keys(item).length > 0) {
                // Maximum Four Column Push
                for (let index = 0; index < 4; index++) {
                  var dataKeyObj = Object.keys(item);
                  if (dataKeyObj[index] !== undefined && dataKeyObj[index] !== null) {
                    // Push Key
                    that.excelSheetJSONData.keys.push(dataKeyObj[index]);
                  }
                }
              }
            }
          });

          this.excelSheetJSONData.obj = excelData // Excel JSON Data
          this.excelSheetJSONData.total = excelData.length // Excel JSON Data Length
        }
      }
    },

    /**
     * ___________________ Check JSON Data is Valid _______________________
     */
    checkJSONDataValid: function() {
      var jsonContainer = $("#json-container");

      var error = false;
      try {
        var json = JSON.parse($("#json-input").val());
      } catch (e) {
        error = true;
      }

      if (error === true) {
        $(".jsonError").css("display", "inline");
        $("#output-container").css("display", "none");
      } else {
        $(".jsonError").css("display", "none");
        $("#output-container").css("display", "inline");
      }

      jsonContainer
        .jsonPresenter("destroy") // Clear any previous JSON being presented through this plugin for this container
        .jsonPresenter({
          // Use the jquery.jsonPresenter plugin using the input from the textarea above
          json: json
        })
        .jsonPresenter("expand", 0); // Expand all JSON properties so that none of them are collapsed
    },
    jsonDataExpanAll: function() {
      var jsonContainer = $("#json-container");
      jsonContainer.jsonPresenter("expandAll");
    },
    jsonDataCollapseAll: function() {
      var jsonContainer = $("#json-container");
      jsonContainer.jsonPresenter("collapseAll");
    },
    jsonDataExpanLevels: function() {
      var jsonContainer = $("#json-container");
      var levels = parseInt($("#levels").val());
      jsonContainer.jsonPresenter("expand", levels);
    }
  },
  watch: {
    
    // Active Tab Index
    activeTabIndex: function (newValue) {
      this.setValueINExtensionStorage(newValue, 'tabVal__activeTabIndex');
    },

    // Excel Sheet Data
    excelSheetData: {
      handler: function(newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__excelSheetData");
      },
      deep: true
    },

    // Keys Data
    excelSheetKeys: {
      handler: function(newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__excelSheetKeys");
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

    // Action URL's
    url: {
      handler: function(newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__actionURL");
      },
      deep: true
    },

    // Excel Upload Settings
    excelFileSettings: {
      handler: function(newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__excelFileSettings");
      },
      deep: true
    }
  },
  created() {
    var that = this
    
    this.setDataINVariable("objectVal__excelSheetData", "excelSheetData");
    this.setDataINVariable("objectVal__excelSheetKeys", "excelSheetKeys");
    this.setDataINVariable("objectVal__excelSheetJSONData", "excelSheetJSONData");
    this.setDataINVariable("objectVal__excelFileSettings", "excelFileSettings");
    this.setDataINVariable("objectVal__actionURL", "url");

    // Tab Index
    chrome.storage.local.get('tabVal__activeTabIndex', function (budget) {
      if (budget.tabVal__activeTabIndex != undefined)
        that.activeTabIndex = budget.tabVal__activeTabIndex;
    });
  }
};
</script>