// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: yen-sign;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '京东豆';
    this.en = 'JDDou';
    this.JDRun(module.filename, args);
  }

  beanCount = 0;
  incomeBean = 0;
  expenseBean = 0;
  timerKeys = [];

  JDCookie = {
    cookie: '',
    userName: '',
  };
  CookiesData = [];

  init = async () => {
    try {
      await this.TotalBean();
      this.timerKeys = this.getDay(1);
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
      console.log(
        `第${page}页：${response.code === '0' ? '请求成功' : '请求失败'}`,
      );
      if (response.code === '3') {
        i = 1;
        console.log(response);
      }
      if (response && response.code === '0') {
        page++;
        let detailList = response.jingDetailList;
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const dates = item.date.split(' ');
            if (this.timerKeys.indexOf(dates[0]) > -1) {
              if (this.timerKeys[0] === dates[0]) {
                const amount = Number(item.amount);
                if (amount > 0) this.incomeBean += amount;
                if (amount < 0) this.expenseBean += amount;
              }
            } else {
              i = 1;
              break;
            }
          }
        }
      }
    } while (i === 0);
  };

  getDay(dayNumber) {
    let data = [];
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
      data.push(`${year}-${month}-${day}`);
      i--;
    } while (i >= 0);
    return data;
  }

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
    const request = new Request(url, { method: 'POST' });
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

  transforJSON = (str) => {
    if (typeof str == 'string') {
      try {
        return JSON.parse(str);
      } catch (e) {
        console.log(e);
        return [];
      }
    }
    console.log('It is not a string!');
  };

  setContainer = async (container, { icon, text, desc }) => {
    container.layoutVertically();
    container.centerAlignContent();

    const viewer = container.addStack();
    viewer.size = new Size(90, 25);
    const jdD_icon = await this.$request.get(icon, 'IMG');
    const imageElemView = viewer.addImage(jdD_icon);
    imageElemView.centerAlignImage();
    imageElemView.imageSize = new Size(25, 25);
    container.addSpacer(10);

    const textview = container.addStack();
    textview.size = new Size(90, 30);
    const titleTextItem = textview.addText(text);
    titleTextItem.font = Font.boldSystemFont(22);
    titleTextItem.textColor = new Color('#ffef03');
    titleTextItem.centerAlignText();

    const descView = container.addStack();
    descView.size = new Size(90, 30);
    const descTextItem = descView.addText(desc);
    descTextItem.textColor = this.widgetColor;
    descTextItem.font = Font.lightSystemFont(16);
    descTextItem.centerAlignText();

    return container;
  };

  setWidget = async (widget) => {
    const body = widget.addStack();
    body.centerAlignContent();
    body.url = 'https://bean.m.jd.com/';
    const letfContainer = body.addStack();
    await this.setContainer(letfContainer, {
      icon: 'https://gitee.com/scriptableJS/Scriptable/raw/master/JDDou/jdd.png',
      text: `${this.beanCount}`,
      desc: '当前京豆',
    });
    body.addSpacer();
    const centerContainer = body.addStack();
    await this.setContainer(centerContainer, {
      icon: 'https://gitee.com/scriptableJS/Scriptable/raw/master/JDDou/jdd.png',
      text: `+${this.incomeBean}`,
      desc: '昨日收入',
    });
    body.addSpacer();
    const rightContainer = body.addStack();
    await this.setContainer(rightContainer, {
      icon: 'https://gitee.com/scriptableJS/Scriptable/raw/master/JDDou/jdd.png',
      text: `${this.expenseBean}`,
      desc: '昨日支出',
    });
    return widget;
  };

  renderSmall = async (w) => {
    return await this.renderLarge(w);
  };

  renderLarge = async (w) => {
    const text = w.addText('暂不支持');
    text.font = Font.boldSystemFont(20);
    text.textColor = this.widgetColor;
    return w;
  };

  renderMedium = async (w) => {
    return await this.setWidget(w);
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
      await this.renderHeader(header, this.logo, this.name);
    }
    widget.addSpacer(20);
    if (this.widgetFamily === 'medium') {
      widget.url =
        'https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean';
      await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      await this.renderLarge(widget);
    } else {
      await this.renderSmall(widget);
    }
    return widget;
  }

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
    this.CACHE_KEY = `cache_${_md5}`;
    this.JDindex =
      typeof args.widgetParameter === 'string'
        ? parseInt(args.widgetParameter)
        : false;
    this.logo =
      'https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png';
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
      return true;
    } catch (e) {
      this.notify('错误提示', e);
      return false;
    }
  };

  // 加载京东 Ck 节点列表
  _loadJDCk = async () => {
    try {
      const CookiesData = await this.getCache('CookiesJD');
      this.CookiesData = [];
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
