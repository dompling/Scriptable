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
    this.name = 'Vpn';
    this.en = 'vpnBoard';
    this.CACHE_KEY = this.md5(`dataSouce_${this.en}`);
    this.Run();
  }

  useBoxJS = false;
  today = '';
  loginok = false;
  dataSource = {
    restData: '0',
    usedData: '0',
    todayUsed: '0',
    isCheckIn: false,
  };

  chartConfig = (labels = [], datas = [], text = []) => {
    const color = `#${this.widgetColor.hex}`;
    let template;
    let path = this.FILE_MGR.documentsDirectory();
    path = path + '/VPNBoardTemplate.js';
    if (this.FILE_MGR.fileExists(path)) {
      template = require('./VPNBoardTemplate');
    } else {
      template = `
{
  'type': 'bar',
  'data': {
    'labels': __LABELS__,
    'tips': __TEXT__,
    'datasets': [
      {
        type: 'line',
        backgroundColor: '#fff',
        borderColor: getGradientFillHelper('vertical', ['#c8e3fa', '#e62490']),
        'borderWidth': 2,
        pointRadius: 5,
        'fill': false,
        'data': __DATAS__,
      },
    ],
  },
  'options': {
      plugins: {
        datalabels: {
          display: true,
          align: 'top',
          color: __COLOR__,
          font: {
             size: '16'
          },
          formatter: function(value, context) {
            return context.chart.data.tips[context.dataIndex];
          }
        },
      },
      layout: {
          padding: {
              left: 0,
              right: 0,
              top: 30,
              bottom: 5
          }
      },
      responsive: true,
      maintainAspectRatio: true,
      'legend': {
        'display': false,
      },
      'title': {
        'display': false,
      },
      scales: {
        xAxes: [ // X 轴线
          {
            gridLines: {
              display: false,
              color: __COLOR__,
            },
            ticks: {
              display: true, 
              fontColor: __COLOR__,
              fontSize: '16',
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              display: false,
              beginAtZero: true,
              fontColor: __COLOR__,
            },
            gridLines: {
              borderDash: [7, 5],
              display: false,
              color: __COLOR__,
            },
          },
        ],
      },
    },
 }`;
      const content = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: ellipsis-v;
const template = \`${template}\`;
module.exports = template;`;
      this.FILE_MGR.writeString(path, content);
    }
    template = template.replaceAll('__COLOR__', `'${color}'`);
    template = template.replace('__LABELS__', `${JSON.stringify(labels)}`);
    template = template.replace('__TEXT__', `${JSON.stringify(text)}`);
    template = template.replace('__DATAS__', `${JSON.stringify(datas)}`);
    return template;
  };

  account = {
    title: '',
    url: '',
    email: '',
    password: '',
  };

  range = {};
  max = 6;

  init = async () => {
    try {
      await this.login();
      await this.checkin();
      await this.dataResults();
      if (Keychain.contains(this.CACHE_KEY)) {
        this.range = JSON.parse(Keychain.get(this.CACHE_KEY));
      }
      const date = new Date();
      const format = new DateFormatter();
      format.dateFormat = 'MM.dd';
      const dateDay = format.string(date);
      this.range[dateDay] = this.dataSource;
      const rangeKey = Object.keys(this.range);
      if (rangeKey.length > this.max) {
        for (let i = 0; i <= rangeKey.length - this.max; i++) {
          delete this.range[rangeKey[i]];
        }
      }
      Keychain.set(this.CACHE_KEY, JSON.stringify(this.range));
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
          this.dataSource.todayUsed = `${flowData[1]}`;
          this.dataSource.usedData = `${flowData[0]}`;
          this.dataSource.restData = `${flowData[2]}`;
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
      {unit: 'T', value: 1024},
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

  createChart = async (size) => {
    let labels = [], data = [], text = [];
    const rangeKey = Object.keys(this.range);
    rangeKey.forEach((key) => {
      labels.push(key);
      const value = this.range[key].todayUsed.toLocaleUpperCase();
      const valueUnit = this.translateFlow(value);
      data.push(valueUnit.value);
      text.push(value);
    });
    if (this.widgetSize === 'small') {
      labels = labels.slice(-3);
      data = data.slice(-3);
    }
    const chart = this.chartConfig(labels, data, text);
    const url = `https://quickchart.io/chart?w=${size.w}&h=${size.h}&f=png&c=${encodeURIComponent(
        chart)}`;
    return await this.$request.get(url, 'IMG');
  };

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
    this.provideText(this.dataSource.isCheckIn ? '已签到' : '未签到', right, vpnFlow);

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
    this.provideText(data.value, stackValue, textBattery);
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

  setContent = async (w, size) => {
    const imageFlow = await this.createChart(size);
    const stackContent = w.addStack();
    stackContent.addImage(imageFlow);
  };

  renderSmall = async (w) => {
    await this.setHeader(w, 10);
    await this.setContent(w, {w: 195, h: 85});
    this.createDivider(w);
    this.setFooter(w, {label: 6, value: 8});
    return w;
  };

  renderMedium = async (w) => {
    await this.setHeader(w, 16);
    await this.setContent(w, {w: 390, h: 85});
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
        r.addText(`机场名：${t.title}     账号：${t.email}`);
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
