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
                <b-input
                  v-model="excelFileSettings.dateFormat"
                  placeholder="Enter Excel Date Format Output"
                ></b-input>
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
                      <a
                        target="_blank"
                        href="../assets/demo-excel-data.xlsx"
                        class="button is-info"
                      >
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
                    <button
                      @click="jsonDataExpanAll()"
                      class="button is-primary is-small"
                    >Expand All</button>
                    <button
                      @click="jsonDataCollapseAll()"
                      class="button is-success is-small"
                    >Collapse All</button>
                    <button
                      @click="jsonDataExpanLevels()"
                      class="button is-danger is-small"
                    >Expand Levels</button>
                    Levels:
                    <input type="text" id="levels" value="1" />
                  </div>
                </div>
              </div>
            </div>
          </b-collapse>
        </div>
      </b-tab-item>

      <!-- Page Settings -->
      <b-tab-item label="Page Settings" icon="settings">
        <div class="container">

          <!-- Insert New Site -->
          <nav class="level">
            <div class="level-left">
              <div class="level-item">
                <h3 class="title is-5">Form Site</h3>
              </div>
            </div>
            <div class="level-right">
              <b-tooltip label="Insert New Site">
                <!-- Add New Site  -->
                <b-button
                  type="is-success"
                  icon-left="plus"
                  @click="isOpenNewSiteModel = true"
                >Insert Site</b-button>
              </b-tooltip>&nbsp;|&nbsp;
              <a id="exportKeysDataHref" style="display:none"></a>
              <b-tooltip label="Export Page Settings Data" type="is-dark" v-if="allActionSite.length > 0">
                <b-button type="is-dark" icon-left="file-export" @click="exportPageSettingsData">Export</b-button>
              </b-tooltip>
              &nbsp;
              <b-tooltip label="Import Page Settings Data" type="is-primary">
                <b-upload v-model="importPageSettingsJSONFile" :required="true" @input="importPageSettingsData">
                  <a class="button is-primary">
                    <b-icon icon="file-import"></b-icon>
                    <span>Import</span>
                  </a>
                </b-upload>
              </b-tooltip>
              &nbsp;|&nbsp;
              <b-tooltip label="Page Settings" type="is-primary">
                <b-button @click="isOpenNewSettingsModel = true" type="is-warning" icon-left="settings">
                  Settings
                </b-button>
              </b-tooltip>
            </div>
          </nav>

          <!-- Show All Site -->
          <table class="table is-bordered is-narrow is-hoverable is-fullwidth" v-if="allActionSite.length > 0">
            <thead>
              <th>Select</th>
              <th>Site</th>
              <th>Success Page</th>
              <th>Success Message</th>
              <th style="width: 130px; text-align: center;">Action</th>
            </thead>
            <tbody>
              <tr v-for="(data, index) in allActionSite" :key="index">
                <td>
                  <div class="field">
                    <b-radio v-model="selectActionSite" :native-value="index" type="is-success"></b-radio>
                  </div>
                </td>
                <td style="font-size: small;">
                  <b-tooltip :label="'Site Type: '+ data.siteType">
                    {{ data.site }}
                  </b-tooltip>
                </td>
                <td style="font-size: small;">
                  <b-tooltip :label="'Site Type: '+ data.successTPageype">
                    {{ data.successPage }}
                  </b-tooltip>
                </td>
                <td style="font-size: small;">{{ data.successMsg }}</td>
                <td style="text-align: right;">
                  <b-button size="is-small" type="is-info" title="Edit Site Information" icon-left="pencil" @click="editSiteInformation(index)"></b-button>
                  <b-button size="is-small" type="is-danger" title="Delete Site Information" icon-left="delete" @click="deleteSiteInformation(index)"></b-button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Excel Sheet Column Data -->
          <div v-if="allActionSite.length > 0" style="padding-top: 35px;">
            <nav class="level">
              <div class="level-left">
                <div class="level-item">
                  <h3 class="title is-5">Selected Site Excel Sheet Column</h3>
                </div>
              </div>
              <div class="level-right">
                <b-tooltip label="Fetch Column from Excel Data">
                  <b-button type="is-info" icon-left="key" @click="fetchColInExcelData"></b-button>
                </b-tooltip>&nbsp;
                <b-tooltip label="Insert New Column">
                  <b-button type="is-success" icon-left="plus" @click="insertNewColumn"></b-button>
                </b-tooltip>&nbsp;|&nbsp;
                <b-tooltip label="Clear All Column Data" type="is-danger">
                  <b-button type="is-danger" icon-left="delete" @click="clearSiteColumnData">Clear Colums</b-button>
                </b-tooltip>&nbsp;
              </div>
            </nav>
            <table
              class="table is-bordered is-narrow is-hoverable is-fullwidth"
              v-show="siteExcelColumns.length > 0 && selectActionSite !== undefined && siteExcelColumns[selectActionSite] !== undefined"
            >
              <thead v-if="Object.keys(siteExcelColumns[selectActionSite]).length > 0">
                <th>ON/OFF</th>
                <th>
                  <b-tooltip label="Table Header Names in Excel Sheet" position="is-right">Excel Column</b-tooltip>
                </th>
                <th>Field Type</th>
                <th>Field Element Address</th>
                <th>RUN Script</th>
                <th style="text-align: center;">Action</th>
              </thead>
              <tbody v-if="Object.keys(siteExcelColumns[selectActionSite]).length > 0">
                <tr v-for="(data, index) in siteExcelColumns[selectActionSite]" :key="index">
                  <td style="width: 130px;">
                    <div class="field">
                      <b-switch
                        v-model="data.is_active"
                        type="is-success"
                      >{{ (data.is_active === true)? "ON":"OFF" }}</b-switch>
                    </div>
                  </td>
                  <td>
                    <span
                      v-if="data.key === 'form_filled'"
                      title="After the form is successful feeded, you can give what script you want to run."
                    >
                      <code :title="index">{{ data.key }}</code>
                    </span>
                    <span
                      v-else-if="data.key === 'entry_saved'"
                      title="After the form is successful submit, you can give what script you want to run."
                    >
                      <code :title="index">{{ data.key }}</code>
                    </span>
                    <span
                      v-else-if="data.key === 'page_loaded'"
                      title="After the page is fully loaded, you can give your Custom Script."
                    >
                      <code :title="index">{{ data.key }}</code>
                    </span>
                    <span
                      v-else-if="data.key === 'fill_action'"
                      title="If you do not want Automatic Form Feed or your form opens after any request, then you can place Javascript event in any HTML Element in the page."
                    >
                      <code :title="index">{{ data.key }}</code>
                    </span>
                    <span v-else :title="index">{{ data.key }}</span>
                  </td>
                  <td style="width: 250px;">
                    <b-field v-if="['page_loaded'].indexOf(data.key) < 0">
                      <b-select
                        v-model="data.element_type"
                        placeholder="Select element type"
                        expanded
                      >
                        <option value="id">ID</option>
                        <!-- <option value="class">Class</option> -->
                        <option value="querySelector">document.querySelector()</option>
                      </b-select>
                    </b-field>
                  </td>
                  <td>
                    <b-field>
                      <b-input
                        v-if="['page_loaded'].indexOf(data.key) < 0"
                        v-model="data.element"
                        placeholder="Enter element"
                      ></b-input>
                    </b-field>
                    <b-tooltip
                      v-if="['fill_action', 'form_filled', 'entry_saved'].indexOf(data.key) !== -1"
                      label="Set HTML Element Event Type"
                      position="is-top"
                    >
                      <b-field>
                        <b-select
                          v-model="data.event_type"
                          placeholder="Select element type"
                          expanded
                        >
                          <option value="click">click</option>
                          <option value="focus">focus</option>
                          <option value="change">change</option>
                          <option value="dblclick">dblclick</option>
                          <option value="copy">copy</option>
                          <option value="cut">cut</option>
                          <option value="paste">paste</option>
                          <option value="submit">submit</option>
                          <option value="focusin">focusin</option>
                          <option value="focusout">focusout</option>
                          <option value="mousedown">mousedown</option>
                          <option value="mouseenter">mouseenter</option>
                          <option value="mouseleave">mouseleave</option>
                          <option value="mousemove">mousemove</option>
                          <option value="mouseup">mouseup</option>
                          <option value="mouseover">mouseover</option>
                          <option value="mouseout">mouseout</option>
                          <option value="input">input</option>
                          <option value="keydown">keydown</option>
                          <option value="keypress">keypress</option>
                          <option value="keyup">keyup</option>
                          <option value="load">load</option>
                          <option value="unload">unload</option>
                          <option value="force">force</option>
                        </b-select>
                      </b-field>
                    </b-tooltip>
                  </td>
                  <td style="width: 110px;">
                    <div class="field">
                      <b-switch
                        v-model="data.is_runJScript"
                        type="is-success"
                        size="is-small"
                      >{{ (data.is_runJScript === true)? "Yes":"No" }}</b-switch>
                    </div>
                  </td>
                  <td style="width: 130px; text-align: right;">
                    <b-tooltip
                      :type="(data.is_runJScript == true)? 'is-success':'is-warning'"
                      label="Insert JS Script"
                    >
                      <b-button
                        :type="(data.is_runJScript == true)? 'is-success':'is-warning'"
                        icon-left="nodejs"
                        size="is-small"
                        @click="openScriptModel(index)"
                      ></b-button>
                    </b-tooltip>&nbsp;
                    <b-tooltip label="Column Settings">
                      <b-button
                        type="is-primary"
                        size="is-small"
                        icon-left="settings"
                        @click="openColumnSettingsModel(index)"
                      ></b-button>
                    </b-tooltip>&nbsp;
                    <b-tooltip type="is-danger" label="Delete Column">
                      <b-button type="is-danger" size="is-small" icon-left="delete" @click="deleteColumnData(index)"></b-button>
                    </b-tooltip>
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <th colspan="6" class="has-text-danger is-uppercase has-text-centered" style="padding: 30px;">Site Excel Columns Data Not Found!</th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </b-tab-item>

      <!-- Excel Data -->
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
                <b-button
                  type="is-success"
                  icon-left="file"
                  @click="convertExcelData"
                >Fetch Excel Data</b-button>
              </b-tooltip>&nbsp;
            </div>
          </nav>
          <table
            class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
            v-if="excelSheetJSONData.obj.length > 0"
          >
            <thead>
              <th>Saved!</th>
              <th>#</th>
              <th v-for="key in excelSheetJSONData.keys" :key="key">{{ key }}</th>
              <th>Is Saved</th>
            </thead>
            <tbody>
              <tr
                v-for="(data, index) in excelSheetJSONData.obj"
                :key="index"
                :class="(data.status == true)? 'is-selected':''"
              >
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

      <!-- About Us / Support  -->
      <b-tab-item label="About/Support" icon="information">
        <div class="container">
          <h1 class="title is-5">Fill Excel Data in the Online Forms</h1>
          <ul>
            <li><a href="https://youtu.be/IV6yMHf2rNo" target="_blank" rel="noopener noreferrer"><b-icon icon="youtube"></b-icon> Tutorial (Hindi) with English Subtitle</a></li>
            <li><a href="https://bit.ly/3lONmlS" target="_blank" rel="noopener noreferrer"><b-icon icon="git"></b-icon> GitHub</a></li>
            <li><a href="https://github.com/ctechhindi/Fill-Excel-Data-on-HTML-Form/blob/master/Documentation.md" target="_blank" rel="noopener noreferrer"><b-icon icon="information"></b-icon> Documentation</a></li>
            <li><a href="https://www.patreon.com/ctechhindi" target="_blank" rel="noopener noreferrer"><b-icon icon="patreon"></b-icon> Patreon</a></li>
            <li><a href="https://www.paypal.com/paypalme2/ctechhindi" target="_blank" rel="noopener noreferrer"><b-icon icon="paypal"></b-icon> PayPal</a></li>
          </ul>
          <br>
          <h1 class="title is-5">Support Me for Motivation</h1>
          <ul>
            <li><code>₹10+</code> <a target="_blank" href="https://ctechhindi.blogspot.com/2020/10/support-page-fill-excel-data-cth-google.html">Donate an Amount of your Choice</a></li>
            <li><code>₹50&nbsp;</code> <a target="_blank" href="https://ctechhindi.blogspot.com/2020/10/support-page-fill-excel-data-cth-google.html">Thank you for supporting C Tech Hindi.</a></li>
            <li><code>₹100</code> <a target="_blank" href="https://ctechhindi.blogspot.com/2020/10/support-page-fill-excel-data-cth-google.html">Your name will be put on the extension option page.</a></li>
            <li><code>₹200</code> <a target="_blank" href="https://ctechhindi.blogspot.com/2020/10/support-page-fill-excel-data-cth-google.html">Your name will be put to the top of extension option page.</a></li>
            <li><code>₹500</code> <a target="_blank" href="https://ctechhindi.blogspot.com/2020/10/support-page-fill-excel-data-cth-google.html">Your name or a company logo will be put to extension option page.</a></li>
            <li><code>₹500+</code> <a target="_blank" href="https://ctechhindi.blogspot.com/2020/10/support-page-fill-excel-data-cth-google.html">Your name or a company logo will be put to extension option page and github repository readme page.</a></li>
          </ul>
        </div>
      </b-tab-item>

    </b-tabs>

    <!-- Column JS Model -->
    <b-modal :active.sync="jsModelData.isOpen" scroll="keep">
      <div class="card">
        <header class="card-header has-background-dark">
          <p class="card-header-title has-text-white">JS Script for this key: {{ jsModelData.key }}</p>
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
          <div class="card-footer-item" @click="updateScriptInColumn(jsModelData.key)">
            <strong>Save</strong>
          </div>
        </footer>
      </div>
    </b-modal>

    <!-- Add New Site Model -->
    <b-modal
      :active.sync="isOpenNewSiteModel"
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
    >
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Site Details</p>
        </header>
        <section class="modal-card-body">
          <!-- Site URL -->
          <b-field label="Site URL" expanded>
            <b-input v-model="url.site" placeholder="Enter Site URL"></b-input>
          </b-field>
          <!-- Site URL Type -->
          <b-field label="Site URL Type" expanded>
            <b-select
              placeholder="Select a url type"
              v-model="url.siteType"
              @input="changeActionURLType"
              expanded
            >
              <option value="fullPath">Full Path</option>
              <option value="pathName">location.pathname</option>
            </b-select>
          </b-field>
          <hr />
          <p class="title is-6 has-text-success">Information after successfully submitting the form.</p>
          <!-- Success URL -->
          <b-field label="Success URL" expanded>
            <b-input v-model="url.successPage" placeholder="Enter Success URL"></b-input>
          </b-field>
          <!-- Success URL Type -->
          <b-field label="Success URL Type" expanded>
            <b-select
              placeholder="Select a url type"
              v-model="url.successTPageype"
              @input="changeSuccessURLType"
              expanded
            >
              <option value="fullPath">Full Path</option>
              <option value="pathName">location.pathname</option>
            </b-select>
          </b-field>
          <!-- Success URL: Message -->
          <b-field label="Success Message" expanded>
            <b-input v-model="url.successMsg" placeholder="Enter Success Message"></b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="saveSiteInformation">Save</button>
        </footer>
      </div>
    </b-modal>

    <!-- Settings Model -->
    <b-modal
      :active.sync="isOpenNewSettingsModel"
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
      :width="640" scroll="keep"
    >
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title"><b-icon icon="settings"></b-icon>&nbsp;Settings</p>
        </header>
        <section class="modal-card-body">
          <!-- Application Status Bar -->
          <div class="field">
            <b-switch v-model="appSettings.isStatusBar"><code>ON/OFF</code> Application Status Bar (Toolbar)</b-switch>
          </div>
          <!-- Application Status Bar Position -->
          <b-tooltip label="Application Status Bar Position" type="is-info" position="is-right">
            <div class="field has-addons" v-if="appSettings.isStatusBar" style="padding-bottom: 20px;">
              <b-radio-button v-model="appSettings.statusBarPosition"
                native-value="top"
                type="is-primary">
                <b-icon icon="close"></b-icon>
                <span>Top</span>
              </b-radio-button>
              <b-radio-button v-model="appSettings.statusBarPosition"
                native-value="bottom"
                type="is-success">
                <b-icon icon="check"></b-icon>
                <span>Bottom</span>
              </b-radio-button>
            </div>
          </b-tooltip>

          <!-- Typewriter Speed -->
          <b-field label="Set Typewriter Effect Speed Range (milliseconds)">
            <p class="control">
              <span class="button is-static">Minimum</span>
            </p>
            <b-input type="number" v-model="appSettings.typeWriterMinSpeed" placeholder="Minimum Milliseconds of Typewriter" expanded></b-input>
            <p class="control">
              <span class="button is-static" style="background-color: #006177fc;color: white;">milliseconds (1000 milliseconds = 1 seconds)</span>
            </p>
          </b-field>
          <b-field style="padding-bottom: 20px;">
            <p class="control">
              <span class="button is-static">Maximum</span>
            </p>
            <b-input type="number" v-model="appSettings.typeWriterMaxSpeed" placeholder="Maximum Milliseconds of Typewriter" expanded></b-input>
            <p class="control">
              <span class="button is-static" style="background-color: #006177fc;color: white;">milliseconds (1000 milliseconds = 1 seconds)</span>
            </p>
          </b-field>

          <!-- Change the background color of the data filled field. -->
          <div class="field">
            <b-switch v-model="appSettings.isFieldBgColor"><code>ON/OFF</code> Change the background color of the data filled field</b-switch>
          </div>
          <b-field v-if="appSettings.isFieldBgColor">
            <b-input type="color" v-model="appSettings.fieldBgColor" expanded></b-input>
          </b-field>
        </section>
      </div>
    </b-modal>

    <!-- Site Column Settings Model -->
    <b-modal
      :active.sync="isOpenSiteColSettingsModel"
      :width="640" scroll="keep"
    >
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head" style="border-bottom: 0px solid #dbdbdb; border-radius: 0px;">
          <p>Column Settings:&nbsp;</p>
          <span v-if="activeSiteColNameOrignal !== null" class="tag is-danger" :title="activeSiteColName">{{ activeSiteColNameOrignal }}</span>
        </header>
        <section class="modal-card-body">
          <!-- This Field Type use fetchColInExcelData() function -->
          <!-- Field Type: text, select, file, checkbox, radio, multi-select, textarea -->
          <b-field label="Field Type" v-if="['fill_action', 'page_loaded', 'form_filled', 'entry_saved'].indexOf(activeSiteColNameOrignal) == -1">
            <b-select placeholder="Select Field Type" v-model="colSettings.field_type" expanded>
              <option value="text">Text</option>
              <option value="select">Select (Drop-down)</option>
              <option value="multiple">Multiple Select (Drop-down)</option>
              <option value="checkbox">Checkbox</option>
              <option value="radio">Circle Checkbox (Radio)</option>
              <option value="date">Date</option>
            </b-select>
          </b-field>
          <!-- Info Message Box: Multiple Checkbox -->
          <b-message type="is-info" v-if="colSettings.field_type === 'checkbox'">
            <p>Multiple checkbox appears like this <b-icon icon="checkbox-marked"></b-icon> and in these we can select multiple checkboxes.</p>
          </b-message>
          <!-- Info Message Box: Single Checkbox (Radio) -->
          <b-message type="is-info" v-if="colSettings.field_type === 'radio'">
            <p>The single checkbox appears like this <b-icon icon="radiobox-marked"></b-icon> and we can select only one such as Gender Male or Female.</p>
          </b-message>
          <!-- Field: Select Option with Drop-down value/name -->
          <b-field label="How to fill the data in this Field" v-if="(['select', 'multiple'].indexOf(colSettings.field_type) !== -1)">
            <b-select placeholder="Type" v-model="colSettings.check_value_through" expanded>
              <option value="">Through of Name/Value</option>
              <option value="name">Through of Name</option>
              <option value="value">Through of Value</option>
            </b-select>
          </b-field>
          <!-- If excel column value is empty then fill this default value -->
          <b-field label="If excel column value is empty then fill this default value" v-if="['fill_action', 'page_loaded', 'form_filled', 'entry_saved'].indexOf(activeSiteColNameOrignal) == -1" expanded>
            <b-input v-model="colSettings.default_value" placeholder="Enter Field Deafult Value"></b-input>
          </b-field>
          <!-- Field: Select Option with RegExp -->
          <b-field label="If you want to match the excel data with this form field data then turn on RegExp." v-if="(['select', 'multiple', 'radio', 'checkbox'].indexOf(colSettings.field_type) !== -1)">
            <b-checkbox v-model="colSettings.check_value_with_regexp">Search Data with RegExp</b-checkbox>
          </b-field>

          <!-- Only Field Type: Date -->
          <div v-if="(['date'].indexOf(colSettings.field_type) !== -1)" style="padding-bottom: 10px;">
            <label class="label">Convert Date Format</label>
            <b-field>
              <b-tooltip label="Date format of your excel sheet: DD-MM-YYYY" style="min-width: 240px;">
                <b-input v-model="colSettings.dateOfExcel" placeholder="Date format of your excel sheet" expanded></b-input>
              </b-tooltip>
              <p class="control">
                <span class="button is-static">Change To</span>
              </p>
              <b-tooltip label="Date format of your site: YYYY-MM-DD" style="min-width: 240px;">
              <b-input v-model="colSettings.dateOfSite" placeholder="Date format of your site" expanded></b-input>
              </b-tooltip>
            </b-field>
            <a href="https://github.com/ctechhindi/Fill-Excel-Data-on-HTML-Form#v015" target="_blank">Know all date format</a>
          </div>

          <!-- Trigger Javascript Event  -->
          <div v-if="['fill_action', 'page_loaded', 'form_filled', 'entry_saved'].indexOf(activeSiteColNameOrignal) == -1" style="padding-bottom: 10px;">
            <label class="label">Trigger Javascript Event</label>
            <b-field>
              <p class="control">
                <b-checkbox-button v-model="colSettings.isRunEvent" :native-value="true" type="is-dark">
                  <b-icon icon="calendar-text"></b-icon>
                  <span style="padding-right: 38px;">&nbsp; Events</span>
                </b-checkbox-button>
              </p>
              <b-taginput v-show="colSettings.isRunEvent" @typing="getFilteredEvents" v-model="colSettings.js_events" :data="javascriptEventList" :open-on-focus="true" type="is-dark" style="width: 100%;" dropdown-position="top" placeholder="Search and Select Event" autocomplete></b-taginput>
            </b-field>
          </div>

          <!-- After filling the data of this field, filling the data of another field. -->
          <div v-if="['fill_action', 'page_loaded', 'form_filled', 'entry_saved'].indexOf(activeSiteColNameOrignal) == -1">
            <label class="label">After filling the data of this field, filling the data of another field</label>
            <b-field>
              <p class="control">
                <b-checkbox-button v-model="colSettings.isAfterFillFields" :native-value="true" type="is-warning">
                  <b-icon icon="file-excel"></b-icon>
                  <span style="padding-right: 38px;" title="Excel Sheet Column Name">&nbsp; Column Name</span>
                </b-checkbox-button>
              </p>
              <b-taginput v-show="colSettings.isAfterFillFields" v-model="colSettings.afterFillFields" type="is-warning" style="width: 100%;" placeholder="Enter Excel Sheet Column Name"></b-taginput>
            </b-field>
          </div>

          <!-- Pre-Define Keys -->
          <!-- Action Name -->
          <b-field label="If Entry Saved Then Run Action" v-if="['entry_saved'].indexOf(activeSiteColNameOrignal) !== -1">
            <b-select placeholder="Select Action" v-model="colSettings.action_name" expanded>
              <option value="redirect">Redirect to Another Page</option>
            </b-select>
          </b-field>
          <!-- Action Value -->
          <b-field label="Action Value" v-if="['redirect'].indexOf(colSettings.action_name) !== -1">
            <b-input v-model="colSettings.action_value" placeholder="Enter Field Action Value"></b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot" style="border-bottom: 0px solid #dbdbdb; border-radius: 0px;">
          <button class="button is-primary" @click="saveColumnSettings">Save</button>
        </footer>
      </div>
    </b-modal>

    <!-- Release New Version -->
    <b-modal :active.sync="isModelNewVersion" scroll="keep">
      <b-message type="is-primary" aria-close-label="Close message">
        <section>
          <div class="container">
            <h1 class="title is-5"><b-icon icon="history"></b-icon>&nbsp;Release Notes (changelog)</h1>
            <div class="content">
              <div class="timeline">
                <div v-for="release in releaseNotesData" :key="release.version">
                  <header class="timeline-header">
                    <span class="tag is-primary is-medium">{{ release.version }}</span>
                  </header>
                  <div class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                      <p class="heading">{{ release.date }}</p>
                      <div v-for="desc in release.desc" :key="desc.index" style="margin-bottom: 5px;">
                        <span class="tag is-hidden-mobile" v-bind:class="applyReleaseTagClass(desc.tag)" v-bind:style="applyReleaseTagStyle(desc.tag)">{{ desc.tag }}</span>
                        <span style="padding-left: 15px; font: small-caption;" v-html="desc.name"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </b-message>
    </b-modal>

    <!-- Footer -->
    <Footer></Footer>
  </div>
</template>

<script>
import Vue from "vue";
import VueCodemirror from "vue-codemirror";
// import base style
import "codemirror/lib/codemirror.css";
// import language js
import "codemirror/mode/javascript/javascript.js";
// import theme style
// import 'codemirror/theme/base16-dark.css'
import "codemirror/theme/monokai.css";
Vue.use(
  VueCodemirror /* {
  options: { theme: 'base16-dark', ... },
  events: ['scroll', ...]
} */
);

// https://wikiki.github.io/components/timeline/
import 'bulma-extensions/bulma-timeline/dist/css/bulma-timeline.min.css'

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
      /**
       * Custom/Pre-Define Key in the Excel Data
       */
      preDefineKey: [ "fill_action", "page_loaded", "form_filled", "entry_saved", "status", "isLoading", "totalErrorRequest"],
      // Active Tab Index
      activeTabIndex: 3,
      // Excel Sheet Data
      excelSheetData: "",
      // Excel Date Format Output
      excelFileSettings: {
        dateFormat: "yyyy-mm-dd",
      },
      // Excel First Sheet Table Header (Sheet Columns)
      excelFirstSheetColumnData: "",
      // All Ready Define Field Address in the Excel Sheet
      fieldAddressExcelData: "",
      importPageSettingsJSONFile: null,
      // JS Script Model Settings
      jsModelData: {
        isOpen: false,
        key: "",
        isRunScript: false,
        code: "",
        options: {
          tabSize: 2,
          mode: "text/javascript",
          theme: "monokai",
          lineNumbers: true,
          line: true,
        },
      },
      // Excel Sheet JSON Data
      excelSheetJSONData: {
        keys: [], // For Show Max 4 Excel Columns Data in the Option Page
        obj: [], // Excel Data for Feed Entry in the Action URL
        total: 0, // Total Entry
      },
      // Buefy: Full Page Loading
      isFullPageLoading: false,
      // Add New Site: Model
      isOpenNewSiteModel: false,
      // Application Settings
      isOpenNewSettingsModel: false,
      // Application Status Bar
      appSettings: {
        isStatusBar: false,
        statusBarPosition: "top",
        // Typewriter Speed
        typeWriterMinSpeed: 1,
        typeWriterMaxSpeed: 5,
        // Change the background color of the data filled field.
        isFieldBgColor: false,
        fieldBgColor: "",
      },
      // Insert Site URL Data
      url: {
        index: false, // index for update data
        site: "",
        siteType: "fullPath",
        successPage: "",
        successTPageype: "fullPath",
        successMsg: "",
      },
      // All Action Site
      allActionSite: [],
      // Select Action Site
      selectActionSite: 0,
      // Site Excel Data Columns
      siteExcelColumns: [],
      // Action Site Column Settings Model Status
      isOpenSiteColSettingsModel: false,
      // Active Site Column Name
      activeSiteColName: null,
      activeSiteColNameOrignal: null,
      /**
       * Model: Column Settings Data
       *---- If update then update in these functions -----
       * openColumnSettingsModel()
       * saveColumnSettings()
       */
      colSettings: {
        // Field Type
        field_type: "text",
        // Check Excel Data through element name or value [Select, Checkbox, Radio]
        check_value_through: "name",
        // Check Excel Data through element name or value with regexp [Select, Checkbox, Radio]
        check_value_with_regexp: false,
        // If excel column value is empty then fill this default value
        default_value: "",
        // Action Name
        action_name: "",
        // Action Value
        action_value: "",
        // Js Event for Key
        isRunEvent: false,
        js_events: [], // Events Names
        // if field type is date
        dateOfExcel: "DD-MM-YYYY",
        dateOfSite: "YYYY-mm-DD",
        // After filling the data of this field, filling the data of another field
        isAfterFillFields: false,
        afterFillFields: [],
      },
      // Javascript Events
      javascriptEventList: ["click", "dblclick", "change", "copy", "cut", "paste", "submit", "focus", "focusin", "focusout", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseup", "mouseover", "mouseout", "input", "keydown", "keypress", "keyup", "load", "unload"],
      javascriptEventListFilter: ["click", "dblclick", "change", "copy", "cut", "paste", "submit", "focus", "focusin", "focusout", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseup", "mouseover", "mouseout", "input", "keydown", "keypress", "keyup", "load", "unload"],
      // Release New Version
      isModelNewVersion: true,
      releaseNotesData: [
        // Tags: NEW, ADDED, FIXED, IMPROVED
        {
          version: '0.1.7 - 0.1.8',
          date: 'Thursday, 12 November 2020',
          desc: [
            { tag: 'IMPROVED', name: 'If your data is not able to feed after this update, then fetch the Excel column again.' },
            { tag: 'NEW', name: 'Typewriter Effect and Set Typewriter Speed while filling data in the field' },
            { tag: 'NEW', name: 'Change Field Background color of fill data completed in the form field.' },
            { tag: 'NEW', name: 'Start/Pause Application With <code>Alt+Q</code>' },
            { tag: 'FIXED', name: 'if name attribute not found in the form field then also generate excel sheet.' },
            { tag: 'ADDED', name: '<a href="https://www.youtube.com/playlist?list=PLmrTMUhqzS3hCXSMbmgmh71-h-kwYAQ3t" target="_blank">💻 Video Tutorial - Playlist</a>' },
            { tag: 'ADDED', name: '<a href="https://github.com/ctechhindi/Fill-Excel-Data-on-HTML-Form#v018" target="_blank">Others Changelog</a>' },
          ],
        }
      ]
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
    setDataINVariable: function (key, variable, merge = false) {
      var that = this;
      return new Promise(function (resolve, reject) {
        chrome.storage.local.get([key], function (budget) {
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
    setValueINExtensionStorage: function (value, key) {
      try {
        var obj = {};
        obj[key] = value;
        chrome.storage.local.set(obj, function () {
          // Notify that we saved.
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            // console.log("Key : " + key + "| New Value : ", value);
          }
        });
      } catch (e) {
        console.error("Caught", e);
      }
    },

    /**
     * Output numbers with leading zeros
     * @param {*} num 
     * @param {*} places 
     */
    zeroPad(num, places) {
      var zero = places - num.toString().length + 1;
      return Array(+(zero > 0 && zero)).join("0") + num;
    },

    /**
     * Upload Excel File
     * @param {$event} e
     */
    uploadExcelSheet(e) {
      var that = this;
      e.preventDefault();

      if (
        this.excelFileSettings.dateFormat === null ||
        that.excelFileSettings.dateFormat === ""
      ) {
        console.error("Date Format Invalid");
        return false;
      }

      var files = e.target.files,
        f = files[0];
      var reader = new FileReader();

      // Ready The Event For When A File Gets Selected
      reader.onload = function (e) {
        var data = e.target.result;

        var workbook = XLS.read(data, {
          type: "binary",
          cellDates: true,
          dateNF: that.excelFileSettings.dateFormat,
        });

        // DO SOMETHING WITH workbook HERE
        var first_sheet_name = workbook.SheetNames[0];
        // Get worksheet
        var worksheet = workbook.Sheets[first_sheet_name];
        var uploadData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false, // for sheet date
          skipHeader: true,
        });

        // First Excel Sheet Table Header Names (Columns Name)
        const firstSheetheader = []
        const columnCount = XLSX.utils.decode_range(worksheet['!ref']).e.c + 1
        for (let i = 0; i < columnCount; ++i) {
          firstSheetheader[i] = worksheet[`${XLSX.utils.encode_col(i)}1`].v
        }

        that.excelSheetData = JSON.stringify(uploadData);
        // Excel First Sheet Table Header (Sheet Columns)
        that.excelFirstSheetColumnData = JSON.stringify(firstSheetheader);

        /**
         * Check Sheet Name `Field Address(Not Delete)` in the Upload Excel Sheets
         */
        if (workbook.SheetNames.indexOf("Field Address(Not Delete)") !== -1) {
          var field_address_sheet = workbook.SheetNames[workbook.SheetNames.indexOf("Field Address(Not Delete)")];
          var columnsAddress = workbook.Sheets[field_address_sheet];
          var addressData = XLSX.utils.sheet_to_json(columnsAddress, {
            raw: false,
            skipHeader: true,
          });

          // All Ready Define Field Address in the Excel Sheet
          that.fieldAddressExcelData = JSON.stringify(addressData);
        }

        // Clear Upload Field Value
        $("#uploadExcel").val(null);
      };

      // Tell JS To Start Reading The File.. You could delay this if desired
      reader.readAsBinaryString(f);
    },

    /**
     * Delete Excel JSON Data
     */
    deleteExcelJSONData(e) {
      e.preventDefault();

      this.$buefy.dialog.confirm({
        title: "Deleting Excel Data",
        message:
          "Are you sure you want to <b>delete</b> excel data? This action cannot be undone.",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => {
          this.excelSheetData = "";
          this.fieldAddressExcelData = "";
          this.excelSheetJSONData.keys = [];
          this.excelSheetJSONData.obj = [];
          this.excelSheetJSONData.total = 0;

          // Remove Request Page Key Data: `objectVal__requestStatusData`
          chrome.storage.local.remove(
            ["objectVal__requestStatusData"],
            function () {
              var error = chrome.runtime.lastError;
              if (error) {
                console.error(error);
              }
            }
          );
        },
      });
    },

    /**
     * Fetch Columns in the Excel Sheet Data
     */
    fetchColInExcelData() {

      // Check Excel Sheet Data
      if (!this.excelSheetData) {
        this.$buefy.toast.open({
          message: `<b>Error: </b> First, upload the Excel sheet in the Upload Data Tab.`,
          type: 'is-danger'
        })
        return false
      }

      // Check Active Site and Active Site Data is Exists
      if (this.selectActionSite === null || this.allActionSite[parseInt(this.selectActionSite)] === undefined) {
        this.$buefy.toast.open({
          message: `<b>Error: </b> Active Site and Active Site Data is Exists.`,
          type: 'is-danger'
        })
        return false
      }

      // Check Excel First Sheet Columns Name
      var excelColumns = JSON.parse(this.excelFirstSheetColumnData);
      if (typeof excelColumns !== "object" || excelColumns.length <= 0) {
        this.$buefy.toast.open({
          message: `<b>Error: </b> Excel First Sheet Columns Data Not Found.`,
          type: 'is-danger'
        })
        return false
      }

      // All Ready Define Field Address in the Excel Sheet (Field Address(Not Delete))
      if (!this.fieldAddressExcelData === false) {
        var excelColAddress = JSON.parse(this.fieldAddressExcelData);
        if (typeof excelColAddress !== "object" || excelColAddress.length <= 0) {
          excelColAddress = undefined // if empty then undefined variable
        } else {
          // Modify Object
          var keysObjectData = {}
          for (let index = 0; index < excelColAddress.length; index++) {
            const keyObj = excelColAddress[index];
            keysObjectData[keyObj.name] = keyObj
          }
        }
      }

      // First Sheet Columns Name
      var col = {};
      excelColumns.forEach((item, index) => {
        var indexKey = this.zeroPad(index, 5)
        var objeKey = indexKey + "_" + item;

        if (this.siteExcelColumns[parseInt(this.selectActionSite)][objeKey] === undefined) {
          var fetchedCol = {
            key: item,
            element_type: "id", // id, querySelector
            event_type: "click",
            element: "",
            jscript: "",
            is_runJScript: false,
            is_active: true,
            // Column Settings
            settings: {},
          };

          // Set Field Address: In the excel sheet (Field Address(Not Delete))
          if (keysObjectData !== undefined && Object.keys(keysObjectData).length > 0) {
            if (keysObjectData[item] !== undefined) {
              // Column Data
              var keysObject = keysObjectData[item];

              // Field Name: input, textarea, select
              // Field Type: text, email, radio, checkbox, select, multiple, textarea
              if (!keysObject.field === false && !keysObject.fieldType === false) {
                // Select Box
                if (keysObject.field === "select" && keysObject.fieldType === "select") {
                  // Update Column Settings
                  fetchedCol["settings"]["field_type"] = "select"
                  // Select Option with Drop-down value/name
                  fetchedCol["settings"]["check_value_through"] = ""
                } else if (keysObject.field === "select" && keysObject.fieldType === "multiple") {
                  // Update Column Settings: Field Type
                  fetchedCol["settings"]["field_type"] = "multiple"
                  // Select Option with Drop-down value/name
                  fetchedCol["settings"]["check_value_through"] = ""
                }
              }

              // Field: selector
              if (!keysObject.selector === false) {
                fetchedCol["element_type"] = "querySelector"
                fetchedCol["element"] = keysObject.selector
              }
            }
          }

          // Push Column Data
          this.$set(col, objeKey, fetchedCol)
          // col[objeKey] = fetchedCol

        } else {
          this.$set(col, objeKey, this.siteExcelColumns[parseInt(this.selectActionSite)][objeKey])
          // col[objeKey] = this.siteExcelColumns[parseInt(this.selectActionSite)][objeKey]
        }
      });

      // this.$set(object|Array, key|number, value)
      this.$set(this.siteExcelColumns, parseInt(this.selectActionSite), col)

      this.$buefy.toast.open({
        message: `Fetch all excel sheet table header name.`,
        position: "is-bottom",
        type: "is-success"
      })
    },

    /**
     * Insert New Column in the Site Columns
     */
    insertNewColumn() {
      this.$buefy.dialog.prompt({
        message: `Column Name`,
        inputAttrs: {
          placeholder: "Enter Column Name",
        },
        trapFocus: true,
        onConfirm: (value) => {
          if (typeof(this.siteExcelColumns[parseInt(this.selectActionSite)]) === "object") {
            var length = Object.keys(this.siteExcelColumns[parseInt(this.selectActionSite)]).length
            if (length === 0) { var index = 0 } else { var index = length }

            // KEY NAME: 00000_{key_name}
            var indexKey = this.zeroPad(index, 5)
            var objeKey = indexKey + "_" + value;

            // Fetch Only key name, remove first 6 characters
            var onlyKeyName = Object.keys(this.siteExcelColumns[parseInt(this.selectActionSite)]).map((item) => { return item.slice(6) })
            // Check Key name in this array
            if (onlyKeyName.indexOf(value) === -1) {
              var newCol = {
                key: value,
                element_type: "id",
                event_type: "click", // Only for this key `fill_action`
                element: "",
                jscript: "",
                is_runJScript: false,
                is_active: true,
                // Column Settings
                settings: {},
              };

              // Set New Column in the Object
              this.$set(this.siteExcelColumns[parseInt(this.selectActionSite)], objeKey, newCol);

              // Push New Column in the Excel Data
              this.pushNewColumnInExcelData(value);
            } else {
              this.$buefy.toast.open({
                message: `This column already exists in the excel data.`,
                position: "is-bottom",
                type: "is-danger",
              });
            }
          } else {
            console.error("Invalid Columns Variable Data Type.");
          }
        },
      });
    },

    /**
     * Push New Column in the All Excel Data
     */
    pushNewColumnInExcelData(newCol) {
      if (this.excelSheetData && this.excelSheetData.length > 0) {
        // Start: Loading
        this.isFullPageLoading = true;

        var newData = JSON.parse(this.excelSheetData).map((el) => {
          var o = Object.assign({}, el);
          if (o[newCol] === undefined) {
            if (this.preDefineKey.indexOf(newCol) !== -1) {
              o[newCol] = "custom_key";
            } else {
              o[newCol] = null;
            }
          }
          return o;
        });

        //
        this.excelSheetData = JSON.stringify(newData);

        // Start: Loading
        this.isFullPageLoading = false;
      }
    },

    /**
     * Delete Column Data
     */
    deleteColumnData(index) {
      this.$buefy.dialog.confirm({
        title: "Deleting Column",
        message: "Are you sure you want to <b>delete</b> this column? This action cannot be undone.",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => {
          if (this.siteExcelColumns[parseInt(this.selectActionSite)][index] !== undefined) {
            this.$delete(this.siteExcelColumns[parseInt(this.selectActionSite)], index);
          }
        },
      });
    },

    /**
     * Delete Site Columns Data
     */
    clearSiteColumnData() {
      this.$buefy.dialog.confirm({
        title: "Deleting Site Columns Data",
        message:
          "Are you sure you want to <b>delete</b> all columns data? This action cannot be undone.",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => {
          this.$set(this.siteExcelColumns, parseInt(this.selectActionSite), {})
        },
      });
    },

    /**
     * Import Page Settings Data
     */
    importPageSettingsData() {
      var that = this;
      if (this.importPageSettingsJSONFile !== null && this.importPageSettingsJSONFile.type !== undefined) {
        if (this.importPageSettingsJSONFile.type === "application/json") {
          var reader = new FileReader();
          reader.onload = function (e) {
            var data = e.target.result;
            if (data !== undefined && data !== "") {
              var jsonData = JSON.parse(data);
              if (jsonData !== "" && jsonData !== null && Object.keys(jsonData).length > 0) {
                // Import JSON Data in the Vue js Variable
                that.allActionSite = jsonData.allActionSite;
                that.siteExcelColumns = jsonData.siteExcelColumns;
              } else {
                that.importPageSettingsJSONFile = null;
                that.$buefy.toast.open({
                  message: `Page Settings JSON Data Not Found!`,
                  type: "is-danger",
                });
              }
            } else {
              that.importPageSettingsJSONFile = null;
              that.$buefy.toast.open({
                message: `File Data Not Found!`,
                type: "is-danger",
              });
            }
          };

          reader.readAsBinaryString(this.importPageSettingsJSONFile);
        } else {
          this.importPageSettingsJSONFile = null;
        }
      } else {
        this.importPageSettingsJSONFile = null;
      }
    },

    /**
     * Export Page Settings Data
     */
    exportPageSettingsData() {
      // Current DateTime
      var dateObj = new Date();
      var date =
        dateObj.getDate() +
        "-" +
        dateObj.getMonth() +
        "-" +
        dateObj.getFullYear() +
        "-" +
        dateObj.getHours() +
        "-" +
        dateObj.getMinutes() +
        "-" +
        dateObj.getSeconds();
      // Export Data
      var exportData = {allActionSite: this.allActionSite, siteExcelColumns: this.siteExcelColumns}
      // Download
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData))
      var dlAnchorElem = document.getElementById("exportKeysDataHref");
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute(
        "download",
        "fill_extension_page_data-" + date + ".json"
      );
      dlAnchorElem.click();
    },

    /**
     * Add Script in the Column Data
     */
    openScriptModel(index) {
      if (this.siteExcelColumns[parseInt(this.selectActionSite)] !== undefined && this.siteExcelColumns[parseInt(this.selectActionSite)][index] !== undefined) {
        var colData = this.siteExcelColumns[parseInt(this.selectActionSite)][index];

        if (colData.jscript === undefined) {
          this.jsModelData.code = "";
        } else {
          this.jsModelData.code = colData.jscript;
        }

        if (colData.is_runJScript !== undefined)
          this.jsModelData.isRunScript = colData.is_runJScript;

        // Update Key
        this.jsModelData.key = index;
        setTimeout(() => {
          this.jsModelData.isOpen = true;
        }, 200);
      }
      return false;
    },

    /**
     * Update Script in the Column Data
     */
    updateScriptInColumn(index) {
      if (this.siteExcelColumns[parseInt(this.selectActionSite)] !== undefined && this.siteExcelColumns[parseInt(this.selectActionSite)][index] !== undefined) {
        var colData = this.siteExcelColumns[parseInt(this.selectActionSite)][index];

        colData["jscript"] = this.jsModelData.code;
        colData["is_runJScript"] = this.jsModelData.isRunScript;

        this.$buefy.toast.open({
          message: "JS Script Updated.",
          type: "is-success",
        });
      }
      return false;
    },

    /**
     * Change Action URL
     * --------------------------------
     * Change Full URL to pathname URL
     */
    changeActionURLType(val) {
      if (val) {
        if (val === "pathName" && this.url.site !== "") {
          try {
            var url = new URL(this.url.site);
            if (url.pathname) {
              this.url.site = url.pathname;
            }
          } catch (error) {
            console.error("changeActionURLType -> error", error);
          }
        } else if (val === "fullPath" && this.url.site !== "") {
          try {
            var url = new URL(this.url.site);
            if (!url.pathname) {
              this.url.site = "";
            }
          } catch (error) {
            this.url.site = "";
            console.error("changeActionURLType -> error", error);
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
        if (val === "pathName" && this.url.successPage !== "") {
          try {
            var url = new URL(this.url.successPage);
            if (url.pathname) {
              this.url.successPage = url.pathname;
            }
          } catch (error) {
            console.error("changeSuccessURLType -> error", error);
          }
        } else if (val === "fullPath" && this.url.successPage !== "") {
          try {
            var url = new URL(this.url.successPage);
            if (!url.pathname) {
              this.url.successPage = "";
            }
          } catch (error) {
            this.url.successPage = "";
            console.error("changeSuccessURLType -> error", error);
          }
        }
      }
    },

    /**
     * Save Site Information
     */
    saveSiteInformation() {
      if (!this.url.site || !this.url.siteType) {
        return false
      }

      // Site Data
      var siteInfo = {
        site: this.url.site, 
        siteType: this.url.siteType, 
        successMsg: this.url.successMsg, 
        successPage: this.url.successPage, 
        successTPageype: this.url.successTPageype,
      }

      if (this.url.index === false) {
        // Insert Site
        this.allActionSite.push(siteInfo)
        // Site Excel Columns
        this.siteExcelColumns.push({})

        this.$buefy.toast.open({
          message: `Site Information has been successfully Saved. `,
          type: "is-success",
          position: 'is-bottom',
        });

      } else {

        // Update Site
        if (this.allActionSite[parseInt(this.url.index)] !== undefined) {
          var siteData = this.allActionSite[parseInt(this.url.index)]

          // Update Data
          siteData.site = this.url.site, 
          siteData.siteType = this.url.siteType, 
          siteData.successMsg = this.url.successMsg, 
          siteData.successPage = this.url.successPage, 
          siteData.successTPageype = this.url.successTPageype,

          this.$buefy.toast.open({
            message: `Site Information has been successfully Updated. `,
            type: "is-success",
            position: 'is-bottom',
          });
        }

        this.url.index = false
      }

      // Close Model
      this.isOpenNewSiteModel = false
    },

    /**
     * Edit Site Information
     */
    editSiteInformation(index) {
      if (this.allActionSite[index] !== undefined) {
        var siteData = this.allActionSite[index]

        this.url.index = index // Array Index
        this.url.site = siteData.site
        this.url.siteType = siteData.siteType
        this.url.successPage = siteData.successPage
        this.url.successTPageype = siteData.successTPageype
        this.url.successMsg = siteData.successMsg

        // Open Site Model
        this.isOpenNewSiteModel = true
      }
      return false
    },

    /**
     * Delete Site Information
     */
    deleteSiteInformation(index) {
      this.$buefy.dialog.confirm({
        title: "Deleting Site",
        message:
          "Are you sure you want to <b>delete</b> site data? This action cannot be undone.",
        confirmText: "Delete",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => {
          if (this.allActionSite[index] !== undefined) {
            // First Reset Active Site Selected Index Key
            this.selectActionSite = 0
            this.$delete(this.allActionSite, index);
            // Site Excel Columns
            this.$delete(this.siteExcelColumns, index);
          }
        },
      });
    },

    /**
     * Open Model: Site Column Settings
     * @param {number} colName
     */
    openColumnSettingsModel(colName) {
      // Check Selected Action Site Index
      if (parseInt(this.selectActionSite) < 0) {
        return false
      }

      // Check Column Name exists in the selected action site data
      if (this.siteExcelColumns[parseInt(this.selectActionSite)][colName] !== undefined) {
        var colData = this.siteExcelColumns[parseInt(this.selectActionSite)][colName]

        // if Settings Data exist in the column data and update
        if (colData.settings !== undefined && Object.keys(colData.settings).length > 0) {
          this.colSettings.field_type = colData.settings.field_type
          this.colSettings.check_value_through = colData.settings.check_value_through
          this.colSettings.check_value_with_regexp = colData.settings.check_value_with_regexp
          this.colSettings.default_value = colData.settings.default_value
          // Action
          this.colSettings.action_name = colData.settings.action_name
          this.colSettings.action_value = colData.settings.action_value
          // Js Events
          this.colSettings.isRunEvent = colData.settings.isRunEvent
          this.colSettings.js_events = colData.settings.js_events
          // Date Format
          this.colSettings.dateOfExcel = colData.settings.dateOfExcel
          this.colSettings.dateOfSite = colData.settings.dateOfSite
          // After filling the data of this field, filling the data of another field.
          this.colSettings.isAfterFillFields = colData.settings.isAfterFillFields
          this.colSettings.afterFillFields = colData.settings.afterFillFields
        } else {
          // Rest Variables old Data
          this.colSettings.field_type = "text"
          this.colSettings.check_value_through = "name"
          this.colSettings.check_value_with_regexp = false
          this.colSettings.default_value = ""
          // Action
          this.colSettings.action_name = ""
          this.colSettings.action_value = ""
          // Js Events
          this.colSettings.isRunEvent = false
          this.colSettings.js_events = []
          // Date Format
          this.colSettings.dateOfExcel = "DD-MM-YYYY"
          this.colSettings.dateOfSite = "YYYY-mm-DD"
          // After filling the data of this field, filling the data of another field.
          this.colSettings.isAfterFillFields = false
          this.colSettings.afterFillFields = []
        }
        
        // Open Column Settings Model
        this.isOpenSiteColSettingsModel = true
        // Set Active Column Name
        this.activeSiteColName = colName
        // remove first 6 characters
        this.activeSiteColNameOrignal = colName.slice(6)
      }
      return false
    },

    /**
     * Save Site Column Settings: Model
     */
    saveColumnSettings() {
      if (!this.activeSiteColName) {
        return false
      }

      // Check Column Name exists in the selected action site data
      if (this.siteExcelColumns[parseInt(this.selectActionSite)][this.activeSiteColName] !== undefined) {
        var colData = this.siteExcelColumns[parseInt(this.selectActionSite)][this.activeSiteColName]
        // Settings Object
        if (!colData.settings) {
          return false
        }

        // Settings Data
        this.$set(colData.settings, 'field_type', this.colSettings.field_type)
        this.$set(colData.settings, 'check_value_through', this.colSettings.check_value_through)
        this.$set(colData.settings, 'check_value_with_regexp', this.colSettings.check_value_with_regexp)
        this.$set(colData.settings, 'default_value', this.colSettings.default_value)
        // Action
        this.$set(colData.settings, 'action_name', this.colSettings.action_name)
        this.$set(colData.settings, 'action_value', this.colSettings.action_value)
        // Js Events
        this.$set(colData.settings, 'isRunEvent', this.colSettings.isRunEvent)
        this.$set(colData.settings, 'js_events', this.colSettings.js_events)
        // If field type is date
        this.$set(colData.settings, 'dateOfExcel', this.colSettings.dateOfExcel)
        this.$set(colData.settings, 'dateOfSite', this.colSettings.dateOfSite)
        // After filling the data of this field, filling the data of another field
        this.$set(colData.settings, 'isAfterFillFields', this.colSettings.isAfterFillFields)
        this.$set(colData.settings, 'afterFillFields', this.colSettings.afterFillFields)

        this.$buefy.toast.open({
          message: `Column Settings has been successfully Saved. `,
          type: "is-success",
          position: 'is-bottom',
        });
        
        // Close Site Column Settings Model
        this.isOpenSiteColSettingsModel = false
        // Set Active Column Name
        this.activeSiteColName = null
      }
    },

    /**
     * Get/Filter Key Event Names
     */
    getFilteredEvents(text) {
      this.javascriptEventList = this.javascriptEventListFilter.filter((option) => {
        return option.toString().toLowerCase().indexOf(text.toLowerCase()) >= 0
      });
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
      var that = this;

      var excelData = JSON.parse(this.excelSheetData);
      if (typeof excelData !== "object" || excelData.length <= 0) {
        return false
      }

      this.$buefy.dialog.confirm({
        title: "Fetch Excel Data",
        message: "Are you sure you want to <b>fetch</b> new excel data? This will delete the old data.",
        confirmText: "Fetch",
        type: "is-info",
        hasIcon: true,
        onConfirm: () => {

          // Empty Old keys
          this.excelSheetJSONData.keys = [];
    
          excelData.forEach(function (item, index) {
            // Insert Settings Keys
            excelData[index]["status"] = false;
            excelData[index]["isLoading"] = false;
            excelData[index]["totalErrorRequest"] = 0;
    
            // Fetch Excel Data Keys
            if (index === 0) {
              if (Object.keys(item).length > 0) {
                // Maximum Four Column Push For Show Data in Table
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
    
          this.excelSheetJSONData.obj = excelData; // Excel JSON Data
          this.excelSheetJSONData.total = excelData.length; // Excel JSON Data Length
        }
      });
    },

    /**
     * ___________________ Check JSON Data is Valid _______________________
     */
    checkJSONDataValid: function () {
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
          json: json,
        })
        .jsonPresenter("expand", 0); // Expand all JSON properties so that none of them are collapsed
    },
    jsonDataExpanAll: function () {
      var jsonContainer = $("#json-container");
      jsonContainer.jsonPresenter("expandAll");
    },
    jsonDataCollapseAll: function () {
      var jsonContainer = $("#json-container");
      jsonContainer.jsonPresenter("collapseAll");
    },
    jsonDataExpanLevels: function () {
      var jsonContainer = $("#json-container");
      var levels = parseInt($("#levels").val());
      jsonContainer.jsonPresenter("expand", levels);
    },

    // Release Timeline
    applyReleaseTagClass(tag) {
      if (tag === "NEW") {
        return "is-dark"
      } else if (tag === "ADDED") {
        return "is-info"
      } else if (tag === "FIXED") {
        return "is-danger"
      } else if (tag === "IMPROVED") {
        return "is-warning"
      }
    },
    applyReleaseTagStyle(tag) {
      if (tag === "NEW") {
        return "padding: 0px 24px 0px;"
      } else if (tag === "ADDED") {
        return "padding: 0px 18px 0px;"
      } else if (tag === "FIXED") {
        return "padding: 0px 23px 0px;"
      }
    }
  },
  watch: {
    // Active Tab Index
    activeTabIndex: function (newValue) {
      this.setValueINExtensionStorage(newValue, "tabVal__activeTabIndex");
    },

    // Excel Sheet Data
    excelSheetData: {
      handler: function (newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__excelSheetData");
      },
      deep: true,
    },

    // All Ready Define Field Address in the Excel Sheet
    fieldAddressExcelData: {
      handler: function (newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__fieldAddressExcelData");
      },
      deep: true,
    },
    
    // Excel First Sheet Table Header (Sheet Columns)
    excelFirstSheetColumnData: {
      handler: function (newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__excelFirstSheetColumnData");
      },
      deep: true,
    },

    // Excel Sheet JSON Data
    excelSheetJSONData: {
      handler: function (newObject) {
        this.setValueINExtensionStorage(
          newObject,
          "objectVal__excelSheetJSONData"
        );
      },
      deep: true,
    },

    // Action All Site
    allActionSite: {
      handler: function (newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__allActionSite");
      },
      deep: true,
    },

    // Site Excel Columns
    siteExcelColumns: {
      handler: function (newObject) {
        this.setValueINExtensionStorage(newObject, "objectVal__siteExcelColumns");
      },
      deep: true,
    },

    // Excel Upload Settings
    excelFileSettings: {
      handler: function (newObject) {
        this.setValueINExtensionStorage(
          newObject,
          "objectVal__excelFileSettings"
        );
      },
      deep: true,
    },

    // Application Settings
    appSettings: {
      handler: function (newObject) {
        this.setValueINExtensionStorage(
          newObject,
          "objectVal__appSettings"
        );
      },
      deep: true,
    },
  },
  created() {
    var that = this;

    // Check Get Parameters in the URL `"?tab=1&update=0"`
    var newTabIndex = false
    if (!location.search === false) {
      try {
        // Check Tab Index
        if (location.search.split("tab=").length >= 2) {
          var tabIndex = location.search.split("tab=")[1].slice(0, 1)
          newTabIndex = parseInt(tabIndex);
        }
        // Check Update Model
        if (location.search.split("update=").length >= 2) {
          var valueModel = location.search.split("update=")[1].slice(0, 1)
          that.isModelNewVersion = (valueModel == 0)? false:true
        }
      } catch (error) {
        console.error(error);
      }
    }

    this.setDataINVariable("objectVal__excelSheetData", "excelSheetData");
    this.setDataINVariable("objectVal__fieldAddressExcelData", "fieldAddressExcelData");
    this.setDataINVariable("objectVal__excelFirstSheetColumnData", "excelFirstSheetColumnData");
    this.setDataINVariable(
      "objectVal__excelSheetJSONData",
      "excelSheetJSONData"
    );
    this.setDataINVariable("objectVal__siteExcelColumns", "siteExcelColumns");
    this.setDataINVariable("objectVal__excelFileSettings", "excelFileSettings");
    this.setDataINVariable("objectVal__allActionSite", "allActionSite");
    this.setDataINVariable("objectVal__appSettings", "appSettings");

    // Tab Index
    chrome.storage.local.get("tabVal__activeTabIndex", function (budget) {
      if (budget.tabVal__activeTabIndex != undefined)
        if (newTabIndex !== false) {
          that.activeTabIndex = newTabIndex
          } else {
          that.activeTabIndex = budget.tabVal__activeTabIndex;
        }
    });
  },
};
</script>

<style>
/* Responsive Break Points */
@media (max-width: 599px) {

  .timeline-item {
    font-size: 13px;
  }

  div > span.tag {
    font-size: 13px;
  }
}
</style>