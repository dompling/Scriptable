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

const squareColor = '#8165AC';
const processColor = [`#7517F8`, `#E323FF`];
const processBarColor = [`#4da1ff`, `#4dffdf`];
const processBarBgColor = '#5A5A89';

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
      this.dataSource = this.settings.dataSource[0];
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
    )}&sortColumns=DIM_DATE&sortTypes=-1&pageNumber=1&pageSize=6&source=WEB&_=${time}`;

    const options = {url};
    const response = await this.$request.post(options);
    console.log(response);
    if (response.result) {
      this.dataSource = response.result.data[0];
      this.settings.dataSource = response.result.data;
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
    const headerStack = w.addStack();
    const dollarImage = SFSymbol.named(`yensign.circle`).image;
    headerStack.centerAlignContent();
    const dollarWidgetImg = headerStack.addImage(dollarImage);
    dollarWidgetImg.tintColor = new Color('#f5222d');
    dollarWidgetImg.imageSize = new Size(24, 24);

    headerStack.addSpacer();

    w.addSpacer();
    const topStack = w.addStack();
    const topLStack = topStack.addStack();
    topLStack.layoutVertically();
    topLStack.addSpacer();
    topLStack.bottomAlignContent();
    const oilPrice = (this.dataSource[`V${this.oilNumber[0]}`] || '').toFixed(
      2);
    const timer = (this.dataSource.DIM_DATE.split(' ')[0] || '').split('-');
    const oilNumText = topLStack.addText(`${oilPrice}`);
    oilNumText.textColor = this.widgetColor;
    oilNumText.minimumScaleFactor = 0.6;
    oilNumText.font = Font.boldSystemFont(38);
    topLStack.addSpacer();

    const oilStatus = this.dataSource[`ZDE${this.oilNumber[0]}`] > 0;
    const oilZdeImage = SFSymbol.named(
      oilStatus ? 'arrow.up' : 'arrow.up',
    ).image;
    topStack.addSpacer();
    const topRStack = topStack.addStack();
    topRStack.addSpacer();
    topRStack.layoutVertically();
    topRStack.bottomAlignContent();
    const zdeStack = topRStack.addStack();
    zdeStack.setPadding(2, 6, 0, 0);
    const oilZdeWidgetImg = zdeStack.addImage(oilZdeImage);
    oilZdeWidgetImg.tintColor = new Color(oilStatus ? '#f5222d' : '#a0d911');
    oilZdeWidgetImg.imageSize = new Size(16, 16);

    const timerText = topRStack.addText(`${timer[2]}/${timer[1]}`);
    timerText.textColor = this.widgetColor;
    timerText.font = Font.systemFont(12);
    topRStack.addSpacer();

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

    const oilPrice = (this.dataSource[`V${oilNumber}`] || '').toFixed(2);
    const oilZde = (this.dataSource[`ZDE${oilNumber}`] || '').toFixed(2);
    const oilType = enumConfig[oilNumber] || '';

    const colStack = w.addStack();

    const oilNumberStack = colStack.addStack();
    const colSize = new Size(40, 40);
    oilNumberStack.size = colSize;
    oilNumberStack.cornerRadius = 8;
    oilNumberStack.borderWidth = 4;
    oilNumberStack.borderColor = new Color(squareColor);
    oilNumberStack.centerAlignContent();
    this.provideText(
      `${oilNumber}`, oilNumberStack,
      {font: 'bold', size: 26, color: new Color(squareColor)},
    );

    colStack.addSpacer(7);

    const oilInfoStack = colStack.addStack();
    oilInfoStack.size = new Size(65, colSize.height);
    oilInfoStack.layoutVertically();
    oilInfoStack.addSpacer();
    this.provideText(
      `#${oilType}`, oilInfoStack,
      {font: 'light', size: 12, color: this.widgetColor, opacity: 0.5},
    );

    oilInfoStack.addSpacer(2);

    this.provideText(
      `${oilPrice}`, oilInfoStack,
      {font: 'medium', size: 18, color: this.widgetColor},
    );
    oilInfoStack.addSpacer();

    const processStack = colStack.addStack();
    processStack.centerAlignContent();
    const processVerWidth = 10;

    let maxCount = 0;
    const oilHistory = this.settings.dataSource.map(
      item => {
        const value = (item[`ZDE${oilNumber}`] /
          item[`QE${oilNumber}`]).toFixed(2) * 100;
        if (maxCount < value) maxCount = value;
        return value;
      });

    maxCount = maxCount * 1.5;

    oilHistory.forEach(item => {
      const processItemStack = processStack.addStack();
      processItemStack.size = new Size(processVerWidth, colSize.height);
      processItemStack.cornerRadius = processVerWidth / 2;
      processItemStack.backgroundColor = new Color(processBarBgColor);
      if (item > 0) processItemStack.addSpacer();
      processItemStack.layoutVertically();

      const itemBarStack = processItemStack.addStack();
      itemBarStack.cornerRadius = processItemStack.cornerRadius;
      itemBarStack.size = new Size(
        processVerWidth, colSize.height * (Math.abs(item) / maxCount));
      itemBarStack.backgroundGradient = this.gradient(processColor);
      if (item < 0) processItemStack.addSpacer();
      processStack.addSpacer();
    });

    colStack.addSpacer();

    const oilZdeStack = colStack.addStack();

    const oilZdeSize = new Size(80, 10);

    oilZdeStack.layoutVertically();
    oilZdeStack.size = new Size(oilZdeSize.width, colSize.height);
    oilZdeStack.centerAlignContent();

    const oilZdeValueStack = oilZdeStack.addStack();
    oilZdeValueStack.centerAlignContent();
    oilZdeValueStack.addSpacer();
    this.provideText(
      `${oilZde > 0 ? '+' : ''} ${oilZde}`, oilZdeValueStack,
      {font: 'light', size: 14, color: this.widgetColor},
    );

    const oilZdeImage = SFSymbol.named(
      oilZde > 0 ? 'arrow.up' : 'arrow.down',
    ).image;

    oilZdeValueStack.addSpacer(10);

    const oilZdeWidgetImg = oilZdeValueStack.addImage(oilZdeImage);
    oilZdeWidgetImg.tintColor = new Color(oilZde > 0 ? '#f5222d' : '#a0d911');
    oilZdeWidgetImg.imageSize = new Size(10, 10);

    oilZdeValueStack.addSpacer();

    oilZdeStack.addSpacer(5);

    const oilZdeValue = Math.abs(parseFloat(oilZde));
    const processBarBgStack = oilZdeStack.addStack();

    processBarBgStack.cornerRadius = 5;
    processBarBgStack.size = oilZdeSize;
    processBarBgStack.backgroundColor = new Color(processBarBgColor);

    if (oilZde < 0) processBarBgStack.addSpacer();

    const processBarStack = processBarBgStack.addStack();

    const linear = new LinearGradient();
    linear.colors = processBarColor.map(item => new Color(item));
    linear.locations = [0, 0.5];
    linear.startPoint = new Point(0, 0);
    linear.endPoint = new Point(1, 1);

    processBarStack.backgroundGradient = linear;
    processBarStack.cornerRadius = oilZdeSize.height / 2;
    processBarStack.size = new Size(
      parseInt(oilZdeSize.width * oilZdeValue), oilZdeSize.height);

    if (oilZde > 0) processBarBgStack.addSpacer();
  };

  renderLarge = async (w) => {
    return this.notSupport(w);
  };

  renderBorder = (stack) => {
    stack.borderWidth = 1;
  };

  gradient = (color, config = {locations: [0, 0.5]}) => {
    const linear = new LinearGradient();
    linear.colors = color.map(item => new Color(item));
    linear.locations = config.locations;
    return linear;
  };

  renderMedium = async (w) => {
    w.addSpacer();
    this.oilNumber.forEach((oilNumber, index) => {
      if (index > 2) return;
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
