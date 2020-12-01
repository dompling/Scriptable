// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: paper-plane;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = 'VPNSubscription';
    this.en = 'VPNSubscription';
    this.CACHE_KEY = this.md5(`dataSouce_${this.en}`);
    this.Run();
  }

  useBoxJS = false;
  today = '';

  fgCircleColor = Color.dynamic(new Color('#dddef3'), new Color('#fff'));
  percentColor = this.widgetColor;
  textColor1 = Color.dynamic(new Color('#333'), new Color('#fff'));
  textColor2 = this.widgetColor;

  circleColor4 = new Color('#8376f9');
  iconColor = new Color('#ff3e3e');
  canvSize = 100;
  canvWidth = 5; // circle thickness
  canvRadius = 100; // circle radius
  dayRadiusOffset = 60;
  canvTextSize = 40;

  dataSource = {
    restData: '0',
    usedData: '0',
    todayUsed: '0',
  };

  flow = {
    percent: 0,
    count: 0,
    icon: 'waveform.path.badge.minus',
    circleColor: this.circleColor4,
  };

  account = {
    title: '',
    url: '',
  };

  range = {};
  max = 6;

  init = async () => {
    try {
      const data = await this.getdata(this.account.url);
      const total = (data[2] / 1024).toFixed(0);
      const remain = ((data[2] - data[0] - data[1]) / 1024).toFixed(2);
      const use = (total - remain).toFixed(2);
      this.dataSource.restData = remain;
      this.dataSource.todayUsed = total;
      this.dataSource.usedData = use;

      this.flow.count = this.dataSource.restData;
      this.flow.percent = Math.floor((this.flow.count / total) * 100);
      console.log(this.flow.percent);
    } catch (e) {
      console.log(e);
    }
  };

  async getdata(url) {
    const req = new Request(url);
    req.method = 'GET';
    await req.load();
    let resp = req.response.headers['subscription-userinfo'];
    resp = [
      (parseInt(resp.match(/upload=(.*?);/)[1]) / 1048576).toFixed(2),
      (parseInt(resp.match(/download=(.*?);/)[1]) / 1048576).toFixed(2),
      (parseInt(resp.match(/total=(.*?);/)[1]) / 1048576).toFixed(2),
    ];
    console.log(resp);
    return resp;
  }

  makeCanvas() {
    const canvas = new DrawContext();
    canvas.opaque = false;
    canvas.respectScreenScale = true;
    canvas.size = new Size(this.canvSize, this.canvSize);
    return canvas;
  }

  makeCircle(canvas, radiusOffset, degree, color) {
    let ctr = new Point(this.canvSize / 2, this.canvSize / 2);
    // Outer circle
    const bgx = ctr.x - (this.canvRadius - radiusOffset);
    const bgy = ctr.y - (this.canvRadius - radiusOffset);
    const bgd = 2 * (this.canvRadius - radiusOffset);
    const bgr = new Rect(
        bgx,
        bgy,
        bgd,
        bgd,
    );
    canvas.setStrokeColor(this.fgCircleColor);
    canvas.setLineWidth(2);
    canvas.strokeEllipse(bgr);
    // Inner circle
    canvas.setFillColor(color);
    for (let t = 0; t < degree; t++) {
      const rect_x = ctr.x + (this.canvRadius - radiusOffset) * this.sinDeg(t) -
          this.canvWidth / 2;
      const rect_y = ctr.y - (this.canvRadius - radiusOffset) * this.cosDeg(t) -
          this.canvWidth / 2;
      const rect_r = new Rect(
          rect_x,
          rect_y,
          this.canvWidth,
          this.canvWidth,
      );
      canvas.fillEllipse(rect_r);
    }
  }

  sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180);
  }

  cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180);
  }

  setCircleText = (stack, data) => {
    const stackView = stack.addStack();
    stackView.addSpacer();
    const stackCircle = stackView.addStack();

    const canvas = this.makeCanvas();
    stackCircle.size = new Size(70, 70);
    this.makeCircle(
        canvas, this.dayRadiusOffset, data.percent * 3.6, data.circleColor);
    this.drawText(data.percent, canvas, 75, 18);
    this.drawPointText(`%`, canvas, new Point(65, 50), 14);
    stackCircle.backgroundImage = canvas.getImage();
    stackCircle.setPadding(20, 0, 0, 0);
    const icon = SFSymbol.named(data.icon);
    const imageIcon = stackCircle.addImage(icon.image);
    imageIcon.tintColor = this.iconColor;
    imageIcon.imageSize = new Size(15, 15);
    // canvas.drawImageInRect(icon.image, new Rect(110, 80, 60, 60));

    stackView.addSpacer();

    stack.addSpacer();
  };

  creatProgress(stack, total, havegone) {
    let width;
    if (config.widgetFamily === 'small') {
      width = 100;
    } else {
      width = 300;
    }
    const h = 10;
    const context = new DrawContext();
    context.size = new Size(width, h);
    context.opaque = false;
    context.respectScreenScale = true;
    context.setFillColor(this.fgCircleColor);
    const path = new Path();
    path.addRoundedRect(new Rect(0, 0, width, h), 3, 2);
    context.addPath(path);
    context.fillPath();
    context.setFillColor(this.circleColor4);
    const path1 = new Path();
    const path1width = (havegone / total > width) ? width : width *
        havegone / total;
    path1.addRoundedRect(new Rect(0, 0, path1width, h), 3, 2);
    context.addPath(path1);
    context.fillPath();
    const stackProgress = stack.addStack();
    stackProgress.layoutVertically();
    const imgProgressItem = stackProgress.addImage(context.getImage());
    imgProgressItem.cornerRadius = 10;
    const textFormat = {...this.textFormat.title};
    textFormat.color = this.widgetColor;
    stackProgress.addSpacer(10);
    const stackText = stackProgress.addStack();
    stackText.addSpacer();
    this.provideText(
        `${this.flow.percent}%`, stackText, textFormat);
    stackText.addSpacer();

    stack.addSpacer();
  }

  drawPointText(txt, canvas, txtPoint, fontSize) {
    canvas.setTextColor(this.percentColor);
    canvas.setFont(Font.boldSystemFont(fontSize));
    canvas.drawText(txt, txtPoint);
  }

  drawText(txt, canvas, txtOffset, fontSize) {
    const txtRect = new Rect(
        this.canvTextSize / 2 - 20,
        txtOffset - this.canvTextSize / 2,
        this.canvSize,
        this.canvTextSize,
    );
    canvas.setTextColor(this.percentColor);
    canvas.setFont(Font.boldSystemFont(fontSize));
    canvas.setTextAlignedCenter();
    canvas.drawTextInRect(`${txt}`, txtRect);
  }

  createDivider(w) {
    const drawContext = new DrawContext();
    drawContext.size = new Size(543, this.widgetSize === 'small' ? 4 : 2);
    const path = new Path();
    path.addLine(new Point(1000, 20));
    drawContext.addPath(path);
    drawContext.setStrokeColor(new Color('#000', 1));
    drawContext.setLineWidth(2);
    drawContext.strokePath();

    const stackLine = w.addStack();
    stackLine.borderWidth = 1;
    stackLine.borderColor = new Color('#000', 0.4);
    stackLine.addImage(drawContext.getImage());
    w.addSpacer(5);
  }

  async setHeader(w, size) {
    const header = w.addStack();
    const left = header.addStack();
    left.centerAlignContent();
    let icon = 'https://raw.githubusercontent.com/58xinian/icon/master/glados_animation.gif';
    if (this.account.icon) icon = this.account.icon;
    const stackIcon = left.addStack();
    try {
      const imgIcon = await this.$request.get(icon, 'IMG');
      const imgIconItem = stackIcon.addImage(imgIcon);
      let iconSize = new Size(16, 16);
      if (this.widgetSize === 'small') iconSize = new Size(12, 12);
      imgIconItem.imageSize = iconSize;
      imgIconItem.cornerRadius = 4;
      left.addSpacer(5);
    } catch (e) {
      console.log(e);
    }

    const vpnName = {...this.textFormat.title};
    vpnName.size = size;
    vpnName.color = this.widgetColor;
    this.provideText(this.account.title, left, vpnName);

    header.addSpacer();

    const right = header.addStack();
    right.bottomAlignContent();
    const vpnFlow = {...this.textFormat.title};
    vpnFlow.color = new Color('#26c5bc');
    vpnFlow.size = size;
    this.provideText(`${this.dataSource.todayUsed}GB`, right, vpnFlow);

    w.addSpacer();
  };

  setLabel(w, data, size) {
    const stackLabel = w.addStack();
    const textBattery = {...this.textFormat.battery};
    textBattery.size = size.label;
    textBattery.color = this.widgetColor;
    this.provideText(data.label, stackLabel, textBattery);

    textBattery.size = size.value;
    const stackValue = w.addStack();
    stackValue.centerAlignContent();
    textBattery.color = new Color(data.color);
    this.provideText(data.value + data.unit, stackValue, textBattery);
  }

  setFooter(w, size) {
    const footer = w.addStack();
    footer.centerAlignContent();

    this.setLabel(
        footer, {
          label: '剩余：',
          color: '#ff3e3e',
          value: this.dataSource.restData,
          unit: 'GB',
        }, size);
    footer.addSpacer();
    this.setLabel(
        footer, {
          label: '累计：',
          color: '#dc9e28',
          value: this.dataSource.usedData,
          unit: 'GB',
        }, size);
  }

  renderSmall = async (w) => {
    await this.setHeader(w, 10);
    this.setCircleText(w, this.flow);
    this.createDivider(w);
    this.setFooter(w, {label: 6, value: 8});
    return w;
  };

  renderMedium = async (w) => {
    await this.setHeader(w, 16);
    this.creatProgress(w, this.dataSource.todayUsed, this.dataSource.restData);
    this.createDivider(w);
    this.setFooter(w, {label: 14, value: 18});
    return w;
  };

  renderLarge = async (w) => {
    w.addText('暂不支持');
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

  Run = () => {
    if (config.runsInApp) {
      this.registerAction('默认订阅', this.actionSettings);
      this.registerAction('清除订阅', this.deletedVpn);
      this.registerAction('新增订阅', async () => {
        const account = await this.setAlertInput(
            '添加订阅', '添加订阅数据，添加完成之后请去设置默认订阅', {
              title: '机场名',
              icon: '图标',
              url: '订阅地址',
            }, false);
        if (!this.settings.dataSource) this.settings.dataSource = [];
        if (!account) return;
        if (account.title && account.url) {
          this.settings.dataSource.push(account);
        }
        this.settings.dataSource = this.settings.dataSource.filter(
            item => item);
        this.saveSettings();
      });
      this.registerAction('基础设置', this.setWidgetConfig);
    }
    this.account = this.settings.account || this.account;
    this.CACHE_KEY += '_' + this.account.title;
    const index = typeof args.widgetParameter === 'string' ? parseInt(
        args.widgetParameter) : false;
    if (this.settings[index] && index !== false) {
      this.account = this.settings[index];
    }
  };

  async actionSettings() {
    try {
      const table = new UITable();
      const dataSource = this.settings.dataSource || [];
      dataSource.map((t) => {
        const r = new UITableRow();
        r.addText(`机场名：${t.title}     订阅：${t.url}`);
        r.onSelect = (n) => {
          this.settings.account = t;
          this.notify(t.title, `默认订阅设置成功\n订阅：${t.url}`);
          this.saveSettings(false);
        };
        table.addRow(r);
      });
      table.present(false);
    } catch (e) {
      console.log(e);
    }
  }

  async deletedVpn() {
    try {
      const table = new UITable();
      const dataSource = this.settings.dataSource || [];
      dataSource.map((t, index) => {
        const r = new UITableRow();
        r.addText(`❌   机场名：${t.title}     订阅：${t.url}`);
        r.onSelect = (n) => {
          dataSource.splice(index, 1);
          this.settings.dataSource = dataSource;
          this.notify(t.title, `❌\n订阅：${t.url}`);
          this.saveSettings(false);
        };
        table.addRow(r);
      });
      table.present(false);
    } catch (e) {
      console.log(e);
    }
  }

}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, '', false); //远程开发环境
