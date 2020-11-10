// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: chalkboard;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "哔哩哔哩关注";
    this.en = "BiliBiliWatch";
    this.logo =
      "https://raw.githubusercontent.com/Orz-3/task/master/bilibili.png";
    this.Run(module.filename);
    this.cacheName = this.md5(`dataSouce_${this.en}`);
  }

  cookie = "";
  dataSource = [];

  init = async () => {
    try {
      await this.getDramaList();
    } catch (e) {
      console.log(e);
    }
  };

  getDramaList = async () => {
    const url = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?type_list=268435455`;
    const method = `GET`;
    const headers = {
      Cookie: this.cookie,
      "User-Agent": `bili-universal/10320 CFNetwork/1206 Darwin/20.1.0 os/ios model/iPhone XR mobi_app/iphone build/10320 osVer/14.2 network/2 channel/AppStore`,
    };
    const response = await this.$request.get(url, {
      method,
      headers,
    });
    try {
      const { code, data } = response;
      if (code === 0 && data.cards.length > 0) {
        let dataSource = data.cards;
        dataSource = dataSource.splice(10);
        this.dataSource = dataSource.map((item) => {
          return { card: JSON.parse(item.card), desc: item.desc };
        });
        return this.dataSource;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  setListCell = async (cell, data) => {
    const {
      card: { cover, new_desc, play_count, reply_count, url, apiSeasonInfo },
      desc,
    } = data;
    let body = cell.addStack();
    body.url = url;
    if (this.widgetFamily !== "small") {
      const imageView = body.addStack();
      imageView.size = new Size(43, 43);
      imageView.cornerRadius = 5;
      const image = await this.$request.get(cover, "IMG");
      imageView.backgroundImage = image;
      body.addSpacer(10);
    }

    const textView = body.addStack();
    textView.layoutVertically();

    const descText = textView.addText(`[${apiSeasonInfo.title}] ${new_desc}`);
    descText.font = Font.boldSystemFont(14);
    descText.textColor = this.widgetColor;
    descText.lineLimit = 1;

    textView.addSpacer(3);

    const date = new Date();
    date.setTime(desc.timestamp * 1000); //注意，这行是关键代码
    let month = date.getMonth() + 1;
    let day = date.getDate();

    const timerText1 = textView.addText(`${month}-${day} 更新了`);
    timerText1.font = Font.lightSystemFont(10);
    timerText1.textColor = this.widgetColor;
    timerText1.lineLimit = 1;

    const descView = textView.addStack();

    const icon1 = descView.addImage(
      await this.$request.get(
        "https://pic.90sjimg.com/design/00/21/84/57/58fd7ec075811.png",
        "IMG"
      )
    );
    icon1.cornerRadius = 5;
    icon1.imageSize = new Size(14, 14);
    descView.addSpacer(3);
    const timerText = descView.addText(`${play_count}`);
    timerText.font = Font.lightSystemFont(10);
    timerText.textColor = this.widgetColor;
    descView.addSpacer(5);
    const icon2 = descView.addImage(
      await this.$request.get(
        "https://pic.90sjimg.com/design/00/21/84/57/58fd7ec075811.png",
        "IMG"
      )
    );
    icon2.cornerRadius = 5;
    icon2.imageSize = new Size(14, 14);
    descView.addSpacer(3);
    const timerText2 = descView.addText(`${reply_count}`);
    timerText2.font = Font.lightSystemFont(10);
    timerText2.textColor = this.widgetColor;
    return cell;
  };

  setWidget = async (body) => {
    const container = body.addStack();
    container.layoutVertically();
    for (let index = 0; index < this.dataSource.length; index++) {
      if (this.widgetFamily !== "large" && index === 2) {
        return body;
      }
      if (index === 5) {
        return body;
      }
      const data = this.dataSource[index];
      let listItem = container.addStack();
      await this.setListCell(listItem, data);
      container.addSpacer(10);
    }
    body.addSpacer();
    return body;
  };

  renderSmall = async (w) => {
    return await this.setWidget(w);
  };

  renderLarge = async (w) => {
    return await this.setWidget(w);
  };

  renderMedium = async (w) => {
    return await this.setWidget(w);
  };
  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    await this.getWidgetBackgroundImage(widget);
    const header = widget.addStack();
    if (this.widgetFamily !== "small") {
      await this.renderJDHeader(header);
    } else {
      await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    }
    widget.addSpacer(10);
    if (this.widgetFamily === "medium") {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === "large") {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }

  renderJDHeader = async (header) => {
    header.centerAlignContent();
    await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    header.addSpacer(140);
    const headerMore = header.addStack();
    headerMore.url = "";
    headerMore.setPadding(1, 10, 1, 10);
    headerMore.cornerRadius = 10;
    headerMore.backgroundColor = new Color("#fff", 0.5);
    const textItem = headerMore.addText("个人中心");
    textItem.font = Font.boldSystemFont(12);
    textItem.textColor = this.widgetColor;
    textItem.lineLimit = 1;
    textItem.rightAlignText();
    return header;
  };

  Run = (filename) => {
    if (config.runsInApp) {
      this.registerAction("设置背景图", this.setWidgetBackground);
      this.registerAction("设置 Cookie", this.inputCk);
      this.registerAction("设置 BoxJS Cookie", this._loadCk);
    }
    let _md5 = this.md5(filename + this.en);
    this.CACHE_KEY = `cache_${_md5}`;
    try {
      this.cookie = this.settings[this.en];
      if (!this.cookie) {
        throw "CK 获取失败";
      }
      return true;
    } catch (e) {
      this.notify("错误提示", e);
      return false;
    }
  };

  _loadCk = async () => {
    try {
      const cookie = await this.getCache("@bilibili.cookie");
      if (cookie) {
        this.cookie = cookie;
        this.settings[this.en] = this.cookie;
        this.saveSettings();
      }
      return true;
    } catch (e) {
      console.log(e);
      this.cookie = "";
      this.notify(
        this.name,
        "BoxJS Cookie 设置失败,点击根据配置获取",
        "https://raw.githubusercontent.com/dompling/Script/master/BiliBili/bilibili.cookie.js"
      );
      return false;
    }
  };

  async inputCk() {
    const a = new Alert();
    a.title = "哔哩哔哩 CK";
    a.message = "手动输入 Ck";
    a.addTextField("Cookie", this.cookie);
    a.addAction("确定");
    a.addCancelAction("取消");
    const id = await a.presentAlert();
    if (id === -1) return;
    this.cookie = a.textFieldValue(0);
    // 保存到本地
    this.settings[this.en] = this.cookie;
    this.saveSettings();
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, "", false); //远程开发环境
