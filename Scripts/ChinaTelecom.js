// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: paper-plane;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '中国电信';
    this.en = 'ChinaTelecom';
    this.Run();
  }

  cookie = '';
  authToken = '';
  fgCircleColor = Color.dynamic(new Color('#dddef3'), new Color('#fff'));
  percentColor = this.widgetColor;
  textColor1 = Color.dynamic(new Color('#333'), new Color('#fff'));
  textColor2 = this.widgetColor;

  circleColor1 = new Color('#ffbb73');
  circleColor2 = new Color('#ff0029');
  circleColor3 = new Color('#00b800');
  circleColor4 = new Color('#8376f9');
  iconColor = new Color('#827af1');

  format = (str) => {
    return parseInt(str) > 10 ? str : `0${str}`;
  };

  date = new Date();
  arrUpdateTime = [
    this.format(this.date.getMonth() + 1),
    this.format(this.date.getDate()),
    this.format(this.date.getHours()),
    this.format(this.date.getMinutes()),
  ];

  // percent 的计算方式，剩余/总量 * 100 = 百分比| 百分比 * 3.6 ，为显示进度。
  phoneBill = {
    percent: 0,
    label: '话费剩余',
    count: 0,
    unit: '元',
    icon: 'yensign.circle',
    circleColor: this.circleColor1,
  };

  flow = {
    percent: 0,
    label: '流量剩余',
    count: 0,
    unit: 'M',
    icon: 'waveform.path.badge.minus',
    circleColor: this.circleColor2,
  };

  voice = {
    percent: 0,
    label: '语音剩余',
    count: 0,
    unit: '分钟',
    icon: 'mic',
    circleColor: this.circleColor3,
  };

  updateTime = {
    percent: 0,
    label: '更新时间',
    count: `${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`,
    unit: '',
    icon: 'clock',
    circleColor: this.circleColor4,
  };

  canvSize = 282;
  canvWidth = 20; // circle thickness
  canvRadius = 160; // circle radius
  dayRadiusOffset = 60;
  canvTextSize = 40;

  options = {
    headers: {
      'authToken': '',
      'type': 'alipayMiniApp',
      'User-Agent': 'TYUserCenter/2.8 (iPhone; iOS 14.0; Scale/3.00)',
    },
    body: 't=tysuit',
    method: 'POST',
  };

  fetchUri = {
    detail: 'https://e.189.cn/store/user/package_detail.do',
    balance: 'https://e.189.cn/store/user/balance_new.do',
    bill: `https://e.189.cn/store/user/bill.do?year=${this.date.getFullYear()}&month=${this.format(
        this.date.getMonth() + 1)}&t=tysuit`,
  };

  init = async () => {
    try {
      const nowHours = this.date.getHours();
      const updateHours = nowHours > 12 ? 24 : 12;
      this.updateTime.percent = Math.floor(nowHours / updateHours * 100);
      await this.getData();
    } catch (e) {
      console.log(e);
    }
  };

  // MB 和 GB 自动转换
  formatFlow(number) {
    const n = number / 1024;
    if (n < 1024) {
      return {count: n.toFixed(2), unit: 'M'};
    }
    return {count: (n / 1024).toFixed(2), unit: 'G'};
  }

  getData = async () => {
    const detail = await this.http(
        {url: this.fetchUri.detail, ...this.options});
    const balance = await this.http(
        {url: this.fetchUri.balance, ...this.options});
    const bill = await this.$request.get(
        this.fetchUri.bill, {headers: {Cookie: this.cookie}});
    console.log(detail);
    if (detail.result === 0) {
      // 套餐分钟数
      this.voice.percent = Math.floor(
          parseInt(detail.voiceBalance) / parseInt(detail.voiceAmount) * 100);
      this.voice.count = detail.voiceBalance;
      this.flow.percent = Math.floor(
          detail.balance / (detail.total || 1) * 100);
      const flow = this.formatFlow(detail.balance);
      this.flow.count = flow.count;
      this.flow.unit = flow.unit;
    }
    if (balance.result === 0) {
      // 余额
      this.phoneBill.count = parseFloat(
          (parseInt(balance.totalBalanceAvailable) / 100).toFixed(2));
    }
    if (bill.serviceResultCode === '0') {
      this.phoneBill.percent = Math.floor(this.phoneBill.count /
          ((bill.items[0].sumCharge / 100) + this.phoneBill.count) * 100);
    }

  };

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
    canvas.setLineWidth(this.canvWidth - 14);
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
          this.canvWidth - 4,
          this.canvWidth - 4,
      );
      canvas.fillEllipse(rect_r);
    }
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

  drawPointText(txt, canvas, txtPoint, fontSize) {
    canvas.setTextColor(this.percentColor);
    canvas.setFont(Font.boldSystemFont(fontSize));
    canvas.drawText(txt, txtPoint);
  }

  sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180);
  }

  cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180);
  }

  setCircleText = (stack, data) => {
    const stackCircle = stack.addStack();
    const canvas = this.makeCanvas();
    stackCircle.size = new Size(70, 70);
    this.makeCircle(
        canvas, this.dayRadiusOffset, data.percent * 3.6, data.circleColor);

    this.drawText(data.percent, canvas, 170, 42);
    this.drawPointText(`%`, canvas, new Point(190, 150), 25);
    stackCircle.backgroundImage = canvas.getImage();

    stackCircle.setPadding(20, 0, 0, 0);
    stackCircle.addSpacer();
    const icon = SFSymbol.named(data.icon);
    const imageIcon = stackCircle.addImage(icon.image);
    imageIcon.tintColor = this.iconColor;
    imageIcon.imageSize = new Size(15, 15);
    // canvas.drawImageInRect(icon.image, new Rect(110, 80, 60, 60));
    stackCircle.addSpacer();

    stack.addSpacer(5);
    const stackDesc = stack.addStack();
    stackDesc.size = new Size(70, 60);
    stackDesc.centerAlignContent();
    stackDesc.layoutVertically();
    stackDesc.addSpacer(10);
    const textLabel = this.textFormat.defaultText;
    textLabel.size = 12;
    textLabel.color = this.textColor2;
    this.provideText(data.label, stackDesc, textLabel);
    stackDesc.addSpacer(10);

    const stackDescFooter = stackDesc.addStack();
    stackDescFooter.centerAlignContent();
    const textCount = this.textFormat.title;
    textCount.size = 16;
    textCount.color = this.textColor1;
    this.provideText(`${data.count}`, stackDescFooter, textCount);
    stackDescFooter.addSpacer(2);
    this.provideText(data.unit, stackDescFooter, textLabel);
  };

  renderSmall = async (w) => {
    w.setPadding(5, 5, 5, 5);
    const stackBody = w.addStack();
    stackBody.layoutVertically();
    const stackTop = stackBody.addStack();
    this.setCircleText(stackTop, this.phoneBill);
    const stackBottom = stackBody.addStack();
    this.setCircleText(stackBottom, this.flow);

    const stackFooter = stackBody.addStack();
    stackFooter.addSpacer();
    const text = this.textFormat.defaultText;
    text.color = new Color('#aaa');
    this.provideText(
        `更新时间：${this.arrUpdateTime[0]}-${this.arrUpdateTime[1]} ${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`,
        stackFooter,
        text,
    );
    stackFooter.addSpacer();
    return w;
  };

  renderMedium = async (w) => {
    const stackBody = w.addStack();
    stackBody.layoutVertically();
    const stackTop = stackBody.addStack();
    this.setCircleText(stackTop, this.phoneBill);
    this.setCircleText(stackTop, this.flow);
    const stackBottom = stackBody.addStack();
    this.setCircleText(stackBottom, this.voice);
    this.setCircleText(stackBottom, this.updateTime);
    return w;
  };

  renderLarge = async (w) => {
    return await this.renderMedium(w);
  };

  Run() {
    if (config.runsInApp) {
      const widgetInitConfig = {
        cookie: 'china_telecom_cookie',
        authToken: 'china_telecom_authToken_10000',
      };
      this.registerAction('颜色配置', async () => {
        await this.setAlertInput(
            `${this.name}颜色配置`, '进度条颜色|底圈颜色\n图标颜色|比值颜色|值颜色', {
              step1: '进度颜色 1',
              step2: '进度颜色 2',
              step3: '进度颜色 3',
              step4: '进度颜色 4',
              inner: '底圈颜色',
              icon: '图标颜色',
              percent: '比值颜色',
              value: '值颜色',
            });
      });
      this.registerAction('账号设置', async () => {
        await this.setAlertInput(
            `${this.name}账号`, '读取 BoxJS 缓存信息', widgetInitConfig);
      });
      this.registerAction('代理缓存', async () => {
        await this.setCacheBoxJSData(widgetInitConfig);
      });
      this.registerAction('基础设置', this.setWidgetConfig);
    }
    const {cookie, authToken, step1, step2, step3, step4, inner, icon, percent, value} = this.settings;
    this.fgCircleColor = inner || this.fgCircleColor;
    this.textColor1 = value || this.textColor1;
    this.circleColor1 = step1 || this.circleColor1;
    this.circleColor2 = step2 || this.circleColor2;
    this.circleColor3 = step3 || this.circleColor3;
    this.circleColor4 = step4 || this.circleColor4;
    this.iconColor = icon || this.iconColor;
    this.percentColor = percent || this.percentColor;

    this.authToken =
        `a1aa79e4df10811e3d16b6be0efd9ba1c447de874127d139f0c632cac729696805c2557acd9f6cce4199c61293f3aa30`;
    this.cookie =
        `CZSSON=d15367dde1e4e9ad8d620e03c1e8d4729dee82492bd4424c71adc46be647dbf54c943ecb79f42d00fad2f0facaaf910390a6c8d0277d1402d4c9d75aa2980190bbcb28aa3b3f9418e569c01ca55302584be5d45eab78bba63c70b8305b3f22b40b34d488e1a65baa9174ccfe2ae424ad446a792bc3771f4286ad861b62c1ebfac578fa80ebca2961bac7b20cc942a0ff31511b859068a5ca68b3291640b8d936c74ecdfe892e226074db26a16286249981deacb989b68e7462b449c1d60b157f93778a6b0b3dd43656812dc934f6348f7e5a3fd8ee81c58db099260caae81aff1b95ad07f45eb0e9a33b1053c0965aa8daab370d921970b4acb55f235b6df0dd99041ea28e4ac4887021c8fd62c07d13163713bb8b28c0907d76267551f5c2b360e928b0a337ee88bfa571e98db4c95d2edffa16a12de111109b57af9c23e5dec69314c9c0dadecbf6537e3f262ec4bdc24053539d6a527de463f7a5cb60082cc2f640460bc8772693a2698d5d92bcbb113e4e5ded0d2d6d6a4b469afdc22a504ef70cb78a17ea0e5b17f899462fc6f137d1cbe2cebb29b37c6d28a99b24b57c72dd17b2c0c0d8c718ceb2b967deb4d547db200cc98734b25d12c2d662d7d770; SSON=d15367dde1e4e9ad8d620e03c1e8d4729dee82492bd4424c71adc46be647dbf54c943ecb79f42d00fad2f0facaaf910390a6c8d0277d1402d4c9d75aa2980190bbcb28aa3b3f9418e569c01ca55302584be5d45eab78bba63c70b8305b3f22b40b34d488e1a65baa9174ccfe2ae424ad446a792bc3771f4286ad861b62c1ebfac578fa80ebca2961bac7b20cc942a0ff31511b859068a5ca68b3291640b8d936c74ecdfe892e226074db26a16286249981deacb989b68e7462b449c1d60b157f93778a6b0b3dd43656812dc934f6348f7e5a3fd8ee81c58db099260caae81aff1b95ad07f45eb0e9a33b1053c0965aa8daab370d921970b4acb55f235b6df0dd99041ea28e4ac4887021c8fd62c07d13163713bb8b28c0907d76267551f5c2b360e928b0a337ee88bfa571e98db4c95d2edffa16a12de111109b57af9c23e5dec69314c9c0dadecbf6537e3f262ec4bdc24053539d6a527de463f7a5cb60082cc2f640460bc8772693a2698d5d92bcbb113e4e5ded0d2d6d6a4b469afdc22a504ef70cb78a17ea0e5b17f899462fc6f137d1cbe2cebb29b37c6d28a99b24b57c72dd17b2c0c0d8c718ceb2b967deb4d547db200cc98734b25d12c2d662d7d770; apm_ct=20200927101859512; apm_ip=6F81C0564E2078F4BA4A39592C2825E5570E5797; apm_ua=54A743CC257DCC8E00E03E5EB2BD70BC; apm_uid=16A76898B5273CBA68CC45893F56E3E5`;
    this.options.headers.authToken = this.authToken;
  }

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    widget.setPadding(0, 0, 0, 0);
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
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, args.widgetParameter, false); //远程开发环境
