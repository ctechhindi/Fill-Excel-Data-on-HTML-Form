# Fill Excel Sheet Data into HTML Form

Fill data in HTML form with Excel sheet from Chrome Extension.

![](src/icons/icon_192.png)

## ✨ Features

* Fill Automatic Excel Sheet Data in the HTML Form
* Send Request for Insert Entry
* and more..

## 📦 [Install Extension](https://chrome.google.com/webstore/detail/fill-excel-data/hbdlidnbnmkmbeompcakgedghogdbbkf)

## 🎬 Video Tutorial


## Screenshot

![](screenshot/Screenshot(139).png)

![](screenshot/Screenshot(140).png)

![](screenshot/Screenshot(141).png)

![](screenshot/Screenshot(142).png)

![](screenshot/Screenshot(143).png)

![](screenshot/Screenshot(144).png)


## 🚀 Debugging

Only for computer insect.

```bash
npm run build:dev
npm run watch
npm run watch:dev
npm run build-zip
```

## Tips Before Build

- Comment all log messages
- Delete Temp Folder

```
<!-- Delete dist folder then run this commands -->
npm run watch
npm run build-zip
```

## Using Libraries

* [vue-codemirror](https://github.com/surmon-china/vue-codemirror)
* [SelectorGenerator](https://github.com/flamencist/SelectorGenerator)

## Keys Custom JS Script [Option Page]

Global Variable in the Key's Custom JS Script.

```js
// Current Active JSON Data
console.log(FillAPP.cData);

// Current Active Key Name
console.log(FillAPP.cKeyName);

// Fetch Current Active Key Details
console.log(FillAPP.htmlKeys[FillAPP.cKeyName]);
```

## Keys Custom JS Script [Request Page]

```js
var currentFillData = this.data;
```

## Extension Page

```
chrome-extension://celcfdcmlebphlhcadpiepjliabdobhj/options/options.html
chrome-extension://celcfdcmlebphlhcadpiepjliabdobhj/request/request.html
```

## Custom Class

1. `CreateRequest.js`

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

## Predefined Custom Keys

* `form_filled` : After the form is successful feeded, you can give what script you want to run.
* `form_submit` : After the form is successful submit, you can give what script you want to run.
* `status`
* `isLoading`
* `totalErrorRequest`

## 🚫 Errors

* https://stackoverflow.com/questions/21177387/caution-provisional-headers-are-shown-in-chrome-debugger

## Browser Support

- `Chrome (Latest)`

## Changelog

### `Processing`

* Create Popup Page

### V.0.0.5

* Fixed Success URL not Match.
* Add new key `form_filled` = After the form is successful feeded, you can give what script you want to run.

### V.0.0.4

* Fix Spelling Mistake
* Fix copy element selector 
* Using new library

### V.0.0.3

* Fix Bug: auto save entry

### V.0.0.2

* After the form is successful submit, you can give what script you want to run in this custom key `form_submit`.
* Run those `keys` which are not in the excel sheet
* Fix Spelling Mistake
* Add Action URL Type `{fullPath, pathName}`
* Update Auto Catch Element Identity
* Add Demo Site and Excel Sheet Data
* https://phppot.com/demo/php-user-registration-form/

### V.0.0.1 `(Beta)`

* Form Data Request Sent on Server
* Fill Automatic HTML Form
* Use Custom JS Script in HTML Field's

## Reporting Issues radioactive

If you have a problem with this plugin or found any bug, please open an issue on GitHub.

## 📝 Copyright and License copyright

Code copyright 2020 ctechhindi. Code released under the MIT license.