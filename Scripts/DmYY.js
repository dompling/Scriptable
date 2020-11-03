// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: map-pin;

/*
 * Author: 2Ya
 * Github: https://github.com/dompling
 */

class DmYY {
  constructor() {
    this.textStyle = this.mode
      ? this._textFormat.light
      : this._textFormat.defaultText;
    if (this.blurBackground) {
      if (typeof this.blurBackground === "number") {
        this.backgroundOpacity = this.blurBackground;
      } else {
        this.backgroundOpacity = this.mode ? 0.7 : 0.4;
      }
    }
  }
  defaultCacheData = {};
  prefix = "boxjs.net";
  blurBackground = true;
  imageBackground = true;
  forceImageUpdate = false;
  cacheBackgroundName = "2Ya-img";
  mode = Device.isUsingDarkAppearance();
  widgetSize = config.runsInWidget ? config.widgetFamily : "large";

  defaultHeaders = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  files = FileManager.local();

  _textFormat = {
    // Set the default font and color.
    defaultText: { size: 14, color: "ffffff", font: "regular" }, // 默认字体颜色
    light: { size: 14, color: "D0D3D4", font: "light" }, // 夜间字体颜色
    title: { size: 16, color: "ff651a", font: "semibold" },
    hot: { size: 20, color: "ffffff", font: "semibold" },
    more: { size: 14, color: "ffffff", font: "regular" },
  };

  skinColor = {
    defaultColor: {
      color: [new Color("#a18cd1"), new Color("#fbc2eb")],
      position: [0.0, 1.0],
    },
    night: {
      color: [new Color("#030079"), new Color("#000000")],
      position: [0.0, 1.0],
    },
  };

  init = () => {};

  async notify(title, body, url, opts = {}) {
    let n = new Notification();
    n = Object.assign(n, opts);
    n.title = title;
    n.body = body;
    if (url) n.openURL = url;
    return await n.schedule();
  }

  getRequest = (url = "") => {
    return new Request(url);
  };

  http = async (options = { headers: {}, url: "" }, type = "JSON") => {
    try {
      let request;
      if (type !== "IMG") {
        request = this.getRequest();
        Object.keys(options).forEach((key) => {
          request[key] = options[key];
        });
        request.headers = { ...this.defaultHeaders, ...options.headers };
      } else {
        request = this.getRequest(options.url);
        return await request.loadImage();
      }
      if (type === "JSON") {
        return await request.loadJSON();
      }
      if (type === "STRING") {
        return await request.loadString();
      }
      return await request.loadJSON();
    } catch (e) {
      console.log("error:" + e);
    }
  };

  $request = {
    get: async (url = "", options, type = "JSON") => {
      const params = { url, ...options, method: "GET" };
      let _type = type;
      if (typeof options === "string") _type = options;
      return await this.http(params, _type);
    },
    post: async (url = "", options, type = "JSON") => {
      const params = { url, ...options, method: "POST" };
      let _type = type;
      if (typeof options === "string") _type = options;
      return await this.http(params, _type);
    },
  };

  getCache = async (key) => {
    try {
      const url = `http://${this.prefix}/query/boxdata`;
      const boxdata = await this.$request.get(url);
      let data;
      const cacheKeys = Object.keys(this.defaultCacheData);
      if (cacheKeys.length) {
        data = {};
        cacheKeys.forEach((params) => {
          const datasKey = `${key}.${params}`;
          const dataValue = boxdata.datas[datasKey];
          if (dataValue) {
            data[params] = dataValue;
          }
        });
      } else {
        const cacheValue = boxdata.datas[key];
        if (cacheValue) {
          data = this.transforJSON(cacheValue);
        }
      }
      return data;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  transforJSON = (str) => {
    if (typeof str == "string") {
      try {
        return JSON.parse(str);
      } catch (e) {
        console.log(e);
        return str;
      }
    }
    console.log("It is not a string!");
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
    return await ctx.getImage();
  };

  setWidgetBackGround = async (widget) => {
    if (this.imageBackground) {
      const path = this.getCacheFilepath();
      const exists = this.verifyFilePath(path);
      if (exists && (config.runsInWidget || !this.forceImageUpdate)) {
        // 文件存在，读取缓存，设置背景
        const image = this.files.readImage(path);
        // 设置图片模糊程度
        widget.backgroundImage = await this.setShadowImage(
          image,
          this.backgroundOpacity
        );
      } else if (!exists && config.runsInWidget) {
        // 默认背景色
        widget.backgroundColor = Color.gray();
      } else {
        // 设置选择图片背景
        widget.backgroundImage = await this.chooseImgAndCache(path);
      }
    } else {
      // 系统配置背景色
      let gradient = new LinearGradient();
      let gradientSettings = this.mode
        ? this.skinColor.night
        : this.skinColor.defaultColor;
      gradient.colors = gradientSettings.color();
      gradient.locations = gradientSettings.position();
      widget.backgroundGradient = gradient;
    }
    return widget;
  };

  // 选择图片并缓存
  chooseImgAndCache = async (path) => {
    const photoLibrary = await Photos.fromLibrary();
    this.files.writeImage(path, photoLibrary);
    return photoLibrary;
  };

  // 验证文件路径
  verifyFilePath = (path) => {
    return this.files.fileExists(path);
  };

  // 获取缓存本地路径
  getCacheFilepath = (cacheName = this.cacheBackgroundName) => {
    return this.files.joinPath(this.files.documentsDirectory(), cacheName);
  };

  // 设置线行块儿元素
  drawVerticalLine(color, height, width = 2) {
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

  setMore = async (headerBody, more) => {
    headerBody.addSpacer(170);
    // 右边更多
    const headerRight = headerBody.addStack();
    headerRight.url = more.url;
    headerRight.setPadding(1, 10, 1, 10);
    headerRight.cornerRadius = 10;
    headerRight.backgroundColor = new Color(more.bgColor || "#fff", 0.5);
    this.provideText("更多", headerRight, more.fontStyle);
    widget.addSpacer(10);
  };

  // 设置头部信息
  setHeader = async (
    widget,
    { icon = "", title = "", size = new Size(14, 16) },
    more = false
  ) => {
    const headerBody = widget.addStack();
    headerBody.centerAlignContent();
    // 左边内容
    const headerLeft = headerBody.addStack();
    const iconImg = await this.$request.get(icon, "IMG");
    let _icon = headerLeft.addImage(iconImg);
    _icon.imageSize = size;
    _icon.cornerRadius = 4;
    headerLeft.addSpacer(5);
    this.provideText(title, headerLeft);
    if (more) {
      if (typeof more === "function") {
        await more(headerBody);
      } else {
        await this.setMore(headerBody, more);
      }
    }
    return widget;
  };

  // 显示一行的字
  setCellText = (text, cell, format = this.textFormat, prefixColor = true) => {
    if (prefixColor) {
      if (typeof prefixColor === "boolean") prefixColor = this.randomHexColor();
      let tomorrowLine = cell.addImage(
        this.drawVerticalLine(new Color(prefixColor, 0.8), 12)
      );
      tomorrowLine.imageSize = new Size(3, 28);
    }
    cell.addSpacer(5);
    return this.provideText(text, cell, format);
  };

  // 生成随机色
  randomHexColor() {
    var hex = Math.floor(Math.random() * 16777216).toString(16); //生成ffffff以内16进制数
    while (hex.length < 6) {
      //while循环判断hex位数，少于6位前面加0凑够6位
      hex = "0" + hex;
    }
    return hex; //返回‘#’开头16进制颜色
  }

  // 显示文字
  provideText = (string, container, format = this.textStyle) => {
    const textItem = container.addText(string);
    const textFont = format.font;
    const textSize = format.size;
    const textColor = format.color;

    textItem.font = this.provideFont(textFont, textSize);
    textItem.textColor = new Color(textColor);
    return textItem;
  };

  // 文字样式
  provideFont(fontName, fontSize) {
    const fontGenerator = {
      ultralight: function () {
        return Font.ultraLightSystemFont(fontSize);
      },
      light: function () {
        return Font.lightSystemFont(fontSize);
      },
      regular: function () {
        return Font.regularSystemFont(fontSize);
      },
      medium: function () {
        return Font.mediumSystemFont(fontSize);
      },
      semibold: function () {
        return Font.semiboldSystemFont(fontSize);
      },
      bold: function () {
        return Font.boldSystemFont(fontSize);
      },
      heavy: function () {
        return Font.heavySystemFont(fontSize);
      },
      black: function () {
        return Font.blackSystemFont(fontSize);
      },
      italic: function () {
        return Font.italicSystemFont(fontSize);
      },
    };

    const systemFont = fontGenerator[fontName];
    if (systemFont) {
      return systemFont();
    }
    return new Font(fontName, fontSize);
  }

  setWidget = async (widget) => {
    return widget;
  };

  renderErrorWidget = (widget, msg = "") => {
    widget.addText(JSON.stringify(msg) || "暂不支持该尺寸组件");
    return widget;
  };

  renderSmall = async (widget) => {
    return await this.setWidget(widget);
  };

  renderMedium = async (widget) => {
    await this.setWidget(widget);
    return widget;
  };

  renderLarge = async (widget) => {
    await this.setWidget(widget);
    return widget;
  };

  renderBefor = async (w) => {
    return w;
  };

  render = async () => {
    const widget = new ListWidget();
    widget.setPadding(10, 10, 10, 10);
    let w = await this.renderBefor(widget);
    await this.setWidgetBackGround(w);
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
    return w;
  };
}
module.exports = { DmYY };
