// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: bomb;

/*
 * Author: 2Ya
 * Github: https://github.com/dompling
 */
if (typeof require === "undefined") require = importModule;
const { DmYY, Testing } = require("./DmYY");

const blurBackground = true; // 开启背景虚化 true 值类型布尔或数字 ，默认 0.7 取值范围 0 至 1
const imageBackground = true; // 设置配置背景图片
const forceImageUpdate = false; // 设置为true将重置小部件的背景图像

const textFont = {
  title: { size: 22, color: "FFF", font: "semibold" },
  desc: { size: 14, color: "fff", font: "black" },
};

class YaYaJDWuLiu extends DmYY {
  constructor(widgetParameter) {
    super();
    this.jdIndex = parseInt(widgetParameter) || 0;
  }

  forceImageUpdate = forceImageUpdate;
  blurBackground = blurBackground;
  imageBackground = imageBackground;

  CookiesJD = [];
  cookie = "";
  widgetSize = config.runsInWidget ? config.widgetFamily : "large";
  cacheBackgroundName = "2Ya-img";
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
      this.CookiesJD = await this.getCache("CookiesJD");
      this.cookie = this.CookiesJD[this.jdIndex].cookie;
      this.userName = this.CookiesJD[this.jdIndex].userName;
      this.opts.headers.Cookie = this.cookie;
      this.orderList = await this.getOrderList();
    } catch (e) {
      console.log(e);
    }
  };

  getOrderList = async () => {
    const url =
      "https://wq.jd.com/bases/orderlist/list?order_type=2&start_page=1&page_size=10";
    const options = { ...this.opts };
    options.headers.Referer = `https://wqs.jd.com/order/orderlist_merge.shtml?sceneval=2&orderType=waitReceipt`;
    const response = await this.$request.get(url, options);
    try {
      return response.orderList.filter((item) => {
        return item.stateInfo.stateCode === "15";
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  setListCell = async (cell, data) => {
    const { productList = [], orderDetailLink = "", progressInfo = {} } = data;
    const product = productList[0];
    cell.url = orderDetailLink;
    if (this.widgetSize !== "small") {
      cell.size = new Size(300, 75);
      const imageView = cell.addStack();
      imageView.size = new Size(75, 75);
      imageView.cornerRadius = 5;
      imageView.url = product.skuLink;
      const image = await this.$request.get(product.image, "IMG");
      image.imageSize = new Size(300, 300);
      imageView.backgroundImage = image;
      cell.addSpacer(10);
    }

    const textView = cell.addStack();
    textView.layoutVertically();
    textView.url = orderDetailLink;
    const descView = textView.addStack();
    this.provideText(progressInfo.content, descView, this.textStyle);
    textView.addSpacer(10);

    const timerView = textView.addStack();
    this.provideText(progressInfo.tip, timerView, textFont.desc);

    return cell;
  };

  setWidget = async (widget) => {
    const body = widget.addStack();
    body.layoutVertically();
    body.url =
      "https://wqs.jd.com/order/orderlist_merge.shtml?sceneval=2&orderType=waitReceipt";
    // if(!this.orderList.length){
    //   return https://pic.17qq.com/uploads/igipjpiddz.jpeg
    // }

    for (let index = 0; index < this.orderList.length; index++) {
      if (this.widgetSize !== "large" && index === 1) {
        return widget;
      }
      if (index === 3) {
        return widget;
      }
      const data = this.orderList[index];
      let listItem = body.addStack();
      await this.setListCell(listItem, data);
      body.addSpacer(15);
    }
    return widget;
  };

  renderBefor = async (w) => {
    const icon = "https://raw.githubusercontent.com/Orz-3/task/master/jd.png";
    await this.setHeader(w, { title: "京豆物流", icon }, (body) => {
      body.addSpacer(this.widgetSize !== "small" ? 140 : 5);
      const headerRight = body.addStack();
      headerRight.setPadding(1, 10, 1, 10);
      headerRight.cornerRadius = 10;
      headerRight.backgroundColor = new Color("#fff", 0.5);
      const textItem = this.provideText(
        this.widgetSize !== "small" ? this.userName : "更多",
        headerRight
      );
      textItem.centerAlignText();
      return body;
    });

    w.addSpacer(15);
    await this.setWidgetBackGround(w);
    return w;
  };

  renderSmall = async (widget) => {
    return await this.setWidget(widget);
  };
}

await Testing(YaYaJDWuLiu);
