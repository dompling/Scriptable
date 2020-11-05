// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: book-open;
// Version 1.0.0
const defaultBaseURL = "https://widget-hub.app";
const catalogURL = "/api/list";
const catalogPageURL = "/catalog";
const webView = new WebView();
let localVersions = [];

// Setup Filemanager and paths
const fmCloud = FileManager.iCloud();

async function loadScript(url) {
  const req = new Request(url);
  const content = await req.loadString();
  const filename = url.split("/").pop();

  return {
    content,
    filename,
  };
}

const downloadWidget = async function (widget) {
  const downloadAlert = new Alert();
  downloadAlert.message = `Do you like to Download the  '${widget.name}' Widget-Script?`;
  downloadAlert.addAction("Yes");
  downloadAlert.addCancelAction("No");

  if ((await downloadAlert.presentAlert()) === 0) {
    const { content, filename } = await loadScript(widget.scriptURL);

    const scriptPath = fmCloud.joinPath(fmCloud.documentsDirectory(), filename);
    const scriptExists = fmCloud.fileExists(scriptPath);

    if (scriptExists) {
      const alreadyExistsAlert = new Alert();
      alreadyExistsAlert.message = `The Script '${filename}' already exists!`;
      alreadyExistsAlert.addAction("Replace");
      alreadyExistsAlert.addCancelAction("Cancel");

      if ((await alreadyExistsAlert.presentAlert()) === -1) {
        return false;
      }
    }
    fmCloud.writeString(scriptPath, content);

    const successAlert = new Alert();
    if (widget.configurationRequired === true) {
      successAlert.message = `Widget-Script '${filename}' saved. The widget requires manual configuration. Do you want to open the homepage of the widget for further instructions?`;
      successAlert.addAction("Yes, show Widget Homepage");
      successAlert.addCancelAction("No");
    } else {
      successAlert.message = `Widget-Script '${filename}' saved and ready to use!`;
      successAlert.addCancelAction("Close");
    }
    if ((await successAlert.presentAlert()) === 0) {
      Safari.openInApp(widget.homepage);
    }
    return filename;
  }
};

const updateWidget = async function (widget) {
  const downloadAlert = new Alert();
  downloadAlert.message = `Do you like to Update the  '${widget.name}' Widget-Script?`;
  downloadAlert.addAction("Yes");
  downloadAlert.addCancelAction("No");

  if ((await downloadAlert.presentAlert()) === 0) {
    const { content, filename } = await loadScript(widget.scriptURL);

    const scriptPath = fmCloud.joinPath(fmCloud.documentsDirectory(), filename);
    fmCloud.writeString(scriptPath, content);

    await injectLocalVersions();

    const successAlert = new Alert();
    if (widget.configurationRequired === true) {
      successAlert.message = `Widget-Script '${filename}' updated. The widget requires manual configuration. Do you want to open the homepage of the widget for further instructions?`;
      successAlert.addAction("Yes, show Widget Homepage");
      successAlert.addCancelAction("No");
    } else {
      successAlert.message = `Widget-Script '${filename}' updated and ready to use!`;
      successAlert.addCancelAction("Close");
    }
    if ((await successAlert.presentAlert()) === 0) {
      Safari.openInApp(widget.homepage);
    }
    return filename;
  }
};

async function fetchCatalog(url) {
  const req = new Request(url);
  return await req.loadJSON();
}

async function injectLocalVersions() {
  const js =
    `window.localWidgets = JSON.parse('` +
    JSON.stringify(localVersions) +
    `'); window.dispatchEvent(new CustomEvent('local-widget-versions-added'));`;
  return webView.evaluateJavaScript(js);
}

async function injectEventhandler() {
  const js = `
    window.addEventListener('catalog-event', (event) => {  
      completion(event.detail)
    }, false);
  `;
  return webView.evaluateJavaScript(js, true).then(async (event) => {
    if (event.name === "downloadButtonClicked") {
      await downloadWidget(event.widget);
    } else if (event.name === "updateButtonClicked") {
      await updateWidget(event.widget);
    } else if (event.name === "linkClicked") {
      Safari.openInApp(event.url);
    }
    return injectEventhandler();
  });
}

present = async (b) => {
  const baseUrl = !b ? defaultBaseURL : b;
  const catalog = await fetchCatalog(baseUrl + catalogURL);

  // Check Version of local Script
  localVersions = catalog.map((w) => {
    const versions = {
      localVersion: "",
      name: w.name,
    };
    const filename = w.scriptURL.split("/").pop();
    const scriptPath = fmCloud.joinPath(fmCloud.documentsDirectory(), filename);
    const scriptExists = fmCloud.fileExists(scriptPath);

    if (scriptExists) {
      const scriptContent = fmCloud.readString(scriptPath);
      const m = scriptContent.match(/Version[\s]*([\d]+(\.[\d]+){0,2})/m);
      if (m && m[1]) {
        versions.localVersion = m[1];
      }
    }

    return versions;
  });
  const querParams = Device.isUsingDarkAppearance() ? "?darkMode" : "";
  await webView.loadURL(baseUrl + catalogPageURL + querParams);
  await injectLocalVersions();
  injectEventhandler();
  return webView.present();
};

present();
