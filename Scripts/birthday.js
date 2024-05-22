// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: car;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");
let mainTextSize = 13; // 倒数、农历、生日文字大小

let widthMode = 110; // 中号组件图片尺寸

let heightMode = 100; // 中号组件图片尺寸

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.en = "birthday";
    this.name = "破壳日";
    this.LEFT_IMG_KEY = `${this.cacheImage}/avatar`;

    if (config.runsInApp) {
      this.registerAction({
        title: "头像设置",
        menu: [
          {
            icon: { name: "person.badge.plus", color: "#52c41a" },
            type: "img",
            title: "头像",
            name: "avatar",
            val: this.cacheImage,
          },
          {
            icon: { name: "arrow.left.and.right", color: "#13c2c2" },
            type: "input",
            title: "头像宽度",
            name: "avatarWidth",
          },
          {
            icon: { name: "arrow.up.and.down", color: "#1890ff" },
            type: "input",
            title: "头像高度",
            name: "avatarHeight",
          },
        ],
      });

      this.registerAction({
        icon: { name: "a.square", color: "#eb2f96" },
        type: "input",
        title: "主文字大小",
        name: "mainTextSize",
      });

      this.registerAction({
        icon: {
          name: "rectangle.and.pencil.and.ellipsis",
          color: "#f5222d",
        },
        type: "input",
        title: "昵称",
        placeholder: "用户昵称",
        name: "nickname",
      });

      this.registerAction({
        icon: {
          name: "rectangle",
          color: "#a68585",
        },
        type: "color",
        title: "昵称阴影",
        placeholder: "昵称阴影",
        name: "nicknameShadow",
      });

      this.registerAction({
        icon: {
          name: "bubble.left",
          color: "#faf61c",
        },
        type: "input",
        title: "寄语",
        name: "bless",
      });

      this.registerAction({
        icon: {
          name: "25.square.fill",
          color: "#fa541c",
        },
        type: "switch",
        title: "农历",
        name: "nongli",
      });

      this.registerAction({
        icon: {
          name: "calendar",
          color: "#fa8c16",
        },
        type: "date",
        title: "破壳日",
        name: "birthday",
      });

      this.registerAction({
        icon: {
          name: "calendar.badge.clock",
          color: "#8016fa",
        },
        type: "date",
        title: "相识",
        name: "eday",
      });

      this.registerAction("基础设置", this.setWidgetConfig);
    }
  }

  getAge = (beginStr) => {
    let tmpBirth = {};
    tmpBirth.year = 0;
    tmpBirth.month = 0;
    tmpBirth.day = 0;

    if (beginStr == null || beginStr == "") {
      return;
    }
    let startDate = new Date(beginStr.replace(/-/g, "/"));
    let today = new Date();

    let startYear = startDate.getFullYear();
    let endYear = today.getFullYear();
    let startMonth = startDate.getMonth() + 1;
    let endMonth = today.getMonth() + 1;
    let startDay = startDate.getDate();
    let endDay = today.getDate();
    let allDays = 0;
    //准确的每个月天数数组，判断闰年平年。
    let allDayArr = [];
    //当月计算
    if (startYear == endYear && startMonth == endMonth) {
      tmpBirth.day = endDay - startDay;
      return tmpBirth;
    }
    //正常计算
    for (let i = startYear; i <= endYear; i++) {
      let currYear = 365;
      let yearMonth = 12;
      if ((i % 4 == 0 && i % 100 !== 0) || i % 400 == 0) {
        allDays += 366;
        currYear = 366;
      }
      let currMonth = 1;
      if (i == startYear) {
        currMonth = startMonth;
      }
      if (i == endYear) {
        yearMonth = endMonth;
      }
      //闰年计算
      for (let m = currMonth; m <= yearMonth; m++) {
        let fullDays = 30;

        if (m == 1 || m == 3 || m == 8 || m == 10 || m == 12) {
          fullDays = 31;
        } else if (m == 2) {
          if ((i % 4 == 0 && i % 100 !== 0) || i % 400 == 0) {
            fullDays = 29;
          } else {
            fullDays = 28;
          }
        }
        let dayObj = {
          fullDays: fullDays,
          currDays: fullDays,
        };
        if (m == startMonth && i == startYear) {
          dayObj = {
            fullDays: fullDays,
            currDays: fullDays - startDay,
          };
        } else if (m == endMonth && i == endYear) {
          dayObj = {
            fullDays: fullDays,
            currDays: endDay,
          };
        }
        allDayArr.push(dayObj);
      }
    }

    if (allDayArr.length == 1) {
      tmpBirth.day = allDayArr[0].currDays;
    } else if (allDayArr.length == 2) {
      var d1 = allDayArr[0].currDays;
      var d2 = allDayArr[1].currDays;
      //月份天数浮动因子决定准确性
      let cfDay =
        allDayArr[0].fullDays > allDayArr[allDayArr.length - 1].fullDays
          ? allDayArr[allDayArr.length - 1].fullDays
          : allDayArr[0].fullDays;
      if (d1 + d2 >= cfDay) {
        tmpBirth.day = d1 + d2 - cfDay;
        tmpBirth.month += 1;
      } else {
        tmpBirth.day = d1 + d2;
      }
    } else {
      let d1 = allDayArr[0].currDays;
      let d2 = allDayArr[allDayArr.length - 1].currDays;
      let sumFullDay = 0;
      for (let i = 0; i < allDayArr.length; i++) {
        sumFullDay += allDayArr[i].fullDays;
      }
      //月份天数浮动因子决定准确性
      let cfDay =
        allDayArr[0].fullDays > allDayArr[allDayArr.length - 1].fullDays
          ? allDayArr[allDayArr.length - 1].fullDays
          : allDayArr[0].fullDays;
      if (d1 + d2 >= cfDay) {
        tmpBirth.day = d1 + d2 - cfDay;
        tmpBirth.month += 1;
      } else {
        tmpBirth.day = d1 + d2;
      }
      tmpBirth.month += allDayArr.length - 2;

      if (tmpBirth.month >= 12) {
        tmpBirth.year += Math.floor(tmpBirth.month / 12);
        tmpBirth.month = tmpBirth.month - tmpBirth.year * 12;
      }
    }
    return tmpBirth;
  };

  daysBetween = (d) => {
    let now = new Date();
    let date = new Date(d.cYear, d.cMonth - 1, d.cDay);
    return parseInt((date.getTime() - now.getTime()) / (24 * 3600 * 1000));
  };

  getAstroToEmoji = (astro) => {
    const data = {
      白羊座: "♈",
      金牛座: "♉",
      双子座: "♊",
      巨蟹座: "♋",
      狮子座: "♌",
      处女座: "♍",
      天秤座: "♎",
      天蝎座: "♏",
      射手座: "♐",
      摩羯座: "♑",
      水瓶座: "♒",
      双鱼座: "♓",
      蛇夫座: "⛎",
    };
    return data[astro] || "";
  };

  getAnimalZodiacToEmoji = (zodiac) => {
    const data = {
      鼠: "🐭",
      牛: "🐂",
      虎: "🐯",
      兔: "🐇",
      龙: "🐲",
      蛇: "🐍",
      马: "🐴",
      羊: "🐑",
      猴: "🐵",
      鸡: "🐔",
      狗: "🐶",
      猪: "🐷",
    };
    return data[zodiac] || "";
  };

  verifyTime(date) {
    let dateFormat = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    return dateFormat.test(date);
  }

  getEdayNumber = (date) => {
    var initDay = date.split("-");
    var obj = {
      cYear: parseInt(initDay[0]),
      cMonth: parseInt(initDay[1]),
      cDay: parseInt(initDay[2]),
    };
    return Math.abs(this.daysBetween(obj));
  };

  ajax = async (opt) => {
    const type = opt.nongli ? "lunar" : "solar";
    return (
      await this.$request.post(`https://www.iamwawa.cn/home/nongli/ajax`, {
        body: `type=${type}&year=${opt.year}&month=${opt.month}&day=${opt.day}`,
      })
    ).data;
  };

  init = async () => {
    widthMode = Number(this.settings.avatarWidth) || widthMode;
    heightMode = Number(this.settings.avatarHeight) || heightMode;
    mainTextSize = Number(this.settings.mainTextSize) || mainTextSize;

    await this.FILE_MGR.fileExistsExtra(this.LEFT_IMG_KEY);
    this.defaultData = {
      username: this.settings.nickname || "", // 姓名
      time: this.settings.birthday || "2022-12-19", // 生日日期
      nongli: this.settings.nongli === "true" || "", // 农历生日
      eday: this.settings.eday || "2022-12-19", //相识
      bless: this.settings.bless || "",
      nicknameShadow: this.settings.nicknameShadow || "#e8e8e8",
      isLeapMonth: false, //如果是农历闰月第四个参数赋值true即可
    };

    const { time, nongli, isLeapMonth, eday } = this.defaultData;
    const _data = time.split("-");
    const opt = {
      year: parseInt(_data[0]),
      month: parseInt(_data[1]),
      day: parseInt(_data[2]),
      nongli,
      isLeapMonth,
    };

    if (this.settings.ajax) {
      this.ajax(opt).then((res) => {
        this.settings.ajax = res;
        this.saveSettings(false);
      });
    } else {
      this.settings.ajax = await this.ajax(opt);
    }
    this.saveSettings(false);
    const response = this.settings.ajax;

    response.animalEmoji = `${this.getAnimalZodiacToEmoji(response.sx)}`;
    response.astro = `${this.getAstroToEmoji(response.xz)}`;

    if (this.verifyTime(eday)) {
      response.meetDay = this.getEdayNumber(eday);
    }

    this.contentText = { ...response, data: {} };

    this.contentText.this_year_lunar_solar =
      this.contentText.this_year_lunar_solar
        .replace("年", "-")
        .replace("月", "-")
        .replace("日", "");
    this.contentText.next_year_lunar_solar =
      this.contentText.next_year_lunar_solar
        .replace("年", "-")
        .replace("月", "-")
        .replace("日", "");
    this.contentText.solar = this.contentText.solar
      .replace("年", "-")
      .replace("月", "-")
      .replace("日", "");

    const tmpBirth = this.getAge(this.defaultData.time);
    let ageYear = tmpBirth.year > 0 ? `${tmpBirth.year}岁` : "";
    let ageMonth = tmpBirth.month > 0 ? `${tmpBirth.month}月` : "";
    let ageDay = tmpBirth.day > 0 ? `${tmpBirth.day}天` : "1天";
    const age = ageYear + ageMonth + ageDay;
    const dayIcon = tmpBirth.day + ".circle.fill";

    this.contentText.data = {
      tmpBirth,
      ageYear,
      ageMonth,
      ageDay,
      age,
      dayIcon,
    };
  };

  rowCell = (widget, { icon, color, title, text, dayImage = false }) => {
    const subWidget = widget.addStack();
    subWidget.centerAlignContent();

    const subImg = subWidget.addImage(SFSymbol.named(icon).image);
    subImg.tintColor = new Color(color);
    subImg.imageSize = new Size(mainTextSize, mainTextSize);
    subWidget.addSpacer(4);
    const subTitle = subWidget.addText(title || "");
    subTitle.font = Font.systemFont(mainTextSize);
    subTitle.textColor = this.widgetColor;
    subWidget.addSpacer();
    const subValue = subWidget.addText(text || "");
    subValue.font = Font.systemFont(mainTextSize);
    subValue.textColor = this.widgetColor;
    subValue.lineLimit = 1;

    if (dayImage) {
      subWidget.addSpacer(2);
      let dayIcon = subWidget.addImage(SFSymbol.named(dayImage).image);
      dayIcon.imageSize = new Size(mainTextSize + 1, mainTextSize + 1);
      dayIcon.tintColor = new Color("#1ab6f8");
    }
  };

  animalImg = (text) => {
    const { this_year_lunar_solar, solar } = this.contentText;

    const nextBirthday = {
      year: this_year_lunar_solar.split("-")[0],
      month: this_year_lunar_solar.split("-")[1],
      day: this_year_lunar_solar.split("-")[2],
    };

    const preData = {
      year: solar.split("-")[0],
      month: solar.split("-")[1],
      day: solar.split("-")[2],
    };

    const extraTextColor = "fc8ac3"; //环形进度条中心背景颜色及名字、meetDay颜色
    const ringColor = "fc5ead"; //环形进度条颜色
    const canvSize = 172;
    const canvTextSize = 45;
    const canvas = new DrawContext();
    const canvWidth = 12;
    const canvRadius = 80;
    const cbgColor = new Color(ringColor, 0.2);
    const cfgColor = new Color(ringColor);
    const centerColor = new Color(extraTextColor);
    const cfontColor = new Color("ffffff");
    canvas.size = new Size(canvSize, canvSize);
    canvas.opaque = false;
    canvas.respectScreenScale = true;

    const today = new Date();
    const thenDate = new Date(
      `${nextBirthday.year}`,
      `${nextBirthday.month}` - 1,
      `${nextBirthday.day}`
    );

    const passDate = new Date(preData.year, preData.month - 1, preData.day);

    const gap = today.getTime() - passDate.getTime();
    const gap2 = thenDate.getTime() - passDate.getTime();
    const deg = Math.floor((gap / gap2) * 100 * 3.6);

    let ctr = new Point(canvSize / 2, canvSize / 2);
    const bgx = ctr.x - canvRadius;
    const bgy = ctr.y - canvRadius;
    const bgd = 2 * canvRadius;
    const bgr = new Rect(bgx, bgy, bgd, bgd);

    canvas.setFillColor(cfgColor);
    canvas.setStrokeColor(cbgColor);
    canvas.setLineWidth(canvWidth);
    canvas.strokeEllipse(bgr);

    for (let t = 0; t < deg; t++) {
      const rect_x =
        ctr.x + canvRadius * Math.sin((t * Math.PI) / 180) - canvWidth / 2;
      const rect_y =
        ctr.y - canvRadius * Math.cos((t * Math.PI) / 180) - canvWidth / 2;
      const rect_r = new Rect(rect_x, rect_y, canvWidth, canvWidth);
      canvas.fillEllipse(rect_r);
    }

    const ringBG = new Rect(
      bgx + canvWidth / 2 + 8,
      bgy + canvWidth / 2 + 8,
      canvRadius * 2 - canvWidth - 16,
      canvRadius * 2 - canvWidth - 16
    );
    canvas.setFillColor(centerColor);
    canvas.setLineWidth(0);
    canvas.fillEllipse(ringBG);

    const canvTextRect = new Rect(0, 70 - canvTextSize / 2, canvSize, 80);
    canvas.setTextAlignedCenter();
    canvas.setTextColor(cfontColor);
    canvas.setFont(Font.mediumRoundedSystemFont(canvTextSize));
    canvas.setFont(this.provideFont("ultralight", 68));
    canvas.drawTextInRect(`${text}`, canvTextRect);

    return canvas.getImage();
  };

  renderMedium = (widget) => {
    const {
      this_year_lunar_solar,
      lunar_date,
      animalEmoji,
      meetDay,
      data: { tmpBirth, ageYear, ageMonth, age, dayIcon },
    } = this.contentText;

    const phoneSize = Device.screenSize();
    const radio = phoneSize.width / phoneSize.height;
    const containerStack = widget.addStack();
    containerStack.layoutHorizontally();

    const leftStack = containerStack.addStack();
    leftStack.size = new Size(radio * widthMode, radio * heightMode);
    let avatarImg = SFSymbol.named(`photo`).image;
    if (this.FILE_MGR.fileExists(this.LEFT_IMG_KEY)) {
      avatarImg = Image.fromFile(this.LEFT_IMG_KEY);
    }
    leftStack.backgroundImage = avatarImg;
    containerStack.addSpacer();
    const rightStack = containerStack.addStack();
    rightStack.setPadding(0, 0, 0, 10);
    rightStack.layoutVertically();
    rightStack.centerAlignContent();

    rightStack.addSpacer();

    const userStack = rightStack.addStack();
    userStack.layoutHorizontally();
    userStack.centerAlignContent();

    const nameStack = userStack.addStack();
    nameStack.layoutVertically();

    const userWidgetText = nameStack.addText(this.defaultData.username);
    userWidgetText.textColor = this.widgetColor;
    userWidgetText.font = this.provideFont("italic", mainTextSize + 10);
    userWidgetText.shadowColor = new Color(this.defaultData.nicknameShadow);
    userWidgetText.shadowOffset = new Point(3, 3);
    userWidgetText.shadowRadius = 3;

    nameStack.addSpacer(5);
    this.provideText(`相遇${meetDay}天`, nameStack, {
      font: "Party Let",
      size: mainTextSize,
      opacity: 0.8,
    });

    userStack.addSpacer();

    userStack.addImage(this.animalImg(animalEmoji));

    rightStack.addSpacer(20);
    if (tmpBirth.year > 0 && tmpBirth.month > 0 && tmpBirth.day > 0) {
      this.rowCell(rightStack, {
        icon: "hourglass",
        color: "#1ab6f8",
        title: "年龄",
        text: `${ageYear + ageMonth} ${tmpBirth.day} 天`,
      });
    } else {
      this.rowCell(rightStack, {
        icon: "hourglass",
        color: "#1ab6f8",
        title: "年龄",
        text: age,
      });
    }
    rightStack.addSpacer();

    this.rowCell(rightStack, {
      icon: "calendar",
      color: "#30d15b",
      title: "农历",
      text: `${lunar_date}`,
    });

    rightStack.addSpacer();

    this.rowCell(rightStack, {
      icon: "app.gift.fill",
      color: "#fc6d6d",
      title: "生日",
      text: `${this_year_lunar_solar}`,
    });

    rightStack.addSpacer();

    return widget;
  };

  renderSmall = (widget) => {
    const {
      this_year_lunar_solar,
      lunar_date,
      meetDay,
      data: { tmpBirth, ageYear, ageMonth, age, dayIcon },
    } = this.contentText;

    const containerStack = widget.addStack();
    containerStack.layoutVertically();

    containerStack.addSpacer();

    const topStack = containerStack.addStack();
    topStack.layoutHorizontally();
    topStack.centerAlignContent();

    const avatarStack = topStack.addStack();
    let avatarImg = SFSymbol.named(`photo`).image;
    if (this.FILE_MGR.fileExists(this.LEFT_IMG_KEY)) {
      avatarImg = Image.fromFile(this.LEFT_IMG_KEY);
    }

    avatarStack.backgroundImage = avatarImg;
    avatarStack.size = new Size(42, 42);
    avatarStack.cornerRadius = avatarStack.size.width / 2;
    avatarStack.borderColor = Color.green();
    avatarStack.borderWidth = 1;

    topStack.addSpacer(20);

    const nameStack = topStack.addStack();
    nameStack.addSpacer();
    nameStack.layoutVertically();
    nameStack.centerAlignContent();

    const userWidgetText = nameStack.addText(this.defaultData.username);
    userWidgetText.textColor = this.widgetColor;
    userWidgetText.font = this.provideFont("italic", 16);
    userWidgetText.shadowColor = new Color(this.defaultData.nicknameShadow);
    userWidgetText.shadowOffset = new Point(3, 3);
    userWidgetText.shadowRadius = 3;

    nameStack.addSpacer(5);
    this.provideText(`相遇${meetDay}天`, nameStack, {
      font: "Party Let",
      size: 12,
      opacity: 0.8,
    });

    containerStack.addSpacer();

    if (tmpBirth.year > 0 && tmpBirth.month > 0 && tmpBirth.day > 0) {
      this.rowCell(containerStack, {
        icon: "hourglass",
        color: "#1ab6f8",
        title: "年龄",
        text: `${ageYear + ageMonth} ${tmpBirth.day} 天`,
      });
    } else {
      this.rowCell(containerStack, {
        icon: "hourglass",
        color: "#1ab6f8",
        title: "年龄",
        text: age,
      });
    }
    containerStack.addSpacer();

    this.rowCell(containerStack, {
      icon: "calendar",
      color: "#30d15b",
      title: "农历",
      text: `${lunar_date}`,
    });

    containerStack.addSpacer();

    this.rowCell(containerStack, {
      icon: "app.gift.fill",
      color: "#fc6d6d",
      title: "生日",
      text: `${this_year_lunar_solar}`,
    });

    containerStack.addSpacer();

    return widget;
  };

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === "medium") {
      widget.setPadding(0, 0, 0, 0);
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === "large") {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }
}

// @组件代码结束
await Runing(Widget); //远程开发环境
