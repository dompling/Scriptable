// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: book-open;
// Version 1.0.0

const mainAlert = new Alert();
const Files = FileManager.iCloud();
const RootPath = Files.documentsDirectory();

const saveFile = async ({ moduleName, url }) => {
  const header = `// Variables used by Scriptable.
  // These must be at the very top of the file. Do not edit.
  // icon-color: deep-gray; icon-glyph: file-code;\n`;
  const req = new Request(url);
  const content = await req.loadString();
  const fileHeader = content.includes("icon-color") ? `` : header;
  write(`${moduleName}`, `${fileHeader}${content}`);
};

const saveFileName = (fileName) => {
  const hasSuffix = fileName.lastIndexOf(".") + 1;
  return !hasSuffix ? `${fileName}.js` : fileName;
};

const write = (fileName, content) => {
  let file = saveFileName(fileName);
  const filePath = `${RootPath}/${file}`;
  Files.writeString(filePath, content);
  return true;
};

const notify = async (title, body, url, opts = {}) => {
  let n = new Notification();
  n = Object.assign(n, opts);
  n.title = title;
  n.body = body;
  if (url) n.openURL = url;
  return await n.schedule();
};

const renderTableList = async (data) => {
  try {
    const table = new UITable();
    // 如果是节点，则先远程获取
    const req = new Request(data.subscription);
    const subscription = await req.loadJSON();
    const apps = subscription.apps;
    apps.forEach((item) => {
      const r = new UITableRow();
      r.height = 75;
      const imgCell = UITableCell.imageAtURL(item.thumb);
      imgCell.centerAligned();
      r.addCell(imgCell);

      const nameCell = UITableCell.text(item.name);
      nameCell.centerAligned();
      r.addCell(nameCell);

      const downloadCell = UITableCell.button("下载");
      downloadCell.centerAligned();
      downloadCell.dismissOnTap = true;
      downloadCell.onTap = async () => {
        const res = await new Request(item.scriptURL).loadString();
        const isWrite = await write(item.name, res);
        if (isWrite) {
          notify("下载提示", `插件:${item.name}.js 下载/更新成功`);
        }
      };

      r.addCell(downloadCell);
      table.addRow(r);
      const descRow = new UITableRow();
      descRow.addText(item.description);
      table.addRow(descRow);
    });
    table.present(false);
  } catch (e) {
    console.log(e);
    notify("错误提示", "订阅获取失败");
  }
};

mainAlert.title = "组件下载";
mainAlert.message = "可以自行添加订阅地址";
try {
  const cacheKey = "subscriptionList";
  const render = async () => {
    let subscriptionList = [];
    if (Keychain.contains(cacheKey)) {
      subscriptionList = JSON.parse(Keychain.get(cacheKey));
    }
    const _actions = [];
    subscriptionList.forEach((item) => {
      const { author } = item;
      mainAlert.addAction("作者：" + author);
      _actions.push(async () => {
        await renderTableList(item);
      });
    });

    _actions.push(async () => {
      const a = new Alert();
      a.title = "订阅地址";
      a.addTextField(
        "URL",
        "https://raw.githubusercontent.com/dompling/Scriptable/master/install.json"
      );
      a.addAction("确定");
      a.addCancelAction("取消");
      const id = await a.presentAlert();
      if (id === -1) return;
      try {
        const url = a.textFieldValue(0);
        const response = await new Request(url).loadJSON();
        delete response.apps;
        const data = [];
        for (let _ in subscriptionList) {
          if (response.author === subscriptionList[i].author) {
            data.push({ ...response, subscription: url });
          } else {
            data.push(subscriptionList[i]);
          }
        }
        if (!subscriptionList.length)
          data.push({ ...response, subscription: url });
        Keychain.set(cacheKey, JSON.stringify(data));
        render();
      } catch (e) {
        console.log(e);
        notify("错误提示", "订阅地址错误，不是一个 JSON 格式");
      }
    });

    mainAlert.addAction("添加订阅");
    mainAlert.addCancelAction("取消操作");
    const _actionsIndex = await mainAlert.presentSheet();
    if (_actions[_actionsIndex]) {
      const func = _actions[_actionsIndex];
      await func();
    }
  };
  await render();
} catch (e) {
  console.log("缓存读取错误" + e);
}
