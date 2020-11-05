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
    this.JDRun(module.filename, arg);
  }

  imageBackground = true;
  forceImageUpdate = false;
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
    await this.setWidgetBackgroundImage(widget);
    const header = widget.addStack();
    if (this.widgetFamily !== "small") {
      this.renderJDHeader(header);
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
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, "", true); //远程开发环境
