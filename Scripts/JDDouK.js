// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: chart-line;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '京东豆收支';
    this.en = 'JDDouK';
    this.rangeDay = 5; // 天数范围配置
    this.maxDate = parseInt(this.settings.maxDate) || 12; // 显示最大天数
    this.forceCache = false; // 重置缓存
    this.JDRun(module.filename, args);
  }

  drawContext = new DrawContext();
  widgetFamily = 'medium';
  rangeTimer = {};
  timerKeys = [];
  isRender = false;
  JDCookie = {
    cookie: '',
    userName: '',
  };
  CookiesData = [];
  beanCount = 0;

  chartConfig = (labels = [], datas = []) => {
    const color = `#${this.widgetColor.hex}`;
    let template;
    let path = this.FILE_MGR.documentsDirectory();
    const name = `/${this.en}Template`;
    path = path + name + '.js';
    if (this.FILE_MGR.fileExists(path)) {
      template = require('.' + name);
    } else {
      template = `
{
  'type': 'bar',
  'data': {
    'labels': __LABELS__,
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
    template = template.replace('__DATAS__', `${JSON.stringify(datas)}`);
    return template;
  };

  init = async () => {
    try {
      if (!this.JDCookie.cookie) return;
      if (Keychain.contains(this.CACHE_KEY) && !this.forceCache) {
        this.rangeTimer = JSON.parse(Keychain.get(this.CACHE_KEY));

        const timerKeys = Object.keys(this.rangeTimer);
        if (timerKeys.length >= this.maxDate) {
          for (let i = 0; i < timerKeys.length - this.maxDate; i++) {
            delete this.rangeTimer[timerKeys[i]];
          }
          Keychain.set(this.CACHE_KEY, JSON.stringify(this.rangeTimer));
        }
        const date = new Date();
        const year = date.getFullYear();
        let month = date.getMonth() + 1;
        month = month >= 10 ? month : `0${month}`;
        let day = date.getDate();
        day = day >= 10 ? day : `0${day}`;
        const today = `${year}-${month}-${day}`;
        this.rangeTimer[today] = 0;
        this.timerKeys = [today];
      } else {
        this.rangeTimer = this.getDay(this.rangeDay);
        this.timerKeys = Object.keys(this.rangeTimer);
      }
      await this.getAmountData();
    } catch (e) {
      console.log(e);
    }
  };

  getAmountData = async () => {
    let i = 0,
      page = 1;
    do {
      const response = await this.getJingBeanBalanceDetail(page);
      const result = response.code === '0';
      console.log(`第${page}页：${result ? '请求成功' : '请求失败'}`);
      if (response.code === '3') {
        i = 1;
        console.log(response);
      }
      if (response && result) {
        page++;
        let detailList = response.jingDetailList;
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const dates = item.date.split(' ');
            if (this.timerKeys.indexOf(dates[0]) > -1) {
              const amount = Number(item.amount);
              this.rangeTimer[dates[0]] += amount;
            } else {
              i = 1;
              this.isRender = true;
              Keychain.set(this.CACHE_KEY, JSON.stringify(this.rangeTimer));
              break;
            }
          }
        }
      }
    } while (i === 0);
  };

  getDay(dayNumber) {
    let data = {};
    let i = dayNumber;
    do {
      const today = new Date();
      const year = today.getFullYear();
      const targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * i;
      today.setTime(targetday_milliseconds); //注意，这行是关键代码
      let month = today.getMonth() + 1;
      month = month >= 10 ? month : `0${month}`;
      let day = today.getDate();
      day = day >= 10 ? day : `0${day}`;
      data[`${year}-${month}-${day}`] = 0;
      i--;
    } while (i >= 0);
    return data;
  }

  getJingBeanBalanceDetail = async (page) => {
    try {
      const options = {
        url: `https://bean.m.jd.com/beanDetail/detail.json`,
        body: `page=${page}`,
        headers: {
          Accept: 'application/json,text/plain, */*',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'zh-cn',
          Connection: 'keep-alive',
          Cookie: this.JDCookie.cookie,
          Referer: 'https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2',
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        },
      };
      return await this.$request.post(options.url, options);
    } catch (e) {
      console.log(e);
    }
  };

  createChart = async () => {
    let labels = [],
      data = [];
    Object.keys(this.rangeTimer).forEach((month) => {
      const value = this.rangeTimer[month];
      const arrMonth = month.split('-');
      labels.push(`${arrMonth[1]}.${arrMonth[2]}`);
      data.push(value);
    });
    const chartStr = this.chartConfig(labels, data);
    console.log(chartStr);
    const url = `https://quickchart.io/chart?w=580&h=190&f=png&c=${encodeURIComponent(
      chartStr,
    )}`;
    return await this.$request.get(url, 'IMG');
  };

  renderSmall = async (w) => {
    return await this.renderLarge(w);
  };

  renderLarge = async (w) => {
    const text = w.addText('暂不支持');
    text.font = Font.boldSystemFont(20);
    text.textColor = this.widgetColor;
  };

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    await this.getWidgetBackgroundImage(widget);
    const header = widget.addStack();
    if (this.widgetFamily !== 'small') {
      await this.renderJDHeader(header);
    } else {
      await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    }
    widget.addSpacer(10);
    const stackChart = widget.addStack();
    if (this.widgetFamily === 'medium') {
      const chart = await this.createChart();
      stackChart.addImage(chart);
    } else if (this.widgetFamily === 'large') {
      await this.renderLarge(widget);
    } else {
      await this.renderSmall(widget);
    }
    widget.addStack();
    return widget;
  }

  opacity(str, opacity = 0.8) {
    let sColor = str.toLowerCase();
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = '#';
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      let sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
      }
      return `rgba(${sColorChange.join(',')},${opacity})`;
    }
    return sColor;
  }

  jdWebView = async () => {
    const webView = new WebView();
    const url =
      'https://mcr.jd.com/credit_home/pages/index.html?btPageType=BT&channelName=024';
    await webView.loadURL(url);
    await webView.present(false);
    const req = new Request(
      'https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew',
    );
    req.method = 'POST';
    req.body =
      'reqData={"clientType":"ios","clientVersion":"13.2.3","deviceId":"","environment":"3"}';
    await req.loadJSON();
    const cookies = req.response.cookies;
    const account = { username: '', cookie: '' };
    const cookie = [];
    cookies.forEach((item) => {
      const value = `${item.name}=${item.value}`;
      if (item.name === 'pt_key') cookie.push(value);
      if (item.name === 'pt_pin') {
        account.username = item.value;
        cookie.push(value);
      }
    });
    account.cookie = cookie.join('; ');
    console.log(account);

    if (account.cookie) {
      this.settings = { ...this.settings, ...account };
      this.saveSettings(false);
      console.log(`${this.name}: cookie获取成功，请关闭窗口！`);
      this.notify(this.name, 'cookie获取成功，请关闭窗口！');
    }
  };

  JDRun = (filename, args) => {
    if (config.runsInApp) {
      this.registerAction('显示天数', async () => {
        await this.setAlertInput('设置显示天数周期范围', false, {
          maxDate: '天数',
        });
      });
      this.registerAction('基础设置', this.setWidgetConfig);
      this.registerAction('账号设置', async () => {
        const index = await this.generateAlert('设置账号信息', [
          '网站登录',
          '手动输入',
        ]);
        if (index === 0) {
          await this.jdWebView();
        } else {
          await this.setAlertInput('账号设置', '京东账号 Ck', {
            username: '昵称',
            cookie: 'Cookie',
          });
        }
      });
      this.registerAction('代理缓存', this.actionSettings);
    }
    let _md5 = this.md5(filename + this.en);

    this.logo =
      'https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png';
    this.JDindex =
      typeof args.widgetParameter === 'string'
        ? parseInt(args.widgetParameter)
        : false;
    try {
      const cookieData = this.settings.cookieData;
      if (this.JDindex !== false && cookieData[this.JDindex]) {
        this.JDCookie = cookieData[this.JDindex];
      } else {
        this.JDCookie.userName = this.settings.username;
        this.JDCookie.cookie = this.settings.cookie;
      }
      if (!this.JDCookie.cookie) throw '京东 CK 获取失败';
      this.JDCookie.userName = decodeURI(this.JDCookie.userName);
      this.CACHE_KEY = `cache_${_md5}_` + this.JDCookie.userName;

      return true;
    } catch (e) {
      this.notify('错误提示', e);
      return false;
    }
  };

  renderJDHeader = async (header) => {
    header.centerAlignContent();
    await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    header.addSpacer();
    const headerMore = header.addStack();
    headerMore.url = 'https://home.m.jd.com/myJd/home.action';
    headerMore.setPadding(1, 10, 1, 10);
    headerMore.cornerRadius = 10;
    headerMore.backgroundColor = new Color('#fff', 0.5);
    const textItem = headerMore.addText(this.JDCookie.userName);
    textItem.font = Font.boldSystemFont(12);
    textItem.textColor = this.widgetColor;
    textItem.lineLimit = 1;
    textItem.rightAlignText();
    return header;
  };

  // 加载京东 Ck 节点列表
  _loadJDCk = async () => {
    try {
      const CookiesData = await this.getCache('CookiesJD');
      this.CookiesData = [];
      if (CookiesData) this.CookiesData = this.transforJSON(CookiesData);
      const CookieJD = await this.getCache('CookieJD');
      if (CookieJD) {
        const userName = CookieJD.match(/pt_pin=(.+?);/)[1];
        const ck1 = {
          cookie: CookieJD,
          userName,
        };
        this.CookiesData.push(ck1);
      }
      const Cookie2JD = await this.getCache('CookieJD2');
      if (Cookie2JD) {
        const userName = Cookie2JD.match(/pt_pin=(.+?);/)[1];
        const ck2 = {
          cookie: Cookie2JD,
          userName,
        };
        this.CookiesData.push(ck2);
      }
      return true;
    } catch (e) {
      console.log(e);
      this.CookiesData = [];
      return false;
    }
  };

  async actionSettings() {
    try {
      const table = new UITable();
      if (!(await this._loadJDCk())) throw 'BoxJS 数据读取失败';
      // 如果是节点，则先远程获取
      this.settings.cookieData = this.CookiesData;
      this.saveSettings(false);
      this.CookiesData.map((t, index) => {
        const r = new UITableRow();
        r.addText(`parameter：${index}    ${t.userName}`);
        r.onSelect = (n) => {
          this.settings.username = t.userName;
          this.settings.cookie = t.cookie;
          this.saveSettings();
        };
        table.addRow(r);
      });
      let body = '京东 Ck 缓存成功，根据下标选择相应的 Ck';
      if (this.settings.cookie) {
        body += '，或者使用当前选中Ck：' + this.settings.username;
      }
      this.notify(this.name, body);
      table.present(false);
    } catch (e) {
      console.log(e);
    }
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, '', false); //远程开发环境
