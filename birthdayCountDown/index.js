// 先引入Components 中的Calendar.scriptable,然后引入当前文件即可正常使用

const { Calendar } = importModule("Calendar");
const $ = importModule("Env");

const prefix = "boxjs.net"; // 输入 BoxJs 的域名前缀 boxjs.com || boxjs.net || 自定义

const blurBackground = true; // 开启背景虚化 true 值类型布尔或数字 ，默认 0.7 取值范围 0 至 1

const imageBackground = true; // 设置配置背景图片
const forceImageUpdate = false; // 设置为true将重置小部件的背景图像

const avatarImage = false; // 设置左边照片  ： 默认左边照片为 BoxJS 的媒体图片
const forceAvatarUpdate = false; // 重置左边照片

const defaultData = {
  username: "", // 姓名
  time: "", // 生日日期
  nongli: "", // 农历生日
  eday: "", //相识
  isLeapMonth: false, //如果是农历闰月第四个参数赋值true即可
  mediaImg: "", // 媒体图片
};

class YaYaBirthday extends Calendar {
  constructor(props) {
    super(props);
    this.props = props;
    this.data = props.data;
    this.prefix = props.prefix;
    this.widgetSize = config.runsInWidget ? config.widgetFamily : "small";
    this.mode = Device.isUsingDarkAppearance();
    if (blurBackground) {
      if (typeof blurBackground === "number") {
        this.backgroundOpacity = blurBackground;
      }
      this.backgroundOpacity = 0.7;
    }
  }

  init = async () => {
    const data = await this.fetchBoxJsData("@birthday");
    if (data) {
      this.data = data;
    }
    this.getCalendarData();
  };

  fetchBoxJsData = async (key) => {
    const url = `http://${this.prefix}/query/boxdata`;
    const boxdata = await $.get({ url });
    const data = {};
    let isReadBoxJs = false;
    Object.keys(defaultData).forEach((params) => {
      const datasKey = `${key}.${params}`;
      const dataValue = boxdata.datas[datasKey];
      if (dataValue) {
        isReadBoxJs = true;
        data[params] = dataValue;
      }
    });
    if (isReadBoxJs) {
      return data;
    }
    return undefined;
  };

  isNight(dateInput) {
    const timeValue = dateInput.getTime();
    return timeValue < sunData.sunrise || timeValue > sunData.sunset;
  }

  fetchImg = async (url) => {
    const response = new Request(url);
    return await response.loadImage();
  };

  setHeader = async (widget) => {
    const header = widget.addStack();
    provideText(`🐣${this.data.username}🐣`, header); // 设置头信息
    return widget;
  };

  setWidgetBackGround = async (widget) => {
    if (imageBackground) {
      const files = FileManager.local();
      const path = files.joinPath(files.documentsDirectory(), "birthday-image");
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
      let gradientSettings = await setupGradient();
      if (this.mode) {
        gradient.colors = gradientSettings.night.color();
        gradient.locations = gradientSettings.night.position();
      } else {
        gradient.colors = gradientSettings.sunrise.color();
        gradient.locations = gradientSettings.sunrise.position();
      }
      widget.backgroundGradient = gradient;
    }
    return widget;
  };

  setWidget = async (body) => {
    const {
      animal,
      astro,
      gregorian,
      nextBirthday,
      meetDay,
      birthdayText,
    } = this.contentText;
    const { IMonthCn, IDayCn } = gregorian;
    let right = body.addStack();
    right.layoutVertically();
    this.setRightCell(`🐽相:${animal}`, right, "8E44AD"); // 属相
    this.setRightCell(`🌠座:${astro}`, right, "45B39D"); // 属相
    if (meetDay) {
      this.setRightCell(`💖遇:${meetDay} 天`, right, "F7DC6F");
    }
    this.setRightCell(
      `🎂生:${nextBirthday.cYear}-${nextBirthday.cMonth}-${nextBirthday.cDay} (${birthdayText[1]}天)`,
      right,
      "F1948A"
    );
    // this.setRightCell(`📆公:${cYear}-${cMonth}-${cDay}`, right);
    this.setRightCell(`📆农:${IMonthCn}${IDayCn}`, right, "2E86C1");
    return body;
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

  setRightCell = async (text, cell, prefixColor = "fff") => {
    const subConditionStack = cell.addStack();
    let tomorrowLine = subConditionStack.addImage(
      drawVerticalLine(new Color(prefixColor, 0.8), 12)
    );
    tomorrowLine.imageSize = new Size(3, 28);
    subConditionStack.addSpacer(5);
    let rowCell = subConditionStack.addStack();
    rowCell.setPadding(4, 0, 0, 0);
    if (this.mode) {
      provideText(text, rowCell, textFormat.light);
    } else {
      provideText(text, rowCell);
    }
    cell.addSpacer(1);
  };

  getEdayNumber = (date) => {
    var initDay = date.split("-");
    var obj = {
      cYear: parseInt(initDay[0]),
      cMonth: parseInt(initDay[1]),
      cDay: parseInt(initDay[2]),
    };
    return Math.abs(this.daysBetween(obj));
  };

  getCalendarData = () => {
    const { time, nongli, isLeapMonth, eday } = this.data;
    const _data = time.split("-");
    const opt = {
      year: parseInt(_data[0]),
      month: parseInt(_data[1]),
      day: parseInt(_data[2]),
      nongli,
      isLeapMonth,
    };

    const response = {};
    response.birthdayText = this.birthday(opt);
    response.nextBirthday = response.birthdayText[0];

    const solarData =
      nongli === "true"
        ? this.lunar2solar(opt.year, opt.month, opt.day, isLeapMonth)
        : this.solar2lunar(opt.year, opt.month, opt.day);
    response.gregorian = solarData;
    response.animal = `${this.getAnimalZodiacToEmoji(solarData.Animal)}-${
      solarData.Animal
    }`;
    response.astro = `${this.getAstroToEmoji(solarData.astro)}-${
      solarData.astro
    }`;
    if (this.verifyTime(eday)) {
      response.meetDay = this.getEdayNumber(eday);
    }
    this.contentText = response;
  };

  getEnableLeft = async (widget) => {
    let body = widget.addStack();
    body.url = "";
    let left = body.addStack();
    left.layoutVertically();
    left.centerAlignContent();
    await this.setHeader(left);
    left.addSpacer(5);

    let leftImg = await this.fetchImg(this.data.mediaImg);
    if (avatarImage) {
      const files = FileManager.local();
      const path = files.joinPath(
        files.documentsDirectory(),
        "birthday-avatar-image"
      );
      const exists = files.fileExists(path);
      if (exists && (config.runsInWidget || !forceAvatarUpdate)) {
        leftImg = files.readImage(path);
      } else if (!exists && config.runsInWidget) {
        widget.backgroundColor = Color.gray();
      } else {
        const img = await Photos.fromLibrary();
        leftImg = img;
        files.writeImage(path, img);
      }
    }
    let leftContent = left.addImage(leftImg);
    leftContent.imageSize = new Size(120, 120);
    leftContent.cornerRadius = 5;
    body.addSpacer(5);
    return body;
  };

  renderErrorWidget = (widget) => {
    widget.addText("暂不支持该尺寸组件");
    return widget;
  };

  renderSmall = async (widget) => {
    widget.setPadding(0, 10, 0, 0);
    return await this.setWidget(widget);
  };

  renderMedium = async (widget) => {
    let body = await this.getEnableLeft(widget);
    await this.setWidget(body);
    return widget;
  };

  render = async () => {
    const widget = new ListWidget();
    widget.setPadding(0, 0, 0, 0);
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

// Draw the vertical line in the tomorrow view.
function drawVerticalLine(color, height) {
  const width = 2;

  let draw = new DrawContext();
  draw.opaque = false;
  draw.respectScreenScale = true;
  draw.size = new Size(width, height);

  let barPath = new Path();
  // const barHeight = height;
  barPath.addRoundedRect(new Rect(0, 0, height, height), width / 2, width / 2);
  draw.addPath(barPath);
  draw.setFillColor(color);
  draw.fillPath();
  return draw.getImage();
}

const textFormat = {
  // Set the default font and color.
  defaultText: { size: 16, color: "ffffff", font: "regular" },
  light: { size: 16, color: "000", font: "light" },
};

// Add formatted text to a container.
function provideText(
  string,
  container,
  format = { size: 16, color: "ffffff", font: "regular" }
) {
  const textItem = container.addText(string);
  const textFont = format.font || textFormat.defaultText.font;
  const textSize = format.size || textFormat.defaultText.size;
  const textColor = format.color || textFormat.defaultText.color;

  textItem.font = provideFont(textFont, textSize);
  textItem.textColor = new Color(textColor);

  return textItem;
}

// Set up the gradient for the widget background.
async function setupGradient() {
  return {
    dawn: {
      color() {
        return [new Color("142C52"), new Color("1B416F"), new Color("62668B")];
      },
      position() {
        return [0, 0.5, 1];
      },
    },

    sunrise: {
      color() {
        return [new Color("274875"), new Color("766f8d"), new Color("f0b35e")];
      },
      position() {
        return [0, 0.8, 1.5];
      },
    },

    midday: {
      color() {
        return [new Color("3a8cc1"), new Color("90c0df")];
      },
      position() {
        return [0, 1];
      },
    },

    noon: {
      color() {
        return [new Color("b2d0e1"), new Color("80B5DB"), new Color("3a8cc1")];
      },
      position() {
        return [-0.2, 0.2, 1.5];
      },
    },

    sunset: {
      color() {
        return [new Color("32327A"), new Color("662E55"), new Color("7C2F43")];
      },
      position() {
        return [0.1, 0.9, 1.2];
      },
    },

    twilight: {
      color() {
        return [new Color("021033"), new Color("16296b"), new Color("414791")];
      },
      position() {
        return [0, 0.5, 1];
      },
    },

    night: {
      color() {
        return [
          new Color("16296b"),
          new Color("021033"),
          new Color("021033"),
          new Color("113245"),
        ];
      },
      position() {
        return [-0.5, 0.2, 0.5, 1];
      },
    },
  };
}

// Provide a font based on the input.
function provideFont(fontName, fontSize) {
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

(async () => {
  const renderBirthday = new YaYaBirthday({ prefix, data: defaultData });
  await renderBirthday.init(); //  初始化组件
  await renderBirthday.render(); // 渲染 widget
})();
