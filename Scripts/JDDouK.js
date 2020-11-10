// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: chart-line;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "京东豆走势";
    this.en = "JDDouK";
    this.JDRun(module.filename, args);
  }

  drawContext = new DrawContext();

  forceCache = false; // 重置缓存
  rangeDay = 5; // 天数范围配置
  widgetFamily = "medium";
  rangeTimer = {};
  timerKeys = [];
  isRender = false;
  prefix = "boxjs.net";
  JDCookie = {
    cookie: "",
    userName: "",
  };
  CookiesData = [];
  beanCount = 0;
  widgetHeight = 338;
  widgetWidth = 720;
  lineWeight = 2; // 线的宽度
  vertLineWeight = 0.5; // 竖线的宽度
  graphLow = 280;
  graphHeight = 160;
  spaceBetweenDays = 120; // 间距
  widgetColor = Color.dynamic(Color.black(), Color.white());

  accentColor1 = new Color("#33cc33", 1);
  accentColor2 = Color.lightGray();

  drawTextR(text, rect, color, font) {
    this.drawContext.setFont(font);
    this.drawContext.setTextColor(color);
    this.drawContext.drawTextInRect(new String(text).toString(), rect);
  }

  drawLine(point1, point2, width, color) {
    const path = new Path();
    path.move(point1);
    path.addLine(point2);
    this.drawContext.addPath(path);
    this.drawContext.setStrokeColor(color);
    this.drawContext.setLineWidth(width);
    this.drawContext.strokePath();
  }

  init = async () => {
    try {
      await this.TotalBean();
      this.rangeTimer = this.getDay(this.rangeDay);
      if (Keychain.contains(this.CACHE_KEY) && !this.forceCache) {
        const data = JSON.parse(Keychain.get(this.CACHE_KEY));
        Object.keys(data).forEach((key) => {
          this.rangeTimer[key] = data[key];
        });
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
    const timer = new Timer();
    timer.repeats = true;
    timer.timeInterval = 1000;
    timer.schedule(async () => {
      const response = await this.getJingBeanBalanceDetail(page);
      console.log(
        `第${page}页：${response.code === "0" ? "请求成功" : "请求失败"}`
      );
      if (response && response.code === "0") {
        page++;
        let detailList = response.jingDetailList;
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const dates = item.date.split(" ");
            if (this.timerKeys.indexOf(dates[0]) > -1) {
              const amount = Number(item.amount);
              this.rangeTimer[dates[0]] += amount;
            } else {
              timer.invalidate();
              this.isRender = true;
              Keychain.set(this.CACHE_KEY, JSON.stringify(this.rangeTimer));
              await this.render();
              break;
            }
          }
        }
      }
    });
  };

  TotalBean = async () => {
    const options = {
      headers: {
        Accept: "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        Connection: "keep-alive",
        Cookie: this.JDCookie.cookie,
        Referer: "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
      },
    };
    const url = "https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2";
    const request = new Request(url, { method: "POST" });
    request.body = options.body;
    request.headers = options.headers;

    const response = await request.loadJSON();
    if (response.retcode === 0) {
      this.beanCount = response.base.jdNum;
    } else {
      console.log("京东服务器返回空数据");
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
          "X-Requested-With": `XMLHttpRequest`,
          Connection: `keep-alive`,
          "Accept-Encoding": `gzip, deflate, br`,
          "Content-Type": `application/x-www-form-urlencoded; charset=UTF-8`,
          Origin: `https://bean.m.jd.com`,
          "User-Agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15`,
          Cookie: this.JDCookie.cookie,
          Host: `bean.m.jd.com`,
          Referer: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`,
          "Accept-Language": `zh-cn`,
          Accept: `application/json, text/javascript, */*; q=0.01`,
        },
      };

      return await this.$request.post(options.url, options);
    } catch (e) {
      console.log(e);
    }
  };

  drawImage = async () => {
    this.drawContext.size = new Size(this.widgetWidth, this.widgetHeight);
    this.drawContext.opaque = false;
    this.drawContext.setFont(Font.mediumSystemFont(26));
    this.drawContext.setTextColor(this.widgetColor);
    this.drawContext.setTextAlignedCenter();
    const logo = await this.$request.get(this.logo, "IMG");
    this.drawContext.drawImageInRect(logo, new Rect(25, 25, 28, 28));
    this.drawContext.drawText(`京东豆收支`, new Point(65, 25));
    this.drawContext.drawText(`${this.beanCount}🐶`, new Point(250, 27));
    this.drawContext.drawText(
      `${this.JDCookie.userName}`,
      new Point(this.widgetWidth - 200, 25)
    );

    let min, max, diff;
    const rangeKeys = Object.keys(this.rangeTimer);
    for (let i = 0; i < rangeKeys.length; i++) {
      const key = rangeKeys[i];
      let aux = this.rangeTimer[key];
      min = aux < min || min == undefined ? aux : min;
      max = aux > max || max == undefined ? aux : max;
    }
    diff = max - min;
    const highestIndex = rangeKeys.length - 1;

    for (let i = 0, j = highestIndex; i < rangeKeys.length; i++, j--) {
      const rangeKey = rangeKeys[i];
      const date = rangeKey.split("-");
      const day = `${date[1]}.${date[2]}`;
      const rangeItem = this.rangeTimer[rangeKey];

      const cases = rangeItem;
      const delta = (cases - min) / diff;

      if (i < highestIndex) {
        const nextRange = this.rangeTimer[rangeKeys[i + 1]];
        const nextCases = nextRange;
        const nextDelta = (nextCases - min) / diff;
        const point1 = new Point(
          this.spaceBetweenDays * i + 50,
          this.graphLow - this.graphHeight * delta
        );
        const point2 = new Point(
          this.spaceBetweenDays * (i + 1) + 50,
          this.graphLow - this.graphHeight * nextDelta
        );
        this.drawLine(point1, point2, this.lineWeight, this.accentColor1);
      }

      // Vertical Line
      const point1 = new Point(
        this.spaceBetweenDays * i + 50,
        this.graphLow - this.graphHeight * delta
      );
      const point2 = new Point(this.spaceBetweenDays * i + 50, this.graphLow);
      this.drawLine(point1, point2, this.vertLineWeight, this.accentColor2);

      const casesRect = new Rect(
        this.spaceBetweenDays * i + 20,
        this.graphLow - 40 - this.graphHeight * delta,
        60,
        23
      );

      const dayRect = new Rect(
        this.spaceBetweenDays * i + 27,
        this.graphLow + 10,
        60,
        23
      );

      const color = cases > 0 ? this.widgetColor : Color.red();
      this.drawTextR(cases, casesRect, color, Font.systemFont(22));
      this.drawTextR(day, dayRect, color, Font.systemFont(22));
    }
  };

  setWidget = async (widget) => {
    return widget;
  };

  renderSmall = async (w) => {
    return await this.renderLarge(w);
  };

  renderLarge = async (w) => {
    const text = w.addText("暂不支持");
    text.font = Font.boldSystemFont(20);
    text.textColor = this.widgetColor;
    return w;
  };

  renderMedium = async (w) => {
    return await this.setWidget(w);
  };

  renderWidget = async (widget) => {
    try {
      await this.drawImage();
      widget.backgroundImage = this.drawContext.getImage();
      widget.url =
        "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean";
      console.log("数据读取完毕，加载组件");
      return widget;
    } catch (e) {
      console.log(e);
    }
  };
  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    if (!this.isRender) await this.init();
    const widget = new ListWidget();
    let w;
    if (this.widgetFamily === "medium") {
      if (this.isRender) {
        await this.renderWidget(widget);
      } else {
        await this.renderHeader(widget, this.logo, this.name, this.widgetColor);
        widget.addSpacer(10);
        const loadingItem = widget.addText("loading...");
        loadingItem.textColor = this.widgetColor;
        widget.addSpacer();
      }
      if (config.runsInWidget) {
        Script.setWidget(widget);
        Script.complete();
      } else {
        await widget.presentMedium();
      }
      return;
    } else if (this.widgetFamily === "large") {
      w = await this.renderLarge(widget);
    } else {
      w = await this.renderSmall(widget);
    }
    Script.setWidget(w);
    Script.complete();
  }

  JDRun = (filename, args) => {
    if (config.runsInApp) {
      // this.registerAction("设置背景图", this.setWidgetBackground);
      this.registerAction("输入京东 CK", this.inputJDck);
      this.registerAction("选择京东 CK", this.actionSettings);
    }
    let _md5 = this.md5(filename + this.en);
    this.CACHE_KEY = `cache_${_md5}`;
    this.JDindex = parseInt(args.widgetParameter) || undefined;
    this.logo = "https://raw.githubusercontent.com/Orz-3/task/master/jd.png";
    try {
      this.JDCookie = this.settings[this.en] || {
        cookie: "",
        userName: "",
      };
      if (this.JDindex !== undefined) {
        this.JDCookie = this.settings.JDAccount[this.JDindex];
      }
      if (!this.JDCookie.cookie) {
        throw "京东 CK 获取失败";
      }
      return true;
    } catch (e) {
      this.notify("错误提示", e);
      return false;
    }
  };

  // 加载京东 Ck 节点列表
  _loadJDCk = async () => {
    try {
      const CookiesData = await this.getCache("CookiesJD");
      if (CookiesData) {
        this.CookiesData = this.transforJSON(CookiesData);
      }
      const CookieJD = await this.getCache("CookieJD");
      if (CookieJD) {
        const userName = CookieJD.match(/pt_pin=(.+?);/)[1];
        const ck1 = {
          cookie: CookieJD,
          userName,
        };
        this.CookiesData.push(ck1);
      }
      const Cookie2JD = await this.getCache("Cookie2JD");
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
    a.title = "京东账号 Ck";
    a.message = "手动输入京东 Ck";
    a.addTextField("昵称", this.JDCookie.userName);
    a.addTextField("Cookie", this.JDCookie.cookie);
    a.addAction("确定");
    a.addCancelAction("取消");
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
      if (!(await this._loadJDCk())) throw "BoxJS 数据读取失败";
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
      let body = "京东 Ck 缓存成功，根据下标选择相应的 Ck";
      if (this.settings[this.en]) {
        body += "，或者使用当前选中Ck：" + this.settings[this.en].userName;
      }
      this.notify(this.name, body);
      table.present(false);
    } catch (e) {
      this.notify(this.name, e);
    }
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, "", false); //远程开发环境
