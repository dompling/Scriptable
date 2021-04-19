// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: calendar-minus;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '历史上的今天';
    this.en = 'historyToday';
    this.logo =
      'https://raw.githubusercontent.com/Orz-3/mini/master/Color/historyToday.png';
    config.runsInApp && this.registerAction('基础设置', this.setWidgetConfig);
    this.cacheName = this.md5(`dataSouce_${this.en}`);
  }

  useBoxJS = false;
  today = '';
  dataSource = [];

  init = async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      this.today = `${month}.${day}`;
      await this.getHistoryList();
    } catch (e) {
      console.log(e);
    }
  };

  getHistoryList = async () => {
    const url = `http://api.sodion.net/api_v1/grap/todayinhistory`;
    const response = await this.$request.get(url);
    this.dataSource = response;
  };

  setListCell = async (cell, data) => {
    let { year, title, href, img } = data;
    let body = cell.addStack();
    body.url = href;

    const textView = body.addStack();
    textView.layoutVertically();

    const descText = textView.addText(title);
    descText.font = Font.boldSystemFont(14);
    descText.textColor = this.widgetColor;
    descText.lineLimit = 1;

    textView.addSpacer();
    const subContent = textView.addText(year);
    subContent.font = Font.lightSystemFont(10);
    subContent.textColor = this.widgetColor;
    subContent.lineLimit = 1;

    if (this.widgetFamily !== 'small') {
      body.addSpacer();
      const imageView = body.addStack();
      imageView.centerAlignContent();
      imageView.size = new Size(43, 43);
      imageView.cornerRadius = 5;
      imageView.borderWidth = 1;
      imageView.borderColor = this.widgetColor;
      const image = await this.$request.get(img, 'IMG');
      const imageItem = imageView.addImage(image);
      imageItem.centerAlignImage();
      body.addSpacer(10);
    }
    return cell;
  };

  setWidget = async (body, size) => {
    const container = body.addStack();
    container.layoutVertically();
    const dataSource = this.getRandomArrayElements(this.dataSource, size);
    for (let index = 0; index < dataSource.length; index++) {
      const data = dataSource[index];
      let listItem = container.addStack();
      await this.setListCell(listItem, data);
      container.addSpacer(10);
    }
    body.addSpacer();
    return body;
  };

  renderSmall = async (w) => {
    return await this.setWidget(w, 2);
  };

  renderLarge = async (w) => {
    return await this.setWidget(w, 5);
  };

  renderMedium = async (w) => {
    return await this.setWidget(w, 2);
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
    if (this.widgetFamily !== 'small') {
      await this.renderNotSmallHeader(header);
    } else {
      await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    }
    widget.addSpacer(10);
    if (this.widgetFamily === 'medium') {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }

  renderNotSmallHeader = async (header) => {
    header.centerAlignContent();
    await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    header.addSpacer();
    const headerMore = header.addStack();
    let [month, day] = this.today.split('.');
    month = month >= 10 ? month : `0${month}`;
    day = day >= 10 ? day : `0${day}`;
    headerMore.url = `https://m.8684.cn/today_d${month}${day}`;
    headerMore.setPadding(1, 10, 1, 10);
    headerMore.cornerRadius = 10;
    headerMore.backgroundColor = new Color('#fff', 0.5);
    const textItem = headerMore.addText(`更多`);
    textItem.font = Font.boldSystemFont(12);
    textItem.textColor = this.widgetColor;
    textItem.lineLimit = 1;
    textItem.rightAlignText();
    return header;
  };
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, '', false); //远程开发环境
