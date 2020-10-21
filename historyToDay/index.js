// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: map-pin;

/*
 * Author: 2Ya
 * Github: https://github.com/dompling
 * 本脚本使用了@Gideon_Senku的Env
 */

const $ = importModule("Env");

const blurBackground = true; // 开启背景虚化 true 值类型布尔或数字 ，默认 0.7 取值范围 0 至 1
const imageBackground = true; // 设置配置背景图片
const forceImageUpdate = false; // 设置为true将重置小部件的背景图像
const cacheBackgroundName = "historyDay-image"; // 缓存背景图片名字

const textFormat = {
  // Set the default font and color.
  defaultText: { size: 14, color: "ffffff", font: "regular" }, // 默认字体颜色
  light: { size: 14, color: "D0D3D4", font: "light" }, // 夜间字体颜色
  title: { size: 16, color: "ff651a", font: "semibold" },
  hot: { size: 20, color: "ffffff", font: "semibold" },
  more: { size: 14, color: "ffffff", font: "regular" },
};

// 设置widget 背景色
const skinColor = {
  defaultColor: {
    color: [new Color("#a18cd1"), new Color("#fbc2eb")],
    position: [0.0, 1.0],
  },
  night: {
    color: [new Color("#030079"), new Color("#000000")],
    position: [0.0, 1.0],
  },
};

// 设置单行内容背景色
const cellBgColor = {
  color: [new Color("#aaa")],
  position: [1.0],
};

const imgUri = "http://img.lssdjt.com";
const date = new Date();
let month = date.getMonth() + 1;
month = month >= 10 ? month : `0${month}`;
let day = date.getDate();
day = day >= 10 ? day : `0${day}`;
class YaYaHistory {
  constructor() {
    this.widgetSize = config.runsInWidget ? config.widgetFamily : "large";
    this.mode = Device.isUsingDarkAppearance();
    this.textFormat = this.mode ? textFormat.light : textFormat.defaultText;
    this.dataSource = [];
    if (blurBackground) {
      if (typeof blurBackground === "number") {
        this.backgroundOpacity = blurBackground;
      } else {
        this.backgroundOpacity = this.mode ? 0.7 : 0.4;
      }
    }
  }

  init = async () => {
    // const url = `https://api.nowtime.cc/v1/today_in_history`;
    const url = `http://code.lssdjt.com/jsondata/history.${month}.${day}.js`;
    const response = await $.get({ url });
    this.dataSource = response.d;
  };

  // 给图片加透明遮罩
  setShadowImage = async (img, opacity) => {
    if (!opacity) return img;
    let ctx = new DrawContext();
    // 获取图片的尺寸
    ctx.size = img.size;

    ctx.drawImageInRect(
      img,
      new Rect(0, 0, img.size["width"], img.size["height"])
    );
    ctx.setFillColor(new Color("#000000", opacity));
    ctx.fillRect(new Rect(0, 0, img.size["width"], img.size["height"]));

    let res = await ctx.getImage();
    return res;
  };

  setWidgetBackGround = async (widget) => {
    if (imageBackground) {
      const files = FileManager.local();
      const path = files.joinPath(
        files.documentsDirectory(),
        cacheBackgroundName
      );
      const exists = files.fileExists(path);
      if (exists && (config.runsInWidget || !forceImageUpdate)) {
        const image = files.readImage(path);
        widget.backgroundImage = await this.setShadowImage(
          image,
          this.backgroundOpacity
        );
      } else if (!exists && config.runsInWidget) {
        widget.backgroundColor = Color.gray();
      } else {
        const img = await Photos.fromLibrary();
        widget.backgroundImage = await this.setShadowImage(
          img,
          this.backgroundOpacity
        );
        files.writeImage(path, img);
      }
    } else {
      let gradient = new LinearGradient();
      let gradientSettings = this.mode
        ? skinColor.night
        : skinColor.defaultColor;
      gradient.colors = gradientSettings.color();
      gradient.locations = gradientSettings.position();
      widget.backgroundGradient = gradient;
    }
    return widget;
  };

  // Draw the vertical line in the tomorrow view.
  drawVerticalLine(color, height) {
    const width = 2;

    let draw = new DrawContext();
    draw.opaque = false;
    draw.respectScreenScale = true;
    draw.size = new Size(width, height);

    let barPath = new Path();
    // const barHeight = height;
    barPath.addRoundedRect(
      new Rect(0, 0, height, height),
      width / 2,
      width / 2
    );
    draw.addPath(barPath);
    draw.setFillColor(color);
    draw.fillPath();
    return draw.getImage();
  }

  setHeader = async (widget) => {
    const headerBody = widget.addStack();
    headerBody.centerAlignContent();
    // 左边内容
    const headerLeft = headerBody.addStack();
    const icon =
      "https://raw.githubusercontent.com/Orz-3/task/master/historyToday.png";
    const title = "历史上的今天";
    let _icon = headerLeft.addImage(await this.fetchImg(icon));
    _icon.imageSize = new Size(14, 16);
    _icon.cornerRadius = 4;
    headerLeft.addSpacer(5);
    $.provideText(title, headerLeft, textFormat.title);
    headerBody.addSpacer(170);
    // 右边更多
    const headerRight = headerBody.addStack();
    headerRight.url = `https://m.8684.cn/today_d${month}${day}`;
    headerRight.setPadding(1, 10, 1, 10);
    headerRight.cornerRadius = 10;
    headerRight.backgroundColor = new Color("#fff", 0.5);

    $.provideText("更多", headerRight, textFormat.more);

    widget.addSpacer(10);
    return widget;
  };

  setCell = async (
    text,
    cell,
    prefixColor = "fff",
    format = this.textFormat
  ) => {
    if (prefixColor) {
      let tomorrowLine = cell.addImage(
        this.drawVerticalLine(new Color(prefixColor, 0.8), 12)
      );
      tomorrowLine.imageSize = new Size(3, 28);
    }
    cell.addSpacer(5);
    $.provideText(text, cell, format);
    cell.addSpacer(2);
  };

  randomHexColor() {
    var hex = Math.floor(Math.random() * 16777216).toString(16); //生成ffffff以内16进制数
    while (hex.length < 6) {
      //while循环判断hex位数，少于6位前面加0凑够6位
      hex = "0" + hex;
    }
    return hex; //返回‘#’开头16进制颜色
  }

  setWidget = async (widget, number) => {
    await this.setHeader(widget);
    if (this.dataSource.length) {
      const data = this.dataSource.splice(0, number);
      data.forEach((item) => {
        let dom = widget.addStack();
        dom.url = `https://www.lssdjt.com/d/${item.f}.htm`;
        dom.centerAlignContent();
        dom.cornerRadius = 5;
        let prefixColor = this.randomHexColor();
        this.setCell(`${item.t}`, dom, prefixColor);
        widget.addSpacer(5);
      });
    }
    return widget;
  };

  fetchImg = async (url) => {
    const response = new Request(url);
    return await response.loadImage();
  };

  renderErrorWidget = (widget) => {
    widget.addText("暂不支持该尺寸组件");
    return widget;
  };

  renderSmall = async (widget) => {
    return await this.setWidget(widget, 1);
  };

  renderMedium = async (widget) => {
    await this.setWidget(widget, 3);
    return widget;
  };

  renderLarge = async (widget) => {
    const topItem = this.dataSource.find((item) => item.g === 1);
    const hotBody = widget.addStack();
    hotBody.url = `https://www.lssdjt.com/d/${topItem.f}.htm`;
    hotBody.centerAlignContent();
    hotBody.size = new Size(340, 200);
    hotBody.borderWidth = 15;
    hotBody.borderColor = new Color("#fff");
    hotBody.cornerRadius = 20;
    const hotImg = await this.fetchImg(`${imgUri}/${topItem.j}`);
    hotBody.backgroundImage = await this.setShadowImage(
      hotImg,
      this.backgroundOpacity
    );
    this.setCell(`${topItem.t}`, hotBody, false, textFormat.hot);
    hotBody.addSpacer(10);
    widget.addSpacer(10);
    await this.setWidget(widget, 3);
    return widget;
  };

  render = async () => {
    const widget = new ListWidget();
    widget.setPadding(10, 10, 10, 10);
    let w = await this.setWidgetBackGround(widget);
    switch (this.widgetSize) {
      case "small": {
        w = await this.renderSmall(w);
        w.presentSmall();
        break;
      }
      case "medium": {
        w = await this.renderMedium(w);
        w.presentMedium();
        break;
      }
      case "large": {
        w = await this.renderLarge(w);
        w.presentLarge();
        break;
      }
      default: {
        w = await this.renderErrorWidget(w);
        w.presentSmall();
        break;
      }
    }
    Script.setWidget(w);
    Script.complete();
  };
}

const _2YaHistory = new YaYaHistory();
await _2YaHistory.init(); // 初始化数据
await _2YaHistory.render(); // 加载widget
