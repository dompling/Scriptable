// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: chart-line;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

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

  chartConfig = {
    'type': 'line',
    'data': {
      'labels': [],
      'datasets': [
        {
          'borderColor': '#ffc107',
          'borderWidth': 2,
          'fill': false,
          'data': [],
        },
      ],
    },
    'options': {
      'responsive': true,
      'legend': {
        'display': false,
      },
      'title': {
        'display': false,
      },
      'tooltips': {
        'enabled': false,
        'mode': 'index',
        'intersect': true,
      },
      scales: {
        xAxes: [ // X 轴线
          {
            gridLines: {
              display: true, // 隐藏 X 轴
              color: '#000',
            },
            ticks: {
              fontColor: '#000',
            },
          },
        ],
        yAxes: [   // y轴轴线
          {
            ticks: {
              beginAtZero: false, // 是否从 0 开始
              fontColor: '#000',
            },
            gridLines: {
              display: false, // 隐藏 Y 轴
              color: '#000',
            },
          },
        ],
      },
    },
  };

  none = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Users',
          data: [],
        },
      ],
    },
  };

  init = async () => {
    try {
      await this.TotalBean();
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
      Object.keys(this.rangeTimer).forEach((month) => {
        const value = this.rangeTimer[month];
        const arrMonth = month.split('-');
        this.chartConfig.data.labels.push(`${arrMonth[1]}.${arrMonth[2]}`);
        this.chartConfig.data.datasets[0].data.push(value);
      });

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

  TotalBean = async () => {
    const options = {
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
    const url = 'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2';
    const request = new Request(url, {method: 'POST'});
    request.body = options.body;
    request.headers = options.headers;

    const response = await request.loadJSON();
    if (response.retcode === 0) {
      this.beanCount = response.base.jdNum;
    } else {
      console.log('京东服务器返回空数据');
    }
    return response;
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
          'X-Requested-With': `XMLHttpRequest`,
          Connection: `keep-alive`,
          'Accept-Encoding': `gzip, deflate, br`,
          'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
          Origin: `https://bean.m.jd.com`,
          'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15`,
          Cookie: this.JDCookie.cookie,
          Host: `bean.m.jd.com`,
          Referer: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`,
          'Accept-Language': `zh-cn`,
          Accept: `application/json, text/javascript, */*; q=0.01`,
        },
      };

      return await this.$request.post(options.url, options);
    } catch (e) {
      console.log(e);
    }
  };

  createChart = async (data) => {
    const chartStr = JSON.stringify(data);
    const url = `https://quickchart.io/chart?w=620&h=200f=png&c=${encodeURIComponent(
        chartStr)}`;
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
      const chart = await this.createChart(this.chartConfig);
      stackChart.addImage(chart);
    } else if (this.widgetFamily === 'large') {
      await this.renderLarge(widget);
    } else {
      await this.renderSmall(widget);
    }
    widget.addStack();
    return widget;
  }

  JDRun = (filename, args) => {
    if (config.runsInApp) {
      this.registerAction('显示天数', async () => {
        await this.setAlertInput('设置显示天数周期范围', false, {maxDate: '天数'});
      });
      this.registerAction('折线颜色', async () => {
        await this.setLightAndDark('折线颜色', false, 'lightLine', 'darkLine');
      });
      this.registerAction('轴线字体', async () => {
        await this.setLightAndDark('轴线字体颜色', false, 'lightAxes', 'darkAxes');
      });
      this.registerAction('基础设置', this.setWidgetConfig);
      this.registerAction('账号设置', this.inputJDck);
      this.registerAction('代理缓存', this.actionSettings);
    }
    let _md5 = this.md5(filename + this.en);
    this.CACHE_KEY = `cache_${_md5}`;
    this.JDindex = parseInt(args.widgetParameter) || undefined;
    this.logo = 'https://raw.githubusercontent.com/Orz-3/task/master/jd.png';
    try {
      this.JDCookie = this.settings[this.en] || {
        cookie: '',
        userName: '',
      };
      if (this.JDindex !== undefined) {
        this.JDCookie = this.settings.JDAccount[this.JDindex];
      }
      if (!this.JDCookie.cookie) {
        throw '京东 CK 获取失败';
      }
      this.JDCookie.userName = decodeURI(this.JDCookie.userName);
      let borderColor = this.chartConfig.data.datasets[0].borderColor;
      let axesColor;
      if (this.isNight) {
        borderColor = this.settings.darkLine || borderColor;
        axesColor = this.settings.darkAxes || '#fff';
      } else {
        borderColor = this.settings.lightLine || borderColor;
        axesColor = this.settings.lightAxes || '#000';
      }
      this.chartConfig.data.datasets[0].borderColor = borderColor;
      this.chartConfig.options.scales.xAxes[0].gridLines.color = axesColor;
      this.chartConfig.options.scales.yAxes[0].gridLines.color = axesColor;
      this.chartConfig.options.scales.xAxes[0].ticks.fontColor = axesColor;
      this.chartConfig.options.scales.yAxes[0].ticks.fontColor = axesColor;
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
      if (CookiesData) {
        this.CookiesData = this.transforJSON(CookiesData);
      }
      const CookieJD = await this.getCache('CookieJD');
      if (CookieJD) {
        const userName = CookieJD.match(/pt_pin=(.+?);/)[1];
        const ck1 = {
          cookie: CookieJD,
          userName,
        };
        this.CookiesData.push(ck1);
      }
      const Cookie2JD = await this.getCache('Cookie2JD');
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

  async inputJDck() {
    const a = new Alert();
    a.title = '京东账号 Ck';
    a.message = '手动输入京东 Ck';
    a.addTextField('昵称', this.JDCookie.userName);
    a.addTextField('Cookie', this.JDCookie.cookie);
    a.addAction('确定');
    a.addCancelAction('取消');
    const id = await a.presentAlert();
    if (id === -1) return;
    this.JDCookie.userName = a.textFieldValue(0);
    this.JDCookie.cookie = a.textFieldValue(1);
    // 保存到本地
    this.settings[this.en] = this.JDCookie;
    this.saveSettings();
  }

  async actionSettings() {
    try {
      const table = new UITable();
      if (!(await this._loadJDCk())) throw 'BoxJS 数据读取失败';
      // 如果是节点，则先远程获取
      this.CookiesData.map((t) => {
        const r = new UITableRow();
        r.addText(t.userName);
        r.onSelect = (n) => {
          this.settings[this.en] = t;
          this.saveSettings();
        };
        table.addRow(r);
      });
      let body = '京东 Ck 缓存成功，根据下标选择相应的 Ck';
      if (this.settings[this.en]) {
        body += '，或者使用当前选中Ck：' + this.settings[this.en].userName;
      }
      this.notify(this.name, body);
      table.present(false);
    } catch (e) {
      this.notify(
          this.name, '', 'BoxJS 数据读取失败，请点击通知查看教程',
          'https://chavyleung.gitbook.io/boxjs/awesome/videos',
      );
    }
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, '', false); //远程开发环境
