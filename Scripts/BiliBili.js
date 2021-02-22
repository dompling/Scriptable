// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: tv;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '哔哩哔哩今日番剧';
    this.en = 'BiliBiliMonitor';
    this.logo =
      'https://raw.githubusercontent.com/Orz-3/mini/master/Color/bilibili.png';
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
      this.today = `${month}-${day}`;
      if (Keychain.contains(this.cacheName)) {
        const dataSource = JSON.parse(Keychain.get(this.cacheName));
        if (dataSource[this.today]) {
          this.dataSource = dataSource[this.today].seasons;
        } else {
          this.dataSource = await this.getDramaList();
        }
      } else {
        this.dataSource = await this.getDramaList();
      }
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
        if (result) {
          Keychain.set(
            this.cacheName,
            JSON.stringify({ [this.today]: result }),
          );
          return result.seasons;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  setListCell = async (body, data) => {
    let {
      cover,
      url,
      title,
      pub_time,
      pub_index,
      delay,
      delay_reason,
      delay_index,
    } = data;
    body.url = url;
    const imageView = body.addStack();
    imageView.size = new Size(89, 105);
    imageView.cornerRadius = 5;
    const image = await this.$request.get(cover, 'IMG');
    imageView.backgroundImage = image;
    imageView.borderWidth = 1;
    imageView.borderColor = new Color(this.widgetColor.hex, 0.7);
    const stackDesc = imageView.addStack();

    stackDesc.layoutVertically();
    const stackDescTop = stackDesc.addStack();
    stackDescTop.setPadding(5, 0, 0, 0);
    const textColor = new Color('#fff');
    if (delay) pub_index = `${delay_index}「${delay_reason}」`;
    stackDescTop.addSpacer();
    const stackTopText = stackDescTop.addStack();
    stackTopText.setPadding(0, 2, 0, 2);
    stackTopText.backgroundColor = new Color('#000', 0.3);
    stackTopText.cornerRadius = 4;
    const subContent = stackTopText.addText(pub_index);
    subContent.font = Font.boldSystemFont(10);
    subContent.textColor = textColor;
    subContent.lineLimit = 1;

    stackDesc.addSpacer();
    const stackDescBottom = stackDesc.addStack();
    stackDescBottom.addSpacer();
    stackDescBottom.backgroundColor = new Color('#000', 0.3);

    const textView = stackDescBottom.addStack();
    textView.setPadding(0, 10, 0, 10);
    textView.size = new Size(89, 30);
    textView.layoutVertically();
    const descText = textView.addText(title);
    descText.font = Font.boldSystemFont(10);
    descText.textColor = textColor;
    descText.lineLimit = 1;

    const timerText = textView.addText(`更新：${pub_time}`);
    timerText.font = Font.lightSystemFont(10);
    timerText.textColor = textColor;
    timerText.lineLimit = 1;
    stackDescBottom.addSpacer();

    return body;
  };

  fillRect(drawing, rect, color) {
    const path = new Path();
    path.addRoundedRect(rect, 0, 0);
    drawing.addPath(path);
    drawing.setFillColor(new Color(color, 1));
    drawing.fillPath();
  }

  drawLine(drawing, rect, color, scale) {
    const x1 = Math.round(rect.x + scale * 1.5);
    const y1 = rect.y - scale;
    const x2 = Math.round(rect.width + scale * 1.5);
    const point1 = new Point(x1, y1);
    const point2 = new Point(x2, y1);
    const path = new Path();
    path.move(point1);
    path.addLine(point2);
    drawing.addPath(path);
    drawing.setStrokeColor(new Color(color, 1));
    drawing.setLineWidth(60 / (40 + 15 * scale));
    drawing.strokePath();
  }

  setLine = (stack, color) => {
    try {
      const topDrawing = new DrawContext();
      topDrawing.size = new Size(642, 100);
      topDrawing.opaque = false;
      topDrawing.respectScreenScale = true;

      const rectLine = new Rect(0, 70, 610, 26);
      this.fillRect(topDrawing, rectLine, color);
      for (let i = 0; i < 40; i++) {
        this.drawLine(topDrawing, rectLine, color, i);
      }

      const stackLine = stack.addStack();
      stack.backgroundImage = topDrawing.getImage();
      stackLine.addSpacer();
      const line = stackLine.addStack();
      line.size = new Size(1, 10);
      stackLine.addSpacer();
    } catch (e) {
      console.log(e);
    }
  };

  setWidget = async (body, data) => {
    const d = body.addStack();
    d.addSpacer();
    const container = d.addStack();
    container.layoutVertically();
    const dataSource = data.length > 3 ? [data.splice(0, 3), data] : [data];
    let itemIndex = 0;
    for (const item of dataSource) {
      let listItem = container.addStack();
      let index = 0;
      for (const video of item) {
        const stackItem = listItem.addStack();
        await this.setListCell(stackItem, video);
        index++;
        if (item.length !== index) listItem.addSpacer(13);
      }
      itemIndex++;
      if (dataSource.length !== itemIndex) container.addSpacer(13);
    }
    if (this.widgetFamily === 'large') {
      container.addSpacer();
      this.setLine(container, '#e8e8e8');
      const timerColor = new Color(this.widgetColor.hex, 0.7);
      const fontSize = 10;
      container.addSpacer();
      const stackFooter = container.addStack();
      stackFooter.addSpacer();
      const now = new Date();
      const stackDate = stackFooter.addDate(
        new Date(`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`),
      );
      stackDate.textColor = timerColor;
      stackDate.fontSize = fontSize;
      stackDate.rightAlignText();
      stackDate.applyTimerStyle();
    }
    d.addSpacer();
    return body;
  };

  renderSmall = async (w) => {
    const stack = w.addStack();
    stack.addText('暂不支持');
    return w;
  };

  renderLarge = async (w) => {
    const dataSource = this.getRandomArrayElements(this.dataSource, 6);
    return await this.setWidget(w, dataSource);
  };

  renderMedium = async (w) => {
    const dataSource = this.getRandomArrayElements(this.dataSource, 3);
    return await this.setWidget(w, dataSource);
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
      await this.renderJDHeader(header);
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

  renderJDHeader = async (header) => {
    header.centerAlignContent();
    await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    header.addSpacer();
    const headerMore = header.addStack();
    headerMore.url = '';
    headerMore.setPadding(1, 10, 1, 10);
    headerMore.cornerRadius = 10;
    headerMore.backgroundColor = new Color('#fff', 0.5);
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
await Runing(Widget, '', false); //远程开发环境
