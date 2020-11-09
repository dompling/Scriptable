// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: comment-dollar;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "bilibili今日番剧";
    this.en = "BiliBiliMonitor";
    this.logo =
      "https://raw.githubusercontent.com/Orz-3/task/master/bilibili.png";
    config.runsInApp &&
      this.registerAction("设置背景图", this.setWidgetBackground);
  }

  today = "";
  dataSource = [];

  init = async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      this.today = `${month}-${day}`;
      this.dataSource = await this.getDramaList();
    } catch (e) {
      console.log(e);
    }
  };

  getDramaList = async () => {
    const url = `https://bangumi.bilibili.com/web_api/timeline_global`;
    const response = await this.$request.get(url);
    try {
      if (response.code === 0 && response.result.length > 0) {
        const dataSource = response.result;
        const result = dataSource.find((item) => item.date === this.today);
        if (result) return result.seasons;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  setListCell = async (cell, data) => {
    const { cover, url, title, pub_time, pub_index } = data;
    let body = cell.addStack();
    body.url = url;
    if (this.widgetFamily !== "small") {
      const imageView = body.addStack();
      imageView.size = new Size(75, 75);
      imageView.cornerRadius = 5;
      const image = await this.$request.get(cover, "IMG");
      imageView.backgroundImage = image;
      body.addSpacer(10);
    }

    const textView = body.addStack();
    textView.layoutVertically();

    const descText = textView.addText(title);
    descText.font = Font.boldSystemFont(16);
    descText.textColor = this.widgetColor;
    descText.lineLimit = 1;

    const subContent = textView.addText(pub_index);
    subContent.font = Font.boldSystemFont(14);
    subContent.textColor = this.widgetColor;
    subContent.lineLimit = 1;

    textView.addSpacer(5);

    const timerText = textView.addText(`更新时间：${pub_time}`);
    timerText.font = Font.lightSystemFont(14);
    timerText.textColor = this.widgetColor;
    timerText.lineLimit = 1;

    return cell;
  };

  setWidget = async (body) => {
    const container = body.addStack();
    container.layoutVertically();
    let orderIndex = 0;
    for (let index = 0; index < this.dataSource.length; index++) {
      if (this.widgetFamily !== "large" && index === 1) {
        return body;
      }
      if (index === 3) {
        return body;
      }
      orderIndex = index;
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
      this.renderJDHeader(header);
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
    const textItem = headerMore.addText(this.today);
    textItem.font = Font.boldSystemFont(12);
    textItem.textColor = this.widgetColor;
    textItem.lineLimit = 1;
    textItem.rightAlignText();
    return header;
  };
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, "", false); //远程开发环境
