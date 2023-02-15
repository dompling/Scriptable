// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: car;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');
const { Calendar } = require('./Calendar');
const $ = new Calendar();
const mainTextSize = 13; // 倒数、农历、生日文字大小
const now = new Date();
const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

const widthMode = Device.model() === 'iPad' ? 110 : 400; // 中号组件图片尺寸

const heightMode = Device.model() === 'iPad' ? 110 : 380; // 中号组件图片尺寸

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg, {
      lightBgColor: '#2581f2',
      darkBgColor: '#2581f2',
      darkColor: '#fff',
      lightColor: '#fff',
    });
    this.en = 'birthday';
    this.name = '破壳日';
    this.LEFT_IMG_KEY = `${this.cacheImage}/avatar`;

    if (config.runsInApp) {
      this.registerAction({
        icon: { name: 'person.badge.plus', color: '#52c41a' },
        type: 'img',
        title: '头像',
        name: 'avatar',
        val: this.cacheImage,
      });

      this.registerAction({
        icon: {
          name: 'rectangle.and.pencil.and.ellipsis',
          color: '#f5222d',
        },
        type: 'input',
        title: '昵称',
        placeholder: '用户昵称',
        name: 'nickname',
      });

      this.registerAction({
        icon: {
          name: 'rectangle',
          color: '#a68585',
        },
        type: 'color',
        title: '昵称阴影',
        placeholder: '昵称阴影',
        name: 'nicknameShadow',
      });

      this.registerAction({
        icon: {
          name: 'bubble.left',
          color: '#faf61c',
        },
        type: 'input',
        title: '寄语',
        name: 'bless',
      });

      this.registerAction({
        icon: {
          name: '25.square.fill',
          color: '#fa541c',
        },
        type: 'switch',
        title: '农历',
        name: 'nongli',
      });

      this.registerAction({
        icon: {
          name: 'calendar',
          color: '#fa8c16',
        },
        type: 'date',
        title: '破壳日',
        name: 'birthday',
      });

      this.registerAction({
        icon: {
          name: 'calendar.badge.clock',
          color: '#8016fa',
        },
        type: 'date',
        title: '相识',
        name: 'eday',
      });

      this.registerAction('基础设置', this.setWidgetConfig);
    }
  }

  getAge = (beginStr) => {
    let tmpBirth = {};
    tmpBirth.year = 0;
    tmpBirth.month = 0;
    tmpBirth.day = 0;

    if (beginStr == null || beginStr == '') {
      return;
    }
    let startDate = new Date(beginStr.replace(/-/g, '/'));
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

  getEdayNumber = (date) => {
    var initDay = date.split('-');
    var obj = {
      cYear: parseInt(initDay[0]),
      cMonth: parseInt(initDay[1]),
      cDay: parseInt(initDay[2]),
    };
    return Math.abs(this.$.daysBetween(obj));
  };

  init = async () => {
    await this.FILE_MGR.fileExists(this.LEFT_IMG_KEY);
    this.defaultData = {
      username: this.settings.nickname || '', // 姓名
      time: this.settings.birthday || today, // 生日日期
      nongli: this.settings.nongli === 'true' || '', // 农历生日
      eday: this.settings.eday || today, //相识
      bless: this.settings.bless || '',
      nicknameShadow: this.settings.nicknameShadow || '#e8e8e8',
      isLeapMonth: false, //如果是农历闰月第四个参数赋值true即可
    };

    const { time, nongli, isLeapMonth, eday } = this.defaultData;
    const _data = time.split('-');
    const opt = {
      year: parseInt(_data[0]),
      month: parseInt(_data[1]),
      day: parseInt(_data[2]),
      nongli,
      isLeapMonth,
    };

    const response = {};

    var solarData;
    if (nongli === 'true') {
      solarData = this.$.lunar2solar(opt.year, opt.month, opt.day, isLeapMonth);
    } else {
      solarData = this.$.solar2lunar(opt.year, opt.month, opt.day);
    }
    response.gregorian = solarData;
    response.animal = `${solarData.Animal}`;
    response.astro = `${this.$.getAstroToEmoji(solarData.astro)}-${
      solarData.astro
    }`;
    if (this.$.verifyTime(eday)) {
      response.meetDay = this.getEdayNumber(eday);
    }

    response.birthdayText = this.$.birthday(opt);
    response.nextBirthday = response.birthdayText[0];

    this.contentText = { ...response, data: {} };
    console.log(this.contentText);
    const { gregorian, nextBirthday } = this.contentText;
    const birth = `${nextBirthday.cYear}-${nextBirthday.cMonth}-${nextBirthday.cDay}`;
    const { IMonthCn, IDayCn } = gregorian;
    const tmpBirth = this.getAge(this.defaultData.eday);
    let ageYear = tmpBirth.year > 0 ? `${tmpBirth.year}岁` : '';
    let ageMonth = tmpBirth.month > 0 ? `${tmpBirth.month}月` : '';
    let ageDay = tmpBirth.day > 0 ? `${tmpBirth.day}天` : '1天';
    const age = ageYear + ageMonth + ageDay;
    const dayIcon = tmpBirth.day + '.circle.fill';
    this.contentText.data = {
      birth,
      IMonthCn,
      IDayCn,
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
    const subTitle = subWidget.addText(title || '');
    subTitle.font = Font.systemFont(mainTextSize);
    subTitle.textColor = this.widgetColor;
    subWidget.addSpacer();
    const subValue = subWidget.addText(text || '');
    subValue.font = Font.systemFont(mainTextSize);
    subValue.textColor = this.widgetColor;
    subValue.lineLimit = 1;

    if (dayImage) {
      subWidget.addSpacer(2);
      let dayIcon = subWidget.addImage(dayImage.image);
      dayIcon.imageSize = new Size(mainTextSize + 1, mainTextSize + 1);
      dayIcon.tintColor = new Color('#1ab6f8');
    }
  };

  animalImg = (text) => {
    const { time, nongli, isLeapMonth } = this.defaultData;
    const _data = time.split('-');
    const opt = {
      year: parseInt(_data[0]),
      month: parseInt(_data[1]),
      day: parseInt(_data[2]),
      nongli: nongli === 'true',
      isLeapMonth,
    };

    const { nextBirthday } = this.contentText;

    const extraTextColor = 'fc8ac3'; //环形进度条中心背景颜色及名字、meetDay颜色
    const ringColor = 'fc5ead'; //环形进度条颜色
    const canvSize = 172;
    const canvTextSize = 45;
    const canvas = new DrawContext();
    const canvWidth = 12;
    const canvRadius = 80;
    const cbgColor = new Color(ringColor, 0.2);
    const cfgColor = new Color(ringColor);
    const centerColor = new Color(extraTextColor);
    const cfontColor = new Color('ffffff');
    canvas.size = new Size(canvSize, canvSize);
    canvas.opaque = false;
    canvas.respectScreenScale = true;

    var preData;
    if (nongli) {
      preData = this.$.lunar2solar(
        `${nextBirthday.lYear}` - 1,
        opt.month,
        opt.day,
        isLeapMonth
      );
    } else {
      preData = this.$.solar2lunar(
        `${nextBirthday.cYear}` - 1,
        opt.month,
        opt.day
      );
    }
    const today = new Date();
    const thenDate = new Date(
      `${nextBirthday.cYear}`,
      `${nextBirthday.cMonth}` - 1,
      `${nextBirthday.cDay}`
    );
    const passDate = new Date(preData.cYear, preData.cMonth - 1, preData.cDay);

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

    const canvTextRect = new Rect(
      0,
      80 - canvTextSize / 2,
      canvSize,
      canvTextSize
    );
    canvas.setTextAlignedCenter();
    canvas.setTextColor(cfontColor);
    canvas.setFont(Font.mediumRoundedSystemFont(canvTextSize));
    canvas.drawTextInRect(`${text}`, canvTextRect);

    return canvas.getImage();
  };

  renderMedium = (widget) => {
    const {
      animal,
      data: {
        birth,
        IMonthCn,
        IDayCn,
        tmpBirth,
        ageYear,
        ageMonth,
        ageDay,
        age,
        dayIcon,
      },
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

    const userWidgetText = userStack.addText(this.defaultData.username);
    userWidgetText.textColor = this.widgetColor;
    userWidgetText.font = this.provideFont('italic', 22);
    userWidgetText.shadowColor = new Color(this.defaultData.nicknameShadow);
    userWidgetText.shadowOffset = new Point(3, 3);
    userWidgetText.shadowRadius = 3;

    userStack.addSpacer();

    userStack.addImage(this.animalImg(animal));
    // animalWidgetText.textColor = this.widgetColor;
    // animalWidgetText.font = this.provideFont('italic', 14);
    // animalWidgetText.textOpacity = 0.6;

    rightStack.addSpacer(20);
    if (tmpBirth.year > 0 && tmpBirth.month > 0 && tmpBirth.day > 0) {
      this.rowCell(rightStack, {
        icon: 'hourglass',
        color: '#1ab6f8',
        title: '年龄',
        text: ageYear + ageMonth,
        dayImage: dayIcon,
      });
    } else {
      this.rowCell(rightStack, {
        icon: 'hourglass',
        color: '#1ab6f8',
        title: '年龄',
        text: age,
      });
    }
    rightStack.addSpacer();

    this.rowCell(rightStack, {
      icon: 'calendar',
      color: '#30d15b',
      title: '农历',
      text: `${IMonthCn}${IDayCn}`,
    });

    rightStack.addSpacer();

    this.rowCell(rightStack, {
      icon: 'app.gift.fill',
      color: '#fc6d6d',
      title: '生日',
      text: birth,
    });

    rightStack.addSpacer();

    return widget;
  };

  renderSmall = (widget) => {
    const {
      data: {
        birth,
        IMonthCn,
        IDayCn,
        tmpBirth,
        ageYear,
        ageMonth,
        age,
        dayIcon,
      },
    } = this.contentText;

    const containerStack = widget.addStack();

    containerStack.addSpacer();

    containerStack.layoutVertically();
    const avatarStack = containerStack.addStack();
    avatarStack.layoutHorizontally();
    avatarStack.centerAlignContent();

    let avatarImg = SFSymbol.named(`photo`).image;
    if (this.FILE_MGR.fileExists(this.LEFT_IMG_KEY)) {
      avatarImg = Image.fromFile(this.LEFT_IMG_KEY);
    }

    avatarStack.backgroundImage = avatarImg;
    avatarStack.size = new Size(42, 42);
    avatarStack.cornerRadius = avatarStack.size.width / 2;
    avatarStack.borderColor = Color.green();
    avatarStack.borderWidth = 1;

    avatarStack.addSpacer();

    const userWidgetText = avatarStack.addText(this.defaultData.username);
    userWidgetText.textColor = this.widgetColor;
    userWidgetText.font = this.provideFont('italic', 22);
    userWidgetText.shadowColor = new Color(this.defaultData.nicknameShadow);
    userWidgetText.shadowOffset = new Point(3, 3);
    userWidgetText.shadowRadius = 3;

    avatarStack.addSpacer();

    containerStack.addSpacer();

    if (tmpBirth.year > 0 && tmpBirth.month > 0 && tmpBirth.day > 0) {
      this.rowCell(containerStack, {
        icon: 'hourglass',
        color: '#1ab6f8',
        title: '年龄',
        text: ageYear + ageMonth,
        dayImage: dayIcon,
      });
    } else {
      this.rowCell(containerStack, {
        icon: 'hourglass',
        color: '#1ab6f8',
        title: '年龄',
        text: age,
      });
    }
    containerStack.addSpacer();

    this.rowCell(containerStack, {
      icon: 'calendar',
      color: '#30d15b',
      title: '农历',
      text: `${IMonthCn}${IDayCn}`,
    });

    containerStack.addSpacer();

    this.rowCell(containerStack, {
      icon: 'app.gift.fill',
      color: '#fc6d6d',
      title: '生日',
      text: birth,
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
    if (this.widgetFamily === 'medium') {
      widget.setPadding(0, 0, 0, 0);
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }
}

// @组件代码结束
await Runing(Widget, '', false, { $ }); //远程开发环境
