// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: truck;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: truck;

// iOS 桌面组件脚本 @「小件件」
// 开发说明：请从 Widget 类开始编写，注释请勿修改
// https://x.im3x.cn
//

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { Base, Testing } = require("./「小件件」开发环境");
const { Runing } = require("./DmYY");
// @组件代码开始
class Widget extends Base {
  constructor(arg) {
    super(arg);
    this.name = "京东物流";
    this.en = "JDWuLiu";
    this.logo = "https://raw.githubusercontent.com/Orz-3/task/master/jd.png";
    this.JDCookie = this.settings["JDCookie"] || { cookie: "", userName: "" };
    let _md5 = this.md5(module.filename + this.JDCookie.cookie);
    this.CACHE_KEY = `cache_${_md5}`;
    // 注册操作菜单
    this.registerAction("输入京东 CK", this.inputJDck);
    this.registerAction("选择京东 CK", this.actionSettings);
  }

  imageBackground = true;
  forceImageUpdate = false;
  API = { 0: [] };
  prefix = "boxjs.net";
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
      this.opts.headers.Cookie = this.JDCookie.cookie;
      this.orderList = await this.getOrderList();
    } catch (e) {
      console.log(e);
    }
  };

  // 加载节点列表
  _load = async () => {
    let boxdata = await this.httpGet(`http://${this.prefix}/query/boxdata`);
    const cacheValue = boxdata.datas["CookiesJD"];
    this.API[0] = this.transforJSON(cacheValue);
    return this.API[0];
  };

  transforJSON = (str) => {
    if (typeof str == "string") {
      try {
        return JSON.parse(str);
      } catch (e) {
        console.log(e);
        return str;
      }
    }
    console.log("It is not a string!");
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
    cell.url = orderDetailLink;
    if (this.widgetFamily !== "small") {
      cell.size = new Size(320, 75);
      const imageView = cell.addStack();
      imageView.size = new Size(75, 75);
      imageView.cornerRadius = 5;
      imageView.url = product.skuLink;
      const image = await this.getImageByUrl(product.image, false);
      image.imageSize = new Size(300, 300);
      imageView.backgroundImage = image;
      cell.addSpacer(10);
    }

    const textView = cell.addStack();
    textView.layoutVertically();
    textView.url = orderDetailLink;
    const descView = textView.addStack();
    const descText = descView.addText(progressInfo.content);
    descText.font = Font.lightSystemFont(16);
    descText.textColor = Color.white();
    descText.lineLimit = 2;

    textView.addSpacer(10);

    const timerView = textView.addStack();
    const timerText = timerView.addText(progressInfo.tip);
    timerText.font = Font.lightSystemFont(10);
    timerText.textColor = Color.white();
    timerText.textOpacity = 0.5;
    timerText.lineLimit = 1;

    return cell;
  };

  setWidget = async (widget) => {
    const body = widget.addStack();
    body.url =
      "https://wqs.jd.com/order/orderlist_merge.shtml?sceneval=2&orderType=waitReceipt";
    if (!this.orderList.length) {
      body.centerAlignContent();
      let bodyHeight = 100,
        bodyWidth = 320;

      if (this.widgetFamily === "large") {
        bodyHeight = bodyHeight * 3;
      } else if (this.widgetFamily === "small") {
        bodyWidth = bodyHeight;
      }
      body.size = new Size(bodyWidth, bodyHeight);
      if (this.widgetFamily !== "small") {
        const bg = await this.getImageByUrl(
          "https://raw.githubusercontent.com/dompling/Scriptable/master/JDWuLiu/cart.png"
        );
        const cartView = body.addStack();
        cartView.size = new Size(90, 60);
        cartView.addImage(bg);
      }
      const textItem = body.addText("空空如也");
      body.setPadding(1, 10, 1, 10);
      body.cornerRadius = 10;
      body.backgroundColor = new Color("#fff", 0.5);
      textItem.textColor = new Color("#fff");
      textItem.font = Font.boldSystemFont(15);
      textItem.lineLimit = 1;
      return widget;
    }
    body.layoutVertically();
    body.topAlignContent();

    let orderIndex = 0;

    for (let index = 0; index < this.orderList.length; index++) {
      if (this.widgetFamily !== "large" && index === 1) {
        return widget;
      }
      if (index === 4) {
        return widget;
      }
      orderIndex = index;
      const data = this.orderList[index];
      let listItem = body.addStack();
      await this.setListCell(listItem, data);
      body.addSpacer(15);
    }
    if (this.widgetFamily === "large") {
      body.addSpacer((3 - (orderIndex + 1)) * 75 + 40);
    }

    return widget;
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
    if (this.imageBackground) {
      const isExistImage = this.getBackgroundImage();
      const backImage =
        !isExistImage && !this.forceImageUpdate
          ? await this.chooseImgAndCache()
          : isExistImage;
      await this.setBackgroundImage(backImage, false);
      widget.backgroundImage = await this.shadowImage(backImage);
    }
    const header = widget.addStack();
    if (this.widgetFamily !== "small") {
      header.centerAlignContent();
      const headerLogo = header.addStack();
      await this.renderHeader(headerLogo, this.logo, this.name);
      header.addSpacer(140);
      const headerMore = header.addStack();
      headerMore.url = "https://home.m.jd.com/myJd/home.action";
      headerMore.setPadding(1, 10, 1, 10);
      headerMore.cornerRadius = 10;
      headerMore.backgroundColor = new Color("#fff", 0.5);
      const textItem = headerMore.addText(this.JDCookie.userName);
      textItem.font = Font.boldSystemFont(12);
      textItem.textColor = new Color("#fff");
      textItem.lineLimit = 1;
    } else {
      await this.renderHeader(header, this.logo, this.name);
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

  // 选择图片并缓存
  chooseImgAndCache = async () => {
    const photoLibrary = await Photos.fromLibrary();
    return photoLibrary;
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
    this.settings.JDCookie = this.JDCookie;
    this.saveSettings();
  }

  async actionSettings() {
    const a = new Alert();
    a.title = "内容设置";
    a.message = "设置组件展示的京东账号";
    a.addAction("选择京东账号 Ck");
    a.addCancelAction("取消设置");
    const i = await a.presentSheet();
    if (i === -1) return;
    const table = new UITable();
    // 如果是节点，则先远程获取
    if (i === 0 && this.API[0].length === 0) {
      await this._load();
    }
    this.API[0].map((t) => {
      const r = new UITableRow();
      r.addText(t.userName);
      r.onSelect = (n) => {
        this.settings.JDCookie = t;
        this.saveSettings();
      };
      table.addRow(r);
    });
    table.present(false);
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, "", true); //远程开发环境
