// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: car;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    if (config.runsInApp) {
      this.registerAction({
        icon: { name: 'paperplane', color: '#722ed1' },
        type: 'input',
        title: '油价设置',
        desc: '89|92|95|0',
        val: 'oilNumber',
      });

      this.registerAction({
        icon: { name: 'car', color: '#f5222d' },
        type: 'input',
        title: '依赖插件',
        desc: '汽车的依赖插件例如 Ftms',
        val: 'filePath',
      });

      this.registerAction({
        icon: { name: 'plus.viewfinder', color: '#fa8c16' },
        type: 'input',
        title: '缩放比例',
        desc: '比例越大进度条越长',
        placeholder: '取值 0~1',
        val: 'scale',
      });
    }

    config.runsInApp && this.registerAction('基础设置', this.setWidgetConfig);
    this.cacheName = this.md5(`dataSouce_${this.en}`);
    const filePath = this.settings.filePath || 'Ftms';
    const carModule = require(`./${filePath}`);
    const carService = new carModule(this);
    this.scale = parseFloat(this.settings.scale) || 1; // 柱状图比例高度，值越大，柱状范围越广
    this.init = carService.init;
    this.name = carService.name;
    this.logo = carService.logo;
    this.viewColor = Color.dynamic(
      new Color('#d9d9d9', parseFloat(this.settings.lightOpacity || 1)),
      new Color('#8c8c8c', parseFloat(this.settings.darkOpacity || 1))
    );
  }

  widgetHeight = 145;

  serveInfo = {
    carNumber: '',
  };

  dataSource = {
    remoteInfo: {
      datatime: '',
      list: [],
      userId: '',
      carNumber: '',
    },
    monitorInfo: {
      km: '0',
      oilRate: '0',
      oilWaste: '0',
      oilWasteText: '',
    },
    safeText: '',
    oilPriceText: '',
    oilZDE: 0,
  };

  createProgressBar(
    soFar,
    total = 100,
    width = 400,
    height = 40,
    showPercentage = false
  ) {
    const context = new DrawContext();
    context.size = new Size(width, height);
    context.opaque = false;
    context.respectScreenScale = true;

    // bar background
    context.setFillColor(new Color('#48484b'));
    const bgPath = new Path();
    bgPath.addRoundedRect(
      new Rect(0, 0, width, height),
      height / 2,
      height / 2 - 1
    );
    context.addPath(bgPath);
    context.fillPath();

    // bar foreground
    context.setFillColor(new Color('#e8e8e8'));
    const fgPath = new Path();
    fgPath.addRoundedRect(
      new Rect(0, 0, (width * soFar) / total, height),
      height / 2,
      height / 2 - 1
    );
    context.addPath(fgPath);
    context.fillPath();

    if (showPercentage) {
      const percentage = ((soFar / total) * 100).toFixed(2);
      let xPos = (width * soFar) / total + 5;
      // if over 70%, show in foreground area
      // to ensure that it doesn't overflow the display
      if (percentage > 70) {
        xPos = (width * soFar) / total - 55;
      }

      context.setFont(Font.semiboldRoundedSystemFont(14));
      context.setTextColor(primaryTextColor);
      context.drawText(`${percentage}%`, new Point(xPos, height / 14));
    }

    return context.getImage();
  }

  renderBorder = (stack) => {
    stack.borderWidth = 1;
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

    const stack = w.addStack();
    stack.layoutVertically();
    const headerStack = stack.addStack();
    headerStack.centerAlignContent();
    headerStack.addSpacer(10);
    const gasImg = SFSymbol.named('fuelpump').image;

    const gasIcon = headerStack.addImage(gasImg);
    gasIcon.imageSize = new Size(16, 16);
    gasIcon.tintColor = this.widgetColor;
    headerStack.addSpacer(5);

    const oilRateStackText = headerStack.addText(
      `${this.dataSource.monitorInfo.oilRate}%`
    );
    oilRateStackText.textColor = this.widgetColor;
    oilRateStackText.font = Font.boldSystemFont(14);

    headerStack.addSpacer();
    const logImg = await this.renderImage(this.logo);
    const logImgStack = headerStack.addImage(logImg);
    logImgStack.imageSize = new Size(20, 20);
    headerStack.addSpacer(10);

    const bodyStack = stack.addStack();
    bodyStack.centerAlignContent();
    bodyStack.addSpacer();
    const progressImg = this.createProgressBar(
      this.dataSource.monitorInfo.oilRate
    );
    const progressBar = bodyStack.addImage(progressImg);
    progressBar.imageSize = new Size(this.widgetHeight * this.scale, 28);
    bodyStack.addSpacer();

    stack.addSpacer();

    const oilWasteStack = stack.addStack();
    oilWasteStack.centerAlignContent();
    oilWasteStack.addSpacer();
    const oilWasteStackText = oilWasteStack.addText(
      this.dataSource.monitorInfo.oilWasteText
    );
    oilWasteStackText.textColor = this.widgetColor;
    oilWasteStackText.font = Font.boldSystemFont(10);
    oilWasteStack.addSpacer(5);
    const oilPriceStackText = oilWasteStack.addText(
      this.dataSource.oilPriceText
    );
    oilPriceStackText.textColor = this.widgetColor;
    oilPriceStackText.font = Font.boldSystemFont(10);
    oilWasteStack.addSpacer(2);
    const oilStatus = this.dataSource.oilZDE > 0;
    const oilZdeImage = SFSymbol.named(
      oilStatus ? 'arrow.up' : 'arrow.down'
    ).image;

    const oilZdeWidgetImg = oilWasteStack.addImage(oilZdeImage);
    oilZdeWidgetImg.tintColor = new Color(oilStatus ? '#f5222d' : '#a0d911');
    oilZdeWidgetImg.imageSize = new Size(10, 10);

    oilWasteStack.addSpacer();

    const kilometerStack = stack.addStack();

    kilometerStack.centerAlignContent();
    kilometerStack.addSpacer();
    const panoImg = SFSymbol.named('speedometer').image;

    const panoImgStack = kilometerStack.addStack();
    panoImgStack.setPadding(5, 0, 0, 0);
    const panoStack = panoImgStack.addImage(panoImg);
    panoStack.tintColor = this.widgetColor;
    panoStack.imageSize = new Size(20, 20);
    kilometerStack.addSpacer(5);

    const oilWasteText = kilometerStack.addText(this.dataSource.monitorInfo.km);
    oilWasteText.font = Font.boldSystemFont(28);
    oilWasteText.textColor = this.widgetColor;
    kilometerStack.addSpacer(5);
    const unitStack = kilometerStack.addStack();
    unitStack.setPadding(5, 0, 0, 0);
    const oilWasteUnit = unitStack.addText('km');
    oilWasteUnit.font = Font.boldSystemFont(14);
    oilWasteUnit.textColor = this.widgetColor;
    kilometerStack.addSpacer();

    stack.addSpacer();

    const btBodyStack = stack.addStack();
    btBodyStack.addSpacer();
    const bottomStack = btBodyStack.addStack();
    bottomStack.setPadding(10, 0, 10, 0);
    bottomStack.centerAlignContent();
    bottomStack.addSpacer();
    bottomStack.cornerRadius = 15;
    bottomStack.backgroundColor = this.viewColor;
    const dataTime = this.dataSource.remoteInfo.datatime;
    const countKmText = bottomStack.addText(`上传：${dataTime || '-'}`);
    countKmText.textColor = this.widgetColor;
    countKmText.font = Font.boldSystemFont(12);
    countKmText.centerAlignText();
    bottomStack.addSpacer();
    w.addSpacer();
    return w;
  };

  renderLarge = async (w) => {
    return this.renderSmall(w);
  };

  renderMedium = async (w) => {
    const containerStack = w.addStack();
    containerStack.centerAlignContent();
    const carStack = containerStack.addStack();
    carStack.addSpacer();
    carStack.backgroundColor = this.viewColor;

    carStack.layoutVertically();

    carStack.centerAlignContent();
    carStack.size = new Size(this.widgetHeight, this.widgetHeight);
    carStack.cornerRadius = 20;
    const carImg = await this.renderImage(this.serveInfo.picUrl);

    const carImgStack = carStack.addStack();
    const carResStack = carImgStack.addImage(carImg);
    carResStack.imageSize = new Size(137.5, 70);

    carStack.addSpacer();

    const carNumberStack = carStack.addStack();
    carNumberStack.addSpacer();
    carNumberStack.centerAlignContent();
    const carNumberText = carNumberStack.addText(this.serveInfo.carNumber);
    carNumberText.font = Font.boldSystemFont(24);
    carNumberText.textColor = this.widgetColor;
    carNumberText.centerAlignText();
    carNumberStack.addSpacer();

    carStack.addSpacer();

    const carSafeStack = carStack.addStack();
    carSafeStack.addSpacer();
    carSafeStack.centerAlignContent();

    let safeIconImg;
    if (this.dataSource.safeText) {
      safeIconImg = carSafeStack.addImage(SFSymbol.named('lock.open').image);
    } else {
      safeIconImg = carSafeStack.addImage(SFSymbol.named('lock').image);
    }

    carSafeStack.addSpacer(5);
    const statusText = carSafeStack.addText(
      this.dataSource.safeText || '已上锁'
    );
    statusText.centerAlignText();
    statusText.font = Font.systemFont(12);
    statusText.textColor = this.dataSource.safeText
      ? new Color('#f5222d')
      : this.widgetColor;

    safeIconImg.tintColor = statusText.textColor;
    safeIconImg.imageSize = new Size(10, 14);

    carSafeStack.addSpacer();

    carStack.addSpacer();

    containerStack.addSpacer();
    const rightStack = containerStack.addStack();
    rightStack.layoutVertically();
    await this.renderSmall(rightStack);

    return w;
  };

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    widget.setPadding(10, 10, 10, 10);
    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === 'medium') {
      return await this.renderMedium(widget);
    } else {
      return await this.notSupport(widget);
    }
  }
}

// @组件代码结束
await Runing(Widget, '', false); //远程开发环境
