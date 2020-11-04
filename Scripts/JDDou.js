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
const { Base } = require("./「小件件」开发环境");
const { Runing } = require("./DmYY");
// @组件代码开始
class Widget extends Base {
  constructor(arg) {
    super(arg);
    this.JDindex = parseInt(args.widgetParameter) || undefined;
    this.name = "京东豆";
    this.en = "JDDou";
    this.logo = "https://raw.githubusercontent.com/Orz-3/task/master/jd.png";
    this.JDCookie = this.settings[this.en] || {
      cookie: "",
      userName: "",
    };
    if (this.JDindex !== undefined) {
      this.JDCookie = this.settings.JDAccount[this.JDindex];
    }
    let _md5 = this.md5(module.filename + this.JDCookie.cookie);
    this.CACHE_KEY = `cache_${_md5}`;
    // 注册操作菜单
    this.registerAction("输入京东 CK", this.inputJDck);
    this.registerAction("选择京东 CK", this.actionSettings);
  }

  imageBackground = true;
  forceImageUpdate = false;
  API = { 0: [] };
  JDAccount = [];
  beanCount = 0;
  incomeBean = 0;
  expenseBean = 0;

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
        Cookie: this.JDCookie.cookie,
      },
    };
    const request = new Request(url, { method: "POST" });
    request.body = options.body;
    request.headers = options.headers;
    return await request.loadJSON();
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

  setContainer = async (container, { icon, text, desc }) => {
    container.layoutVertically();
    container.centerAlignContent();
    container.size = new Size(100, 120);
    const viewer = container.addStack();
    viewer.size = new Size(100, 25);
    const jdD_icon = await this.getBackgroundImage(icon, "IMG");
    const imageElemView = viewer.addImage(jdD_icon);
    imageElemView.centerAlignImage();
    imageElemView.imageSize = new Size(25, 25);
    container.addSpacer(10);

    const textview = container.addStack();
    textview.centerAlignContent();
    textview.size = new Size(100, 40);
    const titleTextItem = textview.addText(text);
    titleTextItem.font = Font.boldSystemFont(22);
    titleTextItem.textColor = new Color("#fff");
    titleTextItem.rightAlignText();

    const descView = container.addStack();
    descView.centerAlignContent();
    descView.size = new Size(100, 30);
    const descTextItem = descView.addText(desc);
    titleTextItem.font = Font.lightSystemFont(14);
    titleTextItem.textColor = new Color("#fff");

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
      await this.renderHeader(
        headerLogo,
        this.logo,
        this.name,
        new Color("#fff")
      );
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
    this.settings[this.en] = this.JDCookie;
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
      this.settings.JDAccount = await this._load();
    }
    this.API[0].map((t) => {
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
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, "", true); //远程开发环境
