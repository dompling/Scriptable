// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: dollar;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.en = ' btc';
    this.name = '比特币';

    if (config.runsInApp) {
      this.registerAction({
        icon: { name: 'centsign.circle', color: '#feda31' },
        type: 'input',
        title: '比特币种类',
        desc: '设置关注种类',
        placeholder: 'BTC,ETH,BNB',
        val: 'btcType',
      });
      this.registerAction('基础设置', this.setWidgetConfig);
    }
  }

  format = (str) => {
    return parseInt(str) >= 10 ? str : `0${str}`;
  };

  endpoint = 'https://api.coingecko.com/api/v3';
  nomicsEndpoint = 'https://api.nomics.com/v1';

  dataSource = [];

  init = async () => {
    if (this.settings.dataSource && !config.runsInApp) {
      this.dataSource = this.settings.dataSource;
    } else {
      await this.cacheData(this.settings.btcType);
    }
    this.cacheData(this.settings.btcType);
  };

  cacheData = async (params) => {
    try {
      const ids = await this.transforBtcType(params);
      let response = await this.$request.get(
        `${this.endpoint}/coins/markets?vs_currency=usd&ids=${ids}`,
        'STRING'
      );
      this.dataSource = [];
      response = JSON.parse(response);
      if (!response.length) response = await this.getAllJson();
      if (ids) {
        const idsData = ids.split(',');
        idsData.forEach((id) => {
          const it = response.find((item) => item.id === id);
          if (it && this.dataSource.length < 6) {
            this.dataSource.push({
              id: it.id,
              name: it.name,
              image: it.image,
              symbol: it.symbol.toUpperCase(),
              current_price: '' + it.current_price,
              high_24h: it.high_24h,
              low_24h: it.low_24h,
              price_change_percentage_24h: it.price_change_percentage_24h,
              last_updated: it.last_updated,
            });
          }
        });
      } else {
        response.forEach((it, index) => {
          if (index > 5) return;
          this.dataSource.push({
            id: it.id,
            name: it.name,
            image: it.image,
            symbol: it.symbol.toUpperCase(),
            current_price: '' + it.current_price,
            high_24h: it.high_24h,
            low_24h: it.low_24h,
            price_change_percentage_24h: it.price_change_percentage_24h,
            last_updated: it.last_updated,
          });
        });
      }

      this.settings.dataSource = this.dataSource;
      this.saveSettings(false);
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  transforBtcType = async (params) => {
    let btcType;
    if (params) btcType = params.split(',');

    const btcAll = await this.getAllJson();

    if (!btcType)
      return btcAll
        .filter((item, index) => index < 6)
        .map((item) => item.id)
        .join(',');

    return btcType
      .map((item) => {
        const result =
          btcAll.find((btc) => btc.symbol.toUpperCase() === item) || {};
        return result.id;
      })
      .filter((item) => !!item)
      .join(',');
  };

  getAllJson = async () => {
    const cachePath = this.FILE_MGR.joinPath(
      this.FILE_MGR.libraryDirectory(),
      `${Script.name()}/datas`
    );
    const filename = `${cachePath}/BTC.json`;
    if (!this.FILE_MGR.fileExists(cachePath))
      this.FILE_MGR.createDirectory(cachePath, true);

    if (this.FILE_MGR.fileExists(filename)) {
      const data = Data.fromFile(`${cachePath}/BTC.json`).toRawString();
      return JSON.parse(data);
    } else {
      const response = await this.$request.get(
        `${this.endpoint}/coins/markets?vs_currency=usd&ids=`
      );
      const data = Data.fromString(JSON.stringify(response));
      this.FILE_MGR.write(filename, data);
      return response;
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

  getSmallBg = async (url) => {
    const webview = new WebView();
    let js = `const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const { width, height } = img
        canvas.width = width
        canvas.height = height
        ctx.globalAlpha = 0.3
        ctx.drawImage(
          img,
          -width / 2 + 50,
          -height / 2 + 50,
          width,
          height
        )
        const uri = canvas.toDataURL()
        completion(uri);
      };
      img.src = 'data:image/png;base64,${Data.fromPNG(url).toBase64String()}'`;
    let image = await webview.evaluateJavaScript(js, true);
    image = image.replace(/^data\:image\/\w+;base64,/, '');
    return Image.fromData(Data.fromBase64String(image));
  };

  renderSmall = async (widget) => {
    const market = this.dataSource[0] || {};

    widget.url = `https://www.coingecko.com/en/coins/${market.id}`;

    const image = await this.renderImage(market.image);
    const backgroundImg = await this.getSmallBg(image);
    widget.backgroundColor = this.backGroundColor;
    widget.backgroundImage = backgroundImg;
    widget.setPadding(12, 12, 12, 12);
    const coin = widget.addText(market.symbol.toUpperCase());
    coin.font = Font.heavySystemFont(24);
    coin.textColor = this.widgetColor;

    coin.rightAlignText();
    const name = widget.addText(market.name);
    name.font = Font.systemFont(10);
    name.textColor = Color.gray();
    name.rightAlignText();
    widget.addSpacer();

    const trend = widget.addText(
      `${market.price_change_percentage_24h.toFixed(2)}%`
    );
    trend.font = Font.semiboldSystemFont(16);
    trend.textColor =
      market.price_change_percentage_24h >= 0 ? Color.green() : Color.red();

    trend.rightAlignText();
    const price = widget.addText(`$ ${market.current_price}`);
    price.font = Font.boldSystemFont(28);
    price.textColor = this.widgetColor;
    price.rightAlignText();
    price.lineLimit = 1;
    price.minimumScaleFactor = 0.1;
    const history = widget.addText(
      `H: ${market.high_24h}, L: ${market.low_24h}`
    );
    history.font = Font.systemFont(10);
    history.textColor = Color.gray();
    history.rightAlignText();
    history.lineLimit = 1;
    history.minimumScaleFactor = 0.1;
    return widget;
  };

  rowCell = async (rowStack, market) => {
    rowStack.url = `https://www.coingecko.com/zh/coins/${market.id}`;
    rowStack.layoutHorizontally();
    const image = await this.renderImage(market.image);
    const iconImage = rowStack.addImage(image);
    iconImage.imageSize = new Size(28, 28);
    iconImage.cornerRadius = 14;

    rowStack.addSpacer(10);

    const centerStack = rowStack.addStack();
    centerStack.layoutVertically();

    const topCenterStack = centerStack.addStack();
    topCenterStack.layoutHorizontally();

    const titleText = topCenterStack.addText(market.symbol);
    titleText.textColor = this.widgetColor;
    titleText.font = this.provideFont('semibold', 16);

    topCenterStack.addSpacer();

    const priceText = topCenterStack.addText(`$ ${market.current_price}`);
    priceText.textColor = this.widgetColor;
    priceText.font = this.provideFont('semibold', 15);
    priceText.rightAlignText();

    const bottomCenterStack = centerStack.addStack();
    bottomCenterStack.layoutHorizontally();

    const subText = bottomCenterStack.addText(market.name);
    subText.textColor = Color.gray();
    subText.font = this.provideFont('semibold', 10);

    bottomCenterStack.addSpacer();

    const historyText = bottomCenterStack.addText(
      `H: ${market.high_24h}, L: ${market.low_24h}`
    );
    historyText.textColor = Color.gray();
    historyText.font = this.provideFont('semibold', 10);
    historyText.rightAlignText();

    rowStack.addSpacer(8);

    const rateStack = rowStack.addStack();
    rateStack.size = new Size(72, 28);
    rateStack.centerAlignContent();
    rateStack.cornerRadius = 4;
    rateStack.backgroundColor =
      market.price_change_percentage_24h >= 0 ? Color.green() : Color.red();
    const rateText = rateStack.addText(
      (market.price_change_percentage_24h >= 0 ? '+' : '') +
        market.price_change_percentage_24h.toFixed(2) +
        '%'
    );
    rateText.textColor = new Color('#fff', 0.9);
    rateText.font = this.provideFont('semibold', 14);
    rateText.minimumScaleFactor = 0.01;
    rateText.lineLimit = 1;
  };

  renderLarge = async (widget) => {
    widget.setPadding(12, 12, 12, 12);
    const containerStack = widget.addStack();
    containerStack.layoutVertically();
    for (let index = 0; index < this.dataSource.length; index++) {
      const item = this.dataSource[index];
      const rowCellStack = containerStack.addStack();
      await this.rowCell(rowCellStack, item);
      if (index !== this.dataSource.length - 1) containerStack.addSpacer();
    }
    return widget;
  };

  renderMedium = async (widget) => {
    widget.setPadding(12, 12, 12, 12);
    const containerStack = widget.addStack();
    containerStack.layoutVertically();
    for (let index = 0; index < this.dataSource.length; index++) {
      if (index > 2) return;
      const item = this.dataSource[index];
      const rowCellStack = containerStack.addStack();
      await this.rowCell(rowCellStack, item);
      if (index !== 2) containerStack.addSpacer();
    }
    return widget;
  };

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    if (this.widgetFamily === 'small') await this.renderSmall(widget);
    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === 'medium') await this.renderMedium(widget);
    if (this.widgetFamily === 'large') await this.renderLarge(widget);
    return widget;
  }
}

// @组件代码结束
await Runing(Widget, '', false); //远程开发环境
