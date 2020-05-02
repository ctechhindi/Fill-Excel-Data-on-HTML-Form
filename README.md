# Fill Excel Sheet Data into HTML Form

Fill data in HTML form with Excel sheet from Chrome Extension.

## Installation

```bash
npm run build:dev
npm run watch
npm run watch:dev
npm run build-zip
```

## Before Build

- Comment all log messages
- Delete Temp Folder

```
<!-- Delete dist folder then run this commands -->
npm run watch
npm run build-zip
```

## Library

* https://github.com/surmon-china/vue-codemirror

## Errors

* https://stackoverflow.com/questions/21177387/caution-provisional-headers-are-shown-in-chrome-debugger

## Keys Custom JS Script [Option Page]

Global Variable in the Key's Custom JS Script.

```js
var currentFillData = FillAPP.cData;
```

## Keys Custom JS Script [Request Page]

```js
var currentFillData = this.data;
```

## Links

```
chrome-extension://celcfdcmlebphlhcadpiepjliabdobhj/options/options.html
chrome-extension://celcfdcmlebphlhcadpiepjliabdobhj/request/request.html
```

## Custom Class

1. CreateRequest.js

```js
try {

    var req = new CreateRequest({
      "url": String,
      "field": {
        G_bene_gender: {
          defaultValue: ""
          field: "G_bene_gender"
          isFieldRequired: true
          is_runJScript: false
          jscript: ""
          key: "guar_gender"
        },
        ...
      },
      "data": {
        ben_dob: "2015-07-12"
        ben_gender: "Male"
        status: (...),
        ...
      },
      "successMsg": String,
      "successStatusCode": Number,
    });

    // Sent Request
    req.sentRequest()

} catch (e) {
    console.error(e)
}
```