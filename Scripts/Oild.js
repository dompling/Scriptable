// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: car;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

const enumConfig = {
  89: '汽油',
  92: '汽油',
  95: '汽油',
  98: '汽油',
  0: '柴油',
};

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    config.runsInApp &&
    this.registerAction(
      '油价设置',
      () => {
        return this.setAlertInput('油价设置', '设置类型,多个英文逗号分割', {
          oilNumber: '92,95,89,0',
        });
      },
      {name: 'paperplane', color: '#722ed1'},
    );
    this.en = 'oilWidget';
    this.name = '油价';
    config.runsInApp && this.registerAction('基础设置', this.setWidgetConfig);
    this.cacheName = this.md5(`dataSource_${this.en}`);
    this.oilNumber = `${this.settings.oilNumber || '92'}`.split(',');
  }

  dataSource = {
    DIM_ID: '',
    DIM_DATE: '',
    CITYNAME: '',
    V0: 0,
    V95: 0,
    V92: 0,
    V89: 0,
    ZDE0: 0,
    ZDE92: 0,
    ZDE95: 0,
    ZDE89: 0,
    QE0: 0,
    QE92: 0,
    QE95: 0,
    QE89: 0,
  };

  init = async () => {
    if (this.settings.dataSource) {
      this.dataSource = this.settings.dataSource;
    } else {
      await this.cacheData();
    }
    this.cacheData();
  };

  cacheData = async () => {
    try {
      await this.getOilPrice();
    } catch (e) {
      console.log(e);
    }
  };

  getOilPrice = async () => {
    const location = await Location.current();
    const locationText = await Location.reverseGeocode(
      location.latitude,
      location.longitude,
    );
    const {administrativeArea = ''} = locationText[0] || {};
    const filter = `(CITYNAME="${administrativeArea.replace('省', '')}")`;
    const time = Date.now();
    const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?reportName=RPTA_WEB_YJ_JH&columns=ALL&filter=${encodeURIComponent(
      filter,
    )}&sortColumns=DIM_DATE&sortTypes=-1&pageNumber=1&pageSize=1&source=WEB&_=${time}`;

    const options = {url};
    const response = await this.$request.post(options);
    console.log(response);
    if (response.result) {
      this.dataSource = response.result.data[0];
      this.settings.dataSource = this.dataSource;
      this.saveSettings(false);
    }
  };

  renderImage = async (uri) => {
    return this.$request.get(uri, 'IMG');
  };

  notSupport(w) {
    const stack = w.addStack();
    stack.addText('暂不支持');
    return w;
  }

  renderSmall = async (w) => {
    w.addSpacer();
    const topStack = w.addStack();
    topStack.centerAlignContent();

    const oilPrice = this.dataSource[`V${this.oilNumber[0]}`];
    const timer = (this.dataSource.DIM_DATE.split(' ')[0] || '').split('-');
    const oilNumText = topStack.addText(`${oilPrice}`);
    oilNumText.textColor = this.widgetColor;
    oilNumText.font = Font.boldSystemFont(42);

    const oilStatus = this.dataSource[`ZDE${this.oilNumber[0]}`] > 0;
    const oilZdeImage = SFSymbol.named(
      oilStatus ? 'arrow.up' : 'arrow.up',
    ).image;
    topStack.addSpacer(5);
    const topRStack = topStack.addStack();
    topRStack.setPadding(4, 0, 0, 0);

    topRStack.layoutVertically();
    topRStack.centerAlignContent();
    const zdeStack = topRStack.addStack();
    zdeStack.setPadding(2, 6, 0, 0);
    const oilZdeWidgetImg = zdeStack.addImage(oilZdeImage);
    oilZdeWidgetImg.tintColor = new Color(oilStatus ? '#f5222d' : '#a0d911');
    oilZdeWidgetImg.imageSize = new Size(16, 16);

    const timerText = topRStack.addText(`${timer[2]}/${timer[1]}`);
    timerText.textColor = this.widgetColor;
    timerText.font = Font.systemFont(12);

    w.addSpacer();

    const bottomStack = w.addStack();
    bottomStack.addSpacer();
    const rightText = bottomStack.addText(
      `${this.oilNumber[0]}#${enumConfig[this.oilNumber[0]]}`);
    oilNumText.textColor = this.widgetColor;
    rightText.font = Font.boldSystemFont(18);
    rightText.textOpacity = 0.3;
    rightText.rightAlignText();
    bottomStack.addSpacer(5);
    return w;
  };

  rowData = (w, oilNumber) => {
    const colStack = w.addStack();

    colStack.backgroundColor = Color.dynamic(
      new Color('#d9d9d9'),
      new Color('#434343'),
    );

    colStack.cornerRadius = 10;
    colStack.setPadding(10, 10, 10, 10);
    colStack.centerAlignContent();

    const oilNumText = colStack.addText(`${oilNumber}`);
    oilNumText.textColor = this.widgetColor;
    oilNumText.font = Font.boldSystemFont(20);

    colStack.addSpacer(5);

    const oilTypeText = colStack.addText(`#${enumConfig[oilNumber]}`);
    oilTypeText.textColor = this.widgetColor;
    oilTypeText.font = Font.boldSystemFont(12);

    colStack.addSpacer();

    const zdeText = colStack.addText('涨跌');
    zdeText.textColor = this.widgetColor;
    zdeText.font = Font.boldSystemFont(12);

    colStack.addSpacer(5);

    const zdeValue = this.dataSource[`ZDE${oilNumber}`];
    const oilStatus = zdeValue > 0;
    const zdeColor = new Color(oilStatus ? '#f5222d' : '#a0d911');
    const zdeValueText = colStack.addText(`${zdeValue}`);
    zdeValueText.textColor = zdeColor;
    zdeValueText.font = Font.boldSystemFont(12);

    colStack.addSpacer(5);

    const oilZdeImage = SFSymbol.named(
      oilStatus ? 'arrow.up' : 'arrow.up',
    ).image;
    const oilZdeWidgetImg = colStack.addImage(oilZdeImage);
    oilZdeWidgetImg.tintColor = zdeColor;
    oilZdeWidgetImg.imageSize = new Size(12, 12);

    colStack.addSpacer();

    const dollarImage = SFSymbol.named(`dollarsign.circle.fill`).image;
    const dollarWidgetImage = colStack.addImage(dollarImage);
    dollarWidgetImage.tintColor = this.widgetColor;
    dollarWidgetImage.imageSize = new Size(18, 18);

    colStack.addSpacer(5);

    const oilPrice = this.dataSource[`V${oilNumber}`];
    const priceText = colStack.addText(`${oilPrice}`);
    priceText.textColor = this.widgetColor;
    priceText.font = Font.boldSystemFont(20);
  };

  renderLarge = async (w) => {
    return this.notSupport(w);
  };

  renderMedium = async (w) => {
    const oilNumbers = this.getRandomArrayElements(this.oilNumber, 3);
    w.addSpacer();
    oilNumbers.map((oilNumber) => {
      this.rowData(w, oilNumber);
      w.addSpacer();
    });
    return w;
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
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }
}

// @组件代码结束
await Runing(Widget, '', false); //远程开发环境
