// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: bomb;

/*
 * Author: 2Ya
 * Github: https://github.com/dompling
 * 本脚本使用了@Gideon_Senku的Env
 */
// const { DmYY } = require("../DmYY");
const { DmYY } = importModule("DmYY");

const blurBackground = true; // 开启背景虚化 true 值类型布尔或数字 ，默认 0.7 取值范围 0 至 1
const imageBackground = true; // 设置配置背景图片
const forceImageUpdate = false; // 设置为true将重置小部件的背景图像

const textFont = {
  title: { size: 22, color: "FFF", font: "semibold" },
  desc: { size: 14, color: "fff", font: "black" },
};

class YaYaJD extends DmYY {
  constructor(widgetParameter) {
    super();
    this.jdIndex = parseInt(widgetParameter) || 0;
  }

  forceImageUpdate = forceImageUpdate;
  blurBackground = blurBackground;
  imageBackground = imageBackground;
  CookiesJD = [];
  cookie = "";
  widgetSize = "medium";

  userName = "";
  beanCount = 0;
  incomeBean = 0;
  expenseBean = 0;
  errorMsg = "";

  init = async () => {
    try {
      this.CookiesJD = await this.getCache("CookiesJD");
      this.cookie = this.CookiesJD[this.jdIndex].cookie;
      this.userName = this.CookiesJD[this.jdIndex].userName;
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
        let detailList = response.detailList;
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const date = item.date.replace(/-/g, "/") + "+08:00";
            if (
              tm <= new Date(date).getTime() &&
              new Date(date).getTime() < tm1
            ) {
              //昨日的
              if (Number(item.amount) > 0) {
                this.incomeBean += Number(item.amount);
              } else if (Number(item.amount) < 0) {
                this.expenseBean += Number(item.amount);
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
        Cookie: this.cookie,
        Referer: "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
      },
    };
    const url = "https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2";
    const response = await this.$request.post(url, options, "JSON");
    if (response.retcode === 0) {
      this.beanCount = response.base.jdNum;
    } else {
      console.log("京东服务器返回空数据");
    }
    return response;
  };

  getJingBeanBalanceDetail = async (page) => {
    const url =
      "https://api.m.jd.com/client.action?functionId=getJingBeanBalanceDetail";
    const options = {
      body: `body=${escape(
        JSON.stringify({ pageSize: "20", page: page.toString() })
      )}&appid=ld`,
      headers: {
        "User-Agent": "JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)",
        Host: "api.m.jd.com",
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: this.cookie,
      },
    };
    return await this.$request.post(url, options);
  };

  setContainer = async (container, { icon, text, desc }) => {
    container.layoutVertically();
    container.centerAlignContent();
    container.size = new Size(100, 120);
    const viewer = container.addStack();
    viewer.size = new Size(100, 30);
    const jdD_icon = await this.$request.get(icon, "IMG");
    const imageElemView = viewer.addImage(jdD_icon);
    imageElemView.centerAlignImage();
    imageElemView.imageSize = new Size(30, 30);
    container.addSpacer(10);

    const textview = container.addStack();
    textview.centerAlignContent();
    textview.size = new Size(100, 40);
    const titleTextItem = this.setCellText(
      text,
      textview,
      textFont.title,
      false
    );
    titleTextItem.rightAlignText();

    const descView = container.addStack();
    descView.centerAlignContent();
    descView.size = new Size(100, 30);
    const descTextItem = this.setCellText(desc, descView, textFont.desc);
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
        "https://raw.githubusercontent.com/dompling/Scriptable/master/JD/jdd.png",
      text: `${this.beanCount}`,
      desc: "当前京豆",
    });
    body.addSpacer(10);
    const centerContainer = body.addStack();
    await this.setContainer(centerContainer, {
      icon:
        "https://raw.githubusercontent.com/dompling/Scriptable/master/JD/jdd.png",
      text: `+${this.incomeBean}`,
      desc: "昨日收入",
    });
    body.addSpacer(10);
    const rightContainer = body.addStack();
    await this.setContainer(rightContainer, {
      icon:
        "https://raw.githubusercontent.com/dompling/Scriptable/master/JD/jdd.png",
      text: `-${this.incomeBean}`,
      desc: "昨日支出",
    });
    return widget;
  };

  renderBefor = async (w) => {
    const icon = "https://raw.githubusercontent.com/Orz-3/task/master/jd.png";
    await this.setHeader(w, { title: "京豆数量", icon }, (body) => {
      body.addSpacer(140);
      const headerRight = body.addStack();
      // headerRight.size = new Size(30, 20);
      headerRight.setPadding(1, 10, 1, 10);
      headerRight.cornerRadius = 10;
      headerRight.backgroundColor = new Color("#fff", 0.5);
      const textItem = this.provideText(this.userName, headerRight);
      textItem.centerAlignText();
      return body;
    });

    w.addSpacer(15);
    await this.setWidgetBackGround(w);
    return w;
  };

  renderLarge = async (w) => {
    return this.renderErrorWidget(w);
  };

  renderSmall = async (w) => {
    return this.renderErrorWidget(w);
  };
}

const _2YaJD = new YaYaJD(args.widgetParameter);
await _2YaJD.init(); // 初始化数据
await _2YaJD.render(); // 加载widget
