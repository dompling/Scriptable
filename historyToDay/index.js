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
  defaultText: { size: 16, color: "ffffff", font: "regular" }, // 默认字体颜色
  light: { size: 16, color: "D0D3D4", font: "light" }, // 夜间字体颜色
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

class YaYaHistory {
  constructor() {
    this.widgetSize = config.runsInWidget ? config.widgetFamily : "medium";
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

  setHeader = async (widget, icon, title) => {
    let header = widget.addStack();
    header.centerAlignContent();
    let _icon = header.addImage(await this.fetchImg(icon));
    _icon.imageSize = new Size(14, 14);
    _icon.cornerRadius = 4;
    header.addSpacer(10);
    $.provideText(title, header, this.textFormat);
    widget.addSpacer(10);
    return widget;
  };

  setRightCell = async (text, cell, prefixColor = "fff") => {
    let tomorrowLine = cell.addImage(
      this.drawVerticalLine(new Color(prefixColor, 0.8), 12)
    );
    tomorrowLine.imageSize = new Size(3, 28);
    cell.addSpacer(5);
    $.provideText(text, cell, this.textFormat);
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
    if (this.dataSource.length) {
      const data = this.dataSource.splice(0, number);
      data.forEach((item) => {
        let dom = widget.addStack();
        dom.centerAlignContent();
        const prefixColor = this.randomHexColor();
        this.setRightCell(`${item.year}:${item.data}`, dom, prefixColor);
        widget.addSpacer(5);
      });
    }
    return widget;
  };

  init = async () => {
    const url = `https://api.nowtime.cc/v1/today_in_history`;
    const response = await $.get({ url });
    if (response.code === 200) {
      this.dataSource = response.data;
    }
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
    await this.setWidget(widget, 4);
    return widget;
  };

  renderLarge = async (widget) => {
    await this.setWidget(widget, 8);
    return widget;
  };

  render = async () => {
    const widget = new ListWidget();
    widget.setPadding(10, 10, 10, 10);
    let w = await this.setWidgetBackGround(widget);
    const date = new Date();
    let month = date.getMonth() + 1;
    month = month >= 10 ? month : `0${month}`;
    let day = date.getDate();
    day = day >= 10 ? day : `0${day}`;
    w = await this.setHeader(
      widget,
      "https://raw.githubusercontent.com/Orz-3/task/master/historyToday.png",
      `历史上的今天(${month}-${day})`
    );
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
