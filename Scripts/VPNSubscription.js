// letiables used by Scriptable.
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
  logo = 'https://raw.githubusercontent.com/58xinian/icon/master/glados_animation.gif';

  dataSource = {
    restData: '0',
    usedData: '0',
    totalData: '0',
    todayData: '0',
    isCheckIn: false,
  };

  account = {
    title: '',
    url: '',
  };

  color1 = ['#ef0a6a', '#b6359c'];
  color2 = ['#ff54fa', '#fad126'];
  color3 = ['#28cfb3', '#72d7cc'];

  chartConfig = (data, color, value) => {
    console.log(data);
    const fontColor = `#${this.widgetColor.hex}`;
    const template1 = `
{
  "type": "radialGauge",
  "data": {
    "datasets": [
      {
        "data": [${parseFloat(data[0])}],
        "borderWidth": 0,
        "backgroundColor": getGradientFillHelper('vertical', ${JSON.stringify(
        color[0])}),
      }
    ]
  },
  "options": {
      centerPercentage: 86,
      rotation: Math.PI / 2,
      centerArea: {
        displayText: false,
      }, 
      options:{
      	trackColor: '#f4f4f4',
      }
  }
}
      `;

    const template2 = `
{
  "type": "radialGauge",
  "data": {
    "datasets": [
      {
       "data": [${parseFloat(data[1])}],
        "borderWidth": 0,
        "backgroundColor": getGradientFillHelper('vertical', ${JSON.stringify(
        color[1])}),
      }
    ]
  },
  "options": {
      layout: {
          padding: {
              left: 47,
              right: 47,
              top: 47,
              bottom: 47
          }
      },
      options:{
      	trackColor: '#f4f4f4',
      },
      centerPercentage: 80,
      rotation: Math.PI / 2,
      centerArea: {
        displayText: false,
      }
  }
}
      `;
    const template3 = `
{
  "type": "radialGauge",
  "data": {
    "datasets": [
      {
        "data": [${parseFloat(data[2])}],
        "borderWidth": 0,
        "backgroundColor": getGradientFillHelper('vertical', ${JSON.stringify(
        color[2])}),
      }
    ]
  },
  "options": {
      layout: {
          padding: {
              left: 94,
              right: 94,
              top: 94,
              bottom: 94
          }
      },
      options:{
      	trackColor: '#f4f4f4',
      },
      centerPercentage: 70,
      rotation: Math.PI / 2,
      centerArea: {
        displayText: true,
        fontColor: '${fontColor}',
        fontSize: 20,
        text:(value)=>{
          return '${value}';
        }
      }
  }
}
      `;
    console.log(template1);
    console.log(template2);
    console.log(template3);
    return {template1, template2, template3};
  };

  init = async () => {
    try {
      const data = await this.getdata(this.account.url);
      const total = data[2];
      const today = data[0];
      const remain = data[2] - data[0] - data[1];
      const use = total - remain;
      this.dataSource.restData = remain;
      this.dataSource.totalData = total;
      this.dataSource.usedData = use;
      this.dataSource.todayData = today;
      console.log(this.dataSource);
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
      (parseInt(resp.match(/upload=([0-9]+);?/)[1])).toFixed(2),
      (parseInt(resp.match(/download=([0-9]+);?/)[1])).toFixed(2),
      (parseInt(resp.match(/total=([0-9]+);?/)[1])).toFixed(2),
    ];
    console.log(resp);
    return resp;
  }

  gradient = (color) => {
    const linear = new LinearGradient();
    linear.colors = color.map(item => new Color(item));
    linear.locations = [0, 0.5];
    return linear;
  };

  formatFileSize(fileSize) {
    if (fileSize < (1024 * 1024)) {
      let temp = fileSize / 1024;
      temp = temp.toFixed(2);
      return temp + 'KB';
    } else if (fileSize < (1024 * 1024 * 1024)) {
      let temp = fileSize / (1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'MB';
    } else if (fileSize < (1024 * 1024 * 1024 * 1024)) {
      let temp = fileSize / (1024 * 1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'GB';
    } else {
      let temp = fileSize / (1024 * 1024 * 1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'TB';
    }
  }

  createChart = async (size, chart) => {
    const url = `https://quickchart.io/chart?w=${size.w}&h=${size.h}&f=png&c=${encodeURIComponent(
        chart)}`;
    return await this.$request.get(url, 'IMG');
  };

  setContent = async (w, size, viewSize) => {
    const rest = this.dataSource.restData;
    const use = this.dataSource.usedData;
    const today = this.dataSource.todayData;
    const total = this.dataSource.totalData;
    const data1 = Math.floor(rest / total * 100);
    const data2 = Math.floor(use / total * 100);
    const data3 = Math.floor((today / total) * 100);
    const data = [
      data1 || 0, data2 || 0, data3 || 0,
    ];
    const {template1, template2, template3} = this.chartConfig(
        data,
        [this.color1, this.color2, this.color3],
        this.formatFileSize(this.dataSource.restData),
    );

    const stackContent = w.addStack();
    stackContent.centerAlignContent();
    const stackSize = viewSize;
    stackContent.size = stackSize;
    stackContent.backgroundImage = await this.createChart(size, template1);

    const stackContent2 = stackContent.addStack();
    stackContent2.size = stackSize;
    stackContent2.backgroundImage = await this.createChart(size, template2);

    const stackContent3 = stackContent2.addStack();
    stackContent3.size = stackSize;
    stackContent3.backgroundImage = await this.createChart(size, template3);

  };

  setLabelCell = async (stack, data) => {
    stack.addSpacer();

    const stackCell = stack.addStack();
    stackCell.centerAlignContent();
    const stackIcon = stackCell.addStack();
    stackIcon.size = new Size(16, 16);
    stackIcon.cornerRadius = 8;
    if (data.isImg) {
      try {
        const icon = await this.$request.get(data.icon, 'IMG');
        stackIcon.addImage(icon);
      } catch (e) {
        console.log(e);
      }
    } else {
      stackIcon.backgroundGradient = data.icon;
    }

    stackCell.addSpacer(5);

    const stackTitle = stackCell.addStack();
    const title = {...this.textFormat.title};
    title.color = this.widgetColor;
    this.provideText(data.title, stackTitle, title);

    stackCell.addSpacer(5);

    const stackValue = stackCell.addStack();
    const value = {...this.textFormat.defaultText};
    value.color = this.widgetColor;
    this.provideText(data.value, stackValue, title);

    stack.addSpacer();
  };

  setFooterCell = (stack, data) => {
    const title = {...this.textFormat.title};
    title.color = this.widgetColor;
    title.size = 10;

    const stackCell = stack.addStack();
    stackCell.layoutVertically();

    const stackIcon = stackCell.addStack();
    stackIcon.addSpacer();
    const stackViewIcon = stackIcon.addStack();
    stackViewIcon.size = new Size(10, 10);
    stackViewIcon.cornerRadius = 5;
    stackViewIcon.backgroundGradient = this.gradient(data.color);
    stackIcon.addSpacer();

    stackCell.layoutVertically();
    const stackText = stackCell.addStack();
    stackText.addSpacer();
    this.provideText(data.value, stackText, title);
    stackText.addSpacer();

    const desc = {...this.textFormat.defaultText};
    desc.color = this.widgetColor;
    desc.size = 8;

    const stackTip = stackCell.addStack();
    stackTip.addSpacer();
    this.provideText(data.label, stackTip, desc);
    stackTip.addSpacer();
  };

  renderSmall = async (w) => {
    const stackHeader = w.addStack();
    const stackLeft = stackHeader.addStack();
    stackHeader.centerAlignContent();
    stackLeft.centerAlignContent();
    try {
      const imgIcon = await this.$request.get(
          this.account.icon || this.logo, 'IMG');
      const stackImgItem = stackLeft.addImage(imgIcon);
      stackImgItem.imageSize = new Size(12, 12);
      stackImgItem.cornerRadius = 4;
      stackLeft.addSpacer(5);
    } catch (e) {
      console.log(e);
    }
    const title = {...this.textFormat.title};
    title.color = this.widgetColor;
    title.size = 12;
    this.provideText(this.account.title, stackLeft, title);
    stackHeader.addSpacer();

    const stackRight = stackHeader.addStack();
    stackRight.centerAlignContent();
    const calendar = SFSymbol.named('waveform.path.badge.minus');
    const imgCalendar = stackRight.addImage(calendar.image);
    imgCalendar.imageSize = new Size(12, 12);
    imgCalendar.tintColor = new Color('#00b800');
    stackRight.addSpacer(5);
    this.provideText(
        this.formatFileSize(this.dataSource.todayData), stackRight, title);
    w.addSpacer();

    const stackContent = w.addStack();
    stackContent.addSpacer();
    await this.setContent(stackContent, {w: 360, h: 360}, new Size(80, 80));
    stackContent.addSpacer();

    w.addSpacer();

    const stackFooter = w.addStack();
    stackFooter.centerAlignContent();
    const stackFooterLeft = stackFooter.addStack();
    this.setFooterCell(stackFooterLeft, {
      value: this.formatFileSize(this.dataSource.restData),
      label: '剩余',
      color: this.color1,
    });

    stackFooter.addSpacer();

    const stackFooterRight = stackFooter.addStack();
    this.setFooterCell(stackFooterRight, {
      value: this.formatFileSize(this.dataSource.usedData),
      label: '累计',
      color: this.color2,
    });

    return w;
  };

  renderMedium = async (w) => {
    const stackBody = w.addStack();
    const stackLeft = stackBody.addStack();
    await this.setContent(stackLeft, {w: 360, h: 360}, new Size(140, 140));
    stackBody.addSpacer(10);
    const stackRight = stackBody.addStack();
    stackRight.layoutVertically();
    await this.setLabelCell(
        stackRight, {
          icon: this.account.icon || this.logo,
          title: this.account.title,
          value: ``,
          isImg: true,
        });
    await this.setLabelCell(
        stackRight,
        {
          icon: this.gradient(this.color3),
          title: '上传',
          value: this.formatFileSize(this.dataSource.todayData),
        },
    );
    await this.setLabelCell(
        stackRight,
        {
          icon: this.gradient(this.color2),
          title: '累计',
          value: this.formatFileSize(this.dataSource.usedData),
        },
    );

    await this.setLabelCell(
        stackRight,
        {
          icon: this.gradient(this.color1),
          title: '剩余',
          value: this.formatFileSize(this.dataSource.restData),
        },
    );

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
    try {
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
      if (this.settings.dataSource && this.settings.dataSource[index] &&
          index !==
          false) {
        this.account = this.settings.dataSource[index];
      }
    } catch (e) {
      console.log(e);
    }
  };

  async actionSettings() {
    try {
      const table = new UITable();
      const dataSource = this.settings.dataSource || [];
      dataSource.map((t, index) => {
        const r = new UITableRow();
        r.addText(`parameter：${index}  机场名：${t.title}     订阅：${t.url}`);
        r.onSelect = () => {
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
        r.onSelect = () => {
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
