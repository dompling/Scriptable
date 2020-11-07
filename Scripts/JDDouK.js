// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "京东豆走势";
    this.en = "JDDouK";
    this.JDRun(module.filename, args);
  }

  drawContext = new DrawContext();

  rangeTimer = {};
  timerKeys = [];
  rangeDay = 6;

  widgetHeight = 338;
  widgetWidth = 720;
  lineWeight = 2;
  vertLineWeight = 0.5;
  graphLow = 280;
  graphHeight = 160;
  spaceBetweenDays = 100;
  widgetColor = Color.dynamic(Color.black(), Color.white());

  accentColor1 = new Color("#33cc33", 1);
  accentColor2 = Color.lightGray();

  imageBackground = true;
  forceImageUpdate = false;

  drawTextR(text, rect, color, font) {
    this.drawContext.setFont(font);
    this.drawContext.setTextColor(color);
    this.drawContext.drawTextInRect(new String(text).toString(), rect);
  }

  drawLine(point1, point2, width, color) {
    const path = new Path();
    path.move(point1);
    path.addLine(point2);
    this.drawContext.addPath(path);
    this.drawContext.setStrokeColor(color);
    this.drawContext.setLineWidth(width);
    this.drawContext.strokePath();
  }

  init = async () => {
    try {
      this.rangeTimer = this.getDay(this.rangeDay);
      this.timerKeys = Object.keys(this.rangeTimer);
      await this.getAmountData();
    } catch (e) {
      console.log(e);
    }
  };

  getAmountData = async () => {
    let i = 0,
      page = 1;
    do {
      const response = await this.getJingBeanBalanceDetail(page);
      if (response && response.code === "0") {
        page++;
        let detailList = response.jingDetailList;
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const dates = item.date.split(" ");
            if (this.timerKeys.indexOf(dates[0]) > -1) {
              const amount = Number(item.amount);
              this.rangeTimer[dates[0]] += amount;
            } else {
              i = 1;
              break;
            }
          }
        } else {
          console.log(`账号：数据异常`);
          i = 1;
        }
      } else {
        console.log(`异常 第${page}页:${JSON.stringify(response)}`);
        i = 1;
        break;
      }
    } while (i === 0);
  };

  getDay(dayNumber) {
    let data = {};
    let i = dayNumber;
    do {
      const today = new Date();
      const year = today.getFullYear();
      const targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * i;
      today.setTime(targetday_milliseconds); //注意，这行是关键代码
      let month = today.getMonth() + 1;
      month = month >= 10 ? month : `0${month}`;
      let day = today.getDate();
      day = day >= 10 ? day : `0${day}`;
      data[`${year}-${month}-${day}`] = 0;
      i--;
    } while (i >= 0);
    return data;
  }

  getJingBeanBalanceDetail = async (page) => {
    try {
      const options = {
        url: `https://bean.m.jd.com/beanDetail/detail.json`,
        body: `page=${page}`,
        headers: {
          "X-Requested-With": `XMLHttpRequest`,
          Connection: `keep-alive`,
          "Accept-Encoding": `gzip, deflate, br`,
          "Content-Type": `application/x-www-form-urlencoded; charset=UTF-8`,
          Origin: `https://bean.m.jd.com`,
          "User-Agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15`,
          Cookie: this.JDCookie.cookie,
          Host: `bean.m.jd.com`,
          Referer: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`,
          "Accept-Language": `zh-cn`,
          Accept: `application/json, text/javascript, */*; q=0.01`,
        },
      };

      return await this.$request.post(options.url, options);
    } catch (e) {
      console.log(e);
    }
  };

  drawImage = () => {
    this.drawContext.size = new Size(this.widgetWidth, this.widgetHeight);
    this.drawContext.opaque = false;
    this.drawContext.setFont(Font.mediumSystemFont(26));
    this.drawContext.setTextColor(this.widgetColor);
    this.drawContext.setTextAlignedCenter();
    this.drawContext.drawText(`🐶京东走势图`, new Point(25, 25));
    this.drawContext.drawText(
      `${this.JDCookie.userName}`,
      new Point(this.widgetWidth - 200, 25)
    );

    let min, max, diff;
    const rangeKeys = Object.keys(this.rangeTimer);
    for (let i = 0; i < rangeKeys.length; i++) {
      const key = rangeKeys[i];
      let aux = this.rangeTimer[key];
      min = aux < min || min == undefined ? aux : min;
      max = aux > max || max == undefined ? aux : max;
    }
    diff = max - min;
    const highestIndex = rangeKeys.length - 1;

    for (let i = 0, j = highestIndex; i < rangeKeys.length; i++, j--) {
      const rangeKey = rangeKeys[i];
      const date = rangeKey.split("-");
      const day = `${date[1]}.${date[2]}`;
      const rangeItem = this.rangeTimer[rangeKey];

      const cases = rangeItem;
      const delta = (cases - min) / diff;

      if (i < highestIndex) {
        const nextRange = this.rangeTimer[rangeKeys[i + 1]];
        const nextCases = nextRange;
        const nextDelta = (nextCases - min) / diff;
        const point1 = new Point(
          this.spaceBetweenDays * i + 50,
          this.graphLow - this.graphHeight * delta
        );
        const point2 = new Point(
          this.spaceBetweenDays * (i + 1) + 50,
          this.graphLow - this.graphHeight * nextDelta
        );
        this.drawLine(point1, point2, this.lineWeight, this.accentColor1);
      }

      // Vertical Line
      const point1 = new Point(
        this.spaceBetweenDays * i + 50,
        this.graphLow - this.graphHeight * delta
      );
      const point2 = new Point(this.spaceBetweenDays * i + 50, this.graphLow);
      this.drawLine(point1, point2, this.vertLineWeight, this.accentColor2);

      const casesRect = new Rect(
        this.spaceBetweenDays * i + 20,
        this.graphLow - 40 - this.graphHeight * delta,
        60,
        23
      );

      const dayRect = new Rect(
        this.spaceBetweenDays * i + 27,
        this.graphLow + 10,
        60,
        23
      );

      const color = cases > 0 ? this.widgetColor : Color.red();
      this.drawTextR(cases, casesRect, color, Font.systemFont(22));
      this.drawTextR(day, dayRect, color, Font.systemFont(22));
    }
  };

  setWidget = async (widget) => {
    return widget;
  };

  renderSmall = async (w) => {
    return await this.renderLarge(w);
  };

  renderLarge = async (w) => {
    const text = w.addText("暂不支持");
    text.font = Font.boldSystemFont(20);
    text.textColor = new Color("#fff");
    return w;
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
    let w;
    if (this.widgetFamily === "medium") {
      this.drawImage();
      widget.backgroundImage = this.drawContext.getImage();
      w = await this.renderMedium(widget);
    } else if (this.widgetFamily === "large") {
      w = await this.renderLarge(widget);
    } else {
      w = await this.renderSmall(widget);
    }
    return w;
  }
}
// @组件代码结束

await Runing(Widget, "", true); //远程开发环境
