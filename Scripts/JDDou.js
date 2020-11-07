// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: comment-dollar;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "京东豆";
    this.en = "JDDou";
    this.JDRun(module.filename, args);
  }

  imageBackground = true; // 背景图开启
  forceImageUpdate = false; // 更换背景 true ,更换之后自行改为 false
  // prefix = "boxjs.com";

  beanCount = 0;
  incomeBean = 0;
  expenseBean = 0;

  init = async () => {
    try {
      await this.TotalBean();
      await this.bean();
    } catch (e) {
      console.log(e);
    }
  };

  bean = async () => {
    //前一天的0:0:0时间戳
    // console.log(`北京时间零点时间戳:${parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000}`);
    // console.log(`北京时间2020-10-28 06:16:05::${new Date("2020/10/28 06:16:05+08:00").getTime()}`)
    const tm =
      parseInt((Date.now() + 28800000) / 86400000) * 86400000 -
      28800000 -
      24 * 60 * 60 * 1000;
    // 今天0:0:0时间戳
    const tm1 =
      parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
    let page = 1,
      t = 0;
    do {
      let response = await this.getJingBeanBalanceDetail(page);
      console.log(`第${page}页`);
      if (response && response.code === "0") {
        page++;
        let detailList = response.jingDetailList;
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const date = item.date.replace(/-/g, "/") + "+08:00";
            if (
              tm <= new Date(date).getTime() &&
              new Date(date).getTime() < tm1
            ) {
              //昨日的
              const amount = Number(item.amount);
              if (amount > 0) {
                this.incomeBean += amount;
              }
              if (amount < 0) {
                this.expenseBean += amount;
              }
            } else if (tm > new Date(date).getTime()) {
              //前天的
              t = 1;
              break;
            }
          }
        } else {
          console.log(`账号${this.jdIndex}：${this.userName}\n数据异常`);
          t = 1;
        }
      }
    } while (t === 0);
    // console.log(`昨日收入：${$.incomeBean}个京豆 🐶`);
    // console.log(`昨日支出：${$.expenseBean}个京豆 🐶`)
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

  setContainer = async (container, { icon, text, desc }) => {
    container.layoutVertically();
    container.centerAlignContent();

    const viewer = container.addStack();
    viewer.size = new Size(90, 25);
    const jdD_icon = await this.getImageByUrl(icon);
    const imageElemView = viewer.addImage(jdD_icon);
    imageElemView.centerAlignImage();
    imageElemView.imageSize = new Size(25, 25);
    container.addSpacer(10);

    const textview = container.addStack();
    textview.size = new Size(90, 30);
    const titleTextItem = textview.addText(text);
    titleTextItem.font = Font.boldSystemFont(22);
    titleTextItem.textColor = new Color("#ffef03");
    titleTextItem.centerAlignText();

    const descView = container.addStack();
    descView.size = new Size(90, 30);
    const descTextItem = descView.addText(desc);
    descTextItem.textColor = new Color("#fff");
    descTextItem.font = Font.lightSystemFont(16);
    descTextItem.centerAlignText();

    return container;
  };

  setWidget = async (widget) => {
    const body = widget.addStack();
    body.centerAlignContent();
    body.url = "https://bean.m.jd.com/";
    const letfContainer = body.addStack();
    await this.setContainer(letfContainer, {
      icon:
        "https://raw.githubusercontent.com/dompling/Scriptable/master/JDDou/jdd.png",
      text: `${this.beanCount}`,
      desc: "当前京豆",
    });
    body.addSpacer(15);
    const centerContainer = body.addStack();
    await this.setContainer(centerContainer, {
      icon:
        "https://raw.githubusercontent.com/dompling/Scriptable/master/JDDou/jdd.png",
      text: `+${this.incomeBean}`,
      desc: "昨日收入",
    });
    body.addSpacer(15);
    const rightContainer = body.addStack();
    await this.setContainer(rightContainer, {
      icon:
        "https://raw.githubusercontent.com/dompling/Scriptable/master/JDDou/jdd.png",
      text: `${this.expenseBean}`,
      desc: "昨日支出",
    });
    return widget;
  };

  renderSmall = async (w) => {
    return await this.renderLarge(w);
  };

  renderLarge = async (w) => {
    const text = w.addText("暂不支持");
    text.font = Font.boldSystemFont(20);
    text.textColor = new Color("#fff");
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
