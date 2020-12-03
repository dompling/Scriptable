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
    this.name = 'VPNBoardPress';
    this.en = 'VPNBoardPress';
    this.CACHE_KEY = this.md5(`dataSouce_${this.en}`);
    this.Run();
  }

  logo = 'https://raw.githubusercontent.com/58xinian/icon/master/glados_animation.gif';
  useBoxJS = false;
  dataSource = {
    restData: '0',
    usedData: '0',
    todayUsed: '0',
    isCheckIn: false,
  };

  gradient = (color) => {
    const linear = new LinearGradient();
    linear.colors = color.map(item => new Color(item));
    linear.locations = [0, 0.5];
    return linear;
  };

  color1 = ['#ef0a6a', '#b6359c'];
  color2 = ['#ff54fa', '#fad126'];
  color3 = ['#28cfb3', '#72d7cc'];

  chartConfig = (data, color, value) => {
    console.log(data);
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
        fontColor: "#fff",
        fontSize: 30,
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

  account = {
    title: '',
    url: '',
    email: '',
    password: '',
  };

  init = async () => {
    try {
      if (this.account.url) {
        await this.login();
        await this.checkin();
        await this.dataResults();
      }
    } catch (e) {
      console.log(e);
    }
  };

  async login() {
    const url = this.account.url;
    const loginPath =
        url.indexOf('auth/login') != -1 ? 'auth/login' : 'user/_login.php';
    const table = {
      url:
          url.replace(/(auth|user)\/login(.php)*/g, '') +
          loginPath +
          `?email=${this.account.email}&passwd=${this.account.password}&rumber-me=week`,
    };

    const data = await this.$request.post(table, 'STRING');
    try {
      if (
          JSON.parse(data).msg.match(
              /邮箱不存在|邮箱或者密码错误|Mail or password is incorrect/,
          )
      ) {
        this.loginok = false;
        this.notify(this.name, '邮箱或者密码错误');
        console.log('登陆失败');
      } else {
        this.loginok = true;
        console.log('登陆成功');
      }
    } catch (e) {
      console.log(e);
    }
  }

  async checkin() {
    const url = this.account.url;
    let checkinPath =
        url.indexOf('auth/login') != -1 ? 'user/checkin' : 'user/_checkin.php';
    const checkinreqest = {
      url: url.replace(/(auth|user)\/login(.php)*/g, '') + checkinPath,
    };
    const data = await this.$request.post(checkinreqest, 'STRING');
    if (data.match(/\"msg\"\:/)) {
      console.log('签到成功');
      this.dataSource.isCheckIn = true;
    } else {
      console.log('签到失败');
    }
  }

  async dataResults() {
    const url = this.account.url;
    const userPath = url.indexOf('auth/login') != -1
        ? 'user'
        : 'user/index.php';
    const datarequest = {
      url: url.replace(/(auth|user)\/login(.php)*/g, '') + userPath,
    };
    const data = await this.$request.get(datarequest, 'STRING');
    if (data.match(/login|请填写邮箱|登陆/)) {
      this.loginok = false;
    } else {
      let resultData = '';
      let result = [];
      if (data.match(/theme\/malio/)) {
        let flowInfo = data.match(/trafficDountChat\s*\(([^\)]+)/);
        if (flowInfo) {
          let flowData = flowInfo[1].match(/\d[^\']+/g);
          let usedData = flowData[0];
          let todatUsed = flowData[1];
          let restData = flowData[2];
          this.dataSource.restData = `${flowData[1]}`;
          this.dataSource.usedData = `${flowData[0]}`;
          this.dataSource.todayUsed = `${flowData[2]}`;
          result.push(
              `今日：${todatUsed}\n已用：${usedData}\n剩余：${restData}`,
          );
        }
        let userInfo = data.match(/ChatraIntegration\s*=\s*({[^}]+)/);
        if (userInfo) {
          let user_name = userInfo[1].match(/name.+'(.+)'/)[1];
          let user_class = userInfo[1].match(/Class.+'(.+)'/)[1];
          let class_expire = userInfo[1].match(/Class_Expire.+'(.+)'/)[1];
          let money = userInfo[1].match(/Money.+'(.+)'/)[1];
          result.push(
              `用户名：${user_name}\n用户等级：lv${user_class}\n余额：${money}\n到期时间：${class_expire}`,
          );
        }
        if (result.length != 0) {
          resultData = result.join('\n\n');
        }
      } else {
        let todayUsed = data.match(/>*\s*今日(已用|使用)*[^B]+/);
        if (todayUsed) {
          todayUsed = this.flowFormat(todayUsed[0]);
          result.push(`今日：${todayUsed}`);
          this.dataSource.todayUsed = `${todayUsed}`;
        } else {
          this.dataSource.todayUsed = `0`;
          result.push(`今日已用获取失败`);
        }
        let usedData = data.match(
            /(Used Transfer|>过去已用|>已用|>总已用|\"已用)[^B]+/,
        );
        if (usedData) {
          usedData = this.flowFormat(usedData[0]);
          result.push(`已用：${usedData}`);
          this.dataSource.usedData = `${usedData}`;
        } else {
          this.dataSource.usedData = `0`;
          result.push(`累计使用获取失败`);
        }
        let restData = data.match(
            /(Remaining Transfer|>剩余流量|>流量剩余|>可用|\"剩余)[^B]+/,
        );
        if (restData) {
          restData = this.flowFormat(restData[0]);
          result.push(`剩余：${restData}`);
          this.dataSource.restData = `${restData}`;
        } else {
          this.dataSource.restData = `0`;
          result.push(`剩余流量获取失败`);
        }
        resultData = result.join('\n');
      }
      console.log(resultData);
    }
  }

  flowFormat(data) {
    data = data.replace(/\d+(\.\d+)*%/, '');
    let flow = data.match(/\d+(\.\d+)*\w*/);
    return flow[0];
  }

  translateFlow(value) {
    const unit = [
      {unit: 'T', value: 1024 * 1024},
      {unit: 'G', value: 1024},
      {unit: 'M', value: 1},
      {unit: 'K', value: 1 / 1024},
    ];
    const data = {unit: '', value: parseFloat(value)};
    unit.forEach(item => {
      if (value.indexOf(item.unit) > -1) {
        data.unit = item.unit;
        data.value = Math.floor((parseFloat(value) * item.value) * 100) / 100;
      }
    });

    return data;
  }

  createChart = async (size, chart) => {
    const url = `https://quickchart.io/chart?w=${size.w}&h=${size.h}&f=png&c=${encodeURIComponent(
        chart)}`;
    return await this.$request.get(url, 'IMG');
  };

  setContent = async (w, size, viewSize) => {

    const rest = this.translateFlow(this.dataSource.restData);
    const use = this.translateFlow(this.dataSource.usedData);
    const today = this.translateFlow(this.dataSource.todayUsed);
    const total = rest.value + use.value;
    const data1 = Math.floor(rest.value / total * 100);
    const data2 = Math.floor(use.value / total * 100);
    const data3 = Math.floor((today.value / total) * 100);
    const {template1, template2, template3} = this.chartConfig([
      data1, data2, data3,
    ], [this.color1, this.color2, this.color3], this.dataSource.todayUsed);

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
    stackIcon.centerAlignContent();
    stackIcon.size = new Size(15, 15);
    stackIcon.cornerRadius = 50;
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
    stackViewIcon.cornerRadius = 50;
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
    const calendar = SFSymbol.named('calendar');
    const imgCalendar = stackRight.addImage(calendar.image);
    imgCalendar.imageSize = new Size(12, 12);
    imgCalendar.tintColor = new Color('#00b800');
    stackRight.addSpacer(5);
    this.provideText(
        this.dataSource.isCheckIn ? '已签' : '未签', stackRight, title);

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
      value: this.dataSource.restData,
      label: '剩余',
      color: this.color1,
    });

    stackFooter.addSpacer();

    const stackFooterRight = stackFooter.addStack();
    this.setFooterCell(stackFooterRight, {
      value: this.dataSource.usedData,
      label: '累计',
      color: this.color3,
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
          value: this.dataSource.isCheckIn ? '已签到' : '未签到',
          isImg: true,
        });
    await this.setLabelCell(
        stackRight,
        {
          icon: this.gradient(this.color3),
          title: '今日',
          value: this.dataSource.todayUsed,
        },
    );
    await this.setLabelCell(
        stackRight,
        {
          icon: this.gradient(this.color2),
          title: '累计',
          value: this.dataSource.usedData,
        },
    );
    await this.setLabelCell(
        stackRight,
        {
          icon: this.gradient(this.color1),
          title: '剩余',
          value: this.dataSource.restData,
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
    if (config.runsInApp) {
      this.registerAction('默认账号', this.actionSettings);
      this.registerAction('清除账号', this.deletedVpn);
      this.registerAction('新增账号', async () => {
        const account = await this.setAlertInput(
            '添加账号', '添加账号数据，添加完成之后请去设置默认账号', {
              title: '机场名',
              icon: '图标',
              url: '登陆地址',
              email: '邮箱账号',
              password: '密码',
            }, false);
        if (!this.settings.dataSource) this.settings.dataSource = [];
        if (!account) return;
        if (account.title && account.url && account.email && account.password) {
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
    if (this.settings.dataSource && this.settings.dataSource[index] && index !==
        false) {
      this.account = this.settings[index];
    }
  };

  async actionSettings() {
    try {
      const table = new UITable();
      const dataSource = this.settings.dataSource || [];
      dataSource.map((t, index) => {
        const r = new UITableRow();
        r.addText(`parameter：${index}  机场名：${t.title}     账号：${t.email}`);
        r.onSelect = (n) => {
          this.settings.account = t;
          this.notify(t.title, `默认账号设置成功\n账号：${t.email}`);
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
        r.addText(`❌   机场名：${t.title}     账号：${t.email}`);
        r.onSelect = (n) => {
          dataSource.splice(index, 1);
          this.settings.dataSource = dataSource;
          this.notify(t.title, `❌\n账号：${t.email}`);
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
