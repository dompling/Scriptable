// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: truck;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");
// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "京东物流";
    this.en = "JDWuLiu";
    this.JDRun(module.filename, args);
  }

  prefix = "boxjs.net";
  JDCookie = {
    cookie: "",
    userName: "",
  };
  CookiesData = [];
  orderList = [];
  logistics = [];

  opts = {
    headers: {
      Accept: `*/*`,
      Connection: `keep-alive`,
      Host: `wq.jd.com`,
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1`,
    },
  };

  init = async () => {
    try {
      await this.JDRun(module.filename, args);
      this.opts.headers.Cookie = this.JDCookie.cookie;
      this.orderList = await this.getOrderList();
    } catch (e) {
      console.log(e);
    }
  };

  getOrderList = async () => {
    const url =
      "https://wq.jd.com/bases/orderlist/list?order_type=2&start_page=1&page_size=10";
    const request = new Request("");
    request.url = url;
    request.headers = {
      ...this.opts.headers,
      Referer: `https://wqs.jd.com/order/orderlist_merge.shtml?sceneval=2&orderType=waitReceipt`,
    };
    const response = await request.loadJSON();
    let data = [];
    try {
      data = response.orderList.filter((item) => {
        return item.stateInfo.stateCode === "15";
      });
    } catch (e) {
      console.log(e);
    }
    // 判断数据是否为空（加载失败）
    if (!data) {
      // 判断是否有缓存
      if (Keychain.contains(this.CACHE_KEY)) {
        let cache = Keychain.get(this.CACHE_KEY);
        return JSON.parse(cache);
      } else {
        // 刷新
        return [];
      }
    }
    // 存储缓存
    Keychain.set(this.CACHE_KEY, JSON.stringify(data));
    return data;
  };

  setListCell = async (cell, data) => {
    const { productList = [], orderDetailLink = "", progressInfo = {} } = data;
    const product = productList[0];
    let body = cell.addStack();
    body.url = orderDetailLink;
    if (this.widgetFamily !== "small") {
      const imageView = body.addStack();
      imageView.size = new Size(75, 75);
      imageView.cornerRadius = 5;
      imageView.url = product.skuLink;
      const image = await this.$request.get(product.image, "IMG");
      imageView.backgroundImage = image;
      body.addSpacer(10);
    }

    const textView = body.addStack();
    textView.url = orderDetailLink;
    textView.layoutVertically();

    const descText = textView.addText(progressInfo.content);
    descText.font = Font.boldSystemFont(16);
    descText.textColor = this.widgetColor;
    descText.lineLimit = 2;

    textView.addSpacer(10);

    const timerText = textView.addText(progressInfo.tip);
    timerText.font = Font.lightSystemFont(14);
    timerText.textColor = this.widgetColor;
    timerText.lineLimit = 1;

    cell.addSpacer(10);
    return cell;
  };

  setWidget = async (body) => {
    body.url =
      "https://wqs.jd.com/order/orderlist_merge.shtml?sceneval=2&orderType=waitReceipt";
    const container = body.addStack();
    container.layoutVertically();
    if (!this.orderList.length) {
      if (this.widgetFamily !== "small") {
        const bg = await this.$request.get(
          "https://raw.githubusercontent.com/dompling/Scriptable/master/JDWuLiu/cart.png",
          "IMG"
        );
        const cartView = container.addStack();
        cartView.size = new Size(285, 50);
        bg.imageSize = new Size(75, 50);
        cartView.addImage(bg);
      }
      let textItem = container.addStack();
      if (this.widgetFamily !== "small") textItem.size = new Size(300, 20);
      textItem.addText("空空如也");
      textItem.textColor = this.widgetColor;
      textItem.font = Font.boldSystemFont(15);
      textItem.lineLimit = 1;
      body.addSpacer();
      return body;
    }
    let orderIndex = 0;
    for (let index = 0; index < this.orderList.length; index++) {
      if (this.widgetFamily !== "large" && index === 1) {
        return body;
      }
      if (index === 3) {
        return body;
      }
      orderIndex = index;
      const data = this.orderList[index];
      let listItem = container.addStack();
      await this.setListCell(listItem, data);
      container.addSpacer(10);
    }
    body.addSpacer();
    return body;
  };

  renderSmall = async (w) => {
    return await this.setWidget(w);
  };

  renderLarge = async (w) => {
    return await this.setWidget(w);
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
    if (this.widgetFamily !== "small") {
      this.renderJDHeader(header);
    } else {
      await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    }
    widget.addSpacer(20);
    if (this.widgetFamily === "medium") {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === "large") {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }

  JDRun = (filename, args) => {
    if (config.runsInApp) {
      this.registerAction("设置背景图", this.setWidgetBackground);
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

  renderJDHeader = async (header) => {
    header.centerAlignContent();
    await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    header.addSpacer(140);
    const headerMore = header.addStack();
    headerMore.url = "https://home.m.jd.com/myJd/home.action";
    headerMore.setPadding(1, 10, 1, 10);
    headerMore.cornerRadius = 10;
    headerMore.backgroundColor = new Color("#fff", 0.5);
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
