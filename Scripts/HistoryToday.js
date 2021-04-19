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
    if (!response || !response.length)
      console.log('接口数据异常，请稍后再试！');
    this.dataSource = response;
  };

  setListCell = async (cell, data) => {
    let { year, title, href, img } = data;
    let body = cell.addStack();
    body.url = href;

    const box = body.addStack();
    box.addSpacer();
    box.setPadding(10, 10, 10, 10);
    box.backgroundColor = new Color('#000', 0.1);
    box.cornerRadius = 20;
    box.layoutVertically();

    const boxTopStack = box.addStack();
    boxTopStack.addSpacer();
    const avatarStack = boxTopStack.addStack();
    avatarStack.size = new Size(50, 50);
    avatarStack.cornerRadius = 25;
    const image = await this.$request.get(img, 'IMG');
    const imageItem = avatarStack.addImage(image);
    imageItem.centerAlignImage();
    boxTopStack.addSpacer();

    box.addSpacer();
    const titleStack = box.addStack();
    titleStack.size = new Size(0, 30);
    const descText = titleStack.addText(title);
    descText.font = Font.boldSystemFont(8);
    descText.textColor = this.widgetColor;
    descText.lineLimit = 3;

    box.addSpacer(5);
    const yearStack = box.addStack();
    yearStack.addSpacer();
    const yearText = yearStack.addText(year);
    yearText.font = Font.boldSystemFont(10);
    yearText.textColor = this.widgetColor;
    yearStack.addSpacer();

    return cell;
  };

  group(array, subNum) {
    let index = 0;
    let newArray = [];
    while (index < array.length) {
      newArray.push(array.slice(index, (index += subNum)));
    }
    return newArray;
  }

  setWidget = async (body, size) => {
    const container = body.addStack();
    container.setPadding(10, 10, 10, 10);
    const data = this.getRandomArrayElements(this.dataSource, size);
    if (size === 6) {
      const source = this.group(data, 3);
      container.layoutVertically();
      for (const item of source) {
        const boxStack = container.addStack();
        container.addSpacer();
        for (let index = 0; index < item.length; index++) {
          const data = item[index];
          let listItem = boxStack.addStack();
          await this.setListCell(listItem, data);
          if (index !== item.length - 1) boxStack.addSpacer();
        }
      }
    } else {
      const dataSource = data;
      for (let index = 0; index < dataSource.length; index++) {
        const data = dataSource[index];
        let listItem = container.addStack();
        await this.setListCell(listItem, data);
        if (index !== dataSource.length - 1) container.addSpacer();
      }
    }
    return body;
  };

  renderSmall = async (w) => {
    return await this.setWidget(w, 1);
  };

  renderLarge = async (w) => {
    return await this.setWidget(w, 6);
  };

  renderMedium = async (w) => {
    return await this.setWidget(w, 3);
  };

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    widget.setPadding(0, 0, 0, 0);
    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === 'medium') {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, '', false); //远程开发环境
