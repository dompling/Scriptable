// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: calendar-alt;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');
const {Calendar} = require('./Calendar');
const $calendar = new Calendar();

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '毒汤日历';
    this.en = 'PoisonCalendar';
    this.Run();
  }

  cookie = '';
  date = new Date();
  format = new DateFormatter();

  userInfo = {};
  dataSource = [];
  baseUrl = 'http://www.dutangapp.cn';

  init = async () => {
    try {
      await this.getUserInfo();
      await this.getDaysInfo();
    } catch (e) {
      console.log(e);
    }
  };

  getUserInfo = async () => {
    try {
      const url = `${this.baseUrl}/u/wx_login?code=&os=iOS&unid=${this.cookie}&version=3.5.2`;
      const response = await this.$request.get(url);
      if (response.code === 0) {
        console.log('✅用户信息获取成功');
        const {data} = response;
        this.userInfo = data;
      } else {
        console.log('❌用户信息获取失败');
      }
    } catch (e) {
      console.log('❌用户信息获取失败' + e);
    }
  };

  getDaysInfo = async () => {
    try {
      this.format.dateFormat = 'YYYY-MM-dd';
      const today = this.format.string(this.date);
      console.log(today);
      const url = `${this.baseUrl}/u/v2/days_info?days=${today}`;
      const response = await this.$request.get(url);
      if (response.code === 0) {
        console.log(`✅今日${this.name}获取成功`);
        const {data} = response;
        this.dataSource = data[today].toxicList;
      } else {
        console.log(`❌今日${this.name}获取成功`);
      }
    } catch (e) {
      console.log(`❌今日${this.name}获取成功` + e);
    }
  };

  setAvatar = async (stack) => {
    stack.size = new Size(50, 50);
    stack.cornerRadius = 5;
    const imgLogo = await this.$request.get(this.userInfo.avatar, 'IMG');
    const imgLogoItem = stack.addImage(imgLogo);
    imgLogoItem.imageSize = new Size(50, 50);
    return stack;
  };

  setTitleStack = (stack) => {
    const textFormatNumber = this.textFormat.title;
    textFormatNumber.color = this.backGroundColor;
    const title = this.userInfo.nick;
    textFormatNumber.size =
        title.length > 20 || this.widgetFamily === 'small' ? 16 : 20;
    const titleItem = this.provideText(title, stack, textFormatNumber);
    titleItem.lineLimit = 1;
  };

  setPathStack = (stack) => {
    const textFormatNumber = this.textFormat.defaultText;
    textFormatNumber.color = new Color('#2481cc');
    textFormatNumber.size = 12;
    this.format.dateFormat = 'HH:mm';
    let simpleText = '更新：' + this.format.string(this.date);
    this.format.dateFormat = 'YYYY-MM-dd';
    const titleItem = this.provideText(
        simpleText,
        stack,
        textFormatNumber,
    );
    titleItem.lineLimit = 1;
  };

  setFooterCell = async (stack) => {
    const dayInfos = this.getRandomArrayElements(this.dataSource || [], 1);
    const info = dayInfos[0] || {};
    const title = this.textFormat.title;
    title.color = this.backGroundColor;
    title.size = 12;
    const stackContent = stack.addStack();
    stackContent.centerAlignContent();
    stackContent.layoutVertically();
    const stackTop = stackContent.addStack();
    this.provideText(info.data, stackTop, title);
    stackContent.addSpacer();
    const stackBottom = stackContent.addStack();
    stackBottom.addSpacer();
    const stackDesc = stackBottom.addStack();

    const desc = this.textFormat.title;
    desc.color = this.backGroundColor;
    desc.size = 10;
    const textDesc = this.provideText(`浏览：${info.view}`, stackDesc, desc);
    textDesc.textOpacity = 0.7;
  };

  setCalendar(stack) {
    const today = this.format.string(this.date);
    const todays = today.split('-');
    const response = $calendar.solar2lunar(todays[0], todays[1], todays[2]);
    const stackCalendar = stack.addStack();
    stackCalendar.centerAlignContent();
    stackCalendar.cornerRadius = 4;
    stackCalendar.backgroundColor = this.backGroundColor;
    const title = this.textFormat.title;
    title.color = this.widgetColor;
    title.size = 24;
    this.provideText(todays[2], stackCalendar, title);
    const stackYear = stackCalendar.addStack();
    stackYear.layoutVertically();

    const text = this.textFormat.defaultText;
    text.color = this.widgetColor;
    text.size = 8;
    stackYear.addSpacer();
    const animal = $calendar.getAnimalZodiacToEmoji(response.Animal);
    this.provideText(response.Animal + animal, stackYear, text);
    stackYear.addSpacer(2);
    this.provideText(response.IMonthCn, stackYear, text);
    stackYear.addSpacer(2);
    this.provideText(response.IDayCn, stackYear, text);
    stackYear.addSpacer();
  }

  renderSmall = async (w) => {
    return w;
  };

  renderMedium = async (w) => {
    const stackBody = w.addStack();
    stackBody.layoutVertically();
    const stackHeader = stackBody.addStack();
    stackHeader.setPadding(5, 10, 5, 10);
    stackHeader.cornerRadius = 10;
    stackHeader.backgroundColor = this.widgetColor;

    stackHeader.centerAlignContent();
    const stackLeft = stackHeader.addStack();
    await this.setAvatar(stackLeft);
    stackHeader.addSpacer(20);

    const stackRight = stackHeader.addStack();
    stackRight.layoutVertically();
    this.setTitleStack(stackRight);
    stackRight.addSpacer(5);
    this.setPathStack(stackRight);
    stackHeader.addSpacer();

    const stackDay = stackHeader.addStack();
    this.setCalendar(stackDay);

    stackBody.addSpacer();

    const stackFooter = stackBody.addStack();
    stackFooter.setPadding(10, 0, 10, 0);
    stackFooter.cornerRadius = 10;
    stackFooter.backgroundColor = this.widgetColor;
    stackFooter.addSpacer();
    await this.setFooterCell(stackFooter);
    stackFooter.addSpacer();
    return w;
  };

  renderLarge = async (w) => {
    return w;
  };

  Run() {
    if (config.runsInApp) {
      const widgetInitConfig = {
        cookie: '@DJT.unid',
      };
      this.registerAction('账号设置', async () => {
        await this.setAlertInput(
            `${this.name}账号`, '读取 BoxJS 缓存信息', widgetInitConfig);
      });
      this.registerAction('代理缓存', async () => {
        await this.setCacheBoxJSData(widgetInitConfig);
      });
      this.registerAction('基础设置', this.setWidgetConfig);
    }
    this.cookie = this.settings.cookie || this.cookie;
  }

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
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
// await Runing(Widget, "", true); // 正式环境
await Runing(Widget, args.widgetParameter, false); //远程开发环境
