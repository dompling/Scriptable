// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: chalkboard;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '哔哩哔哩关注';
    this.en = 'BiliBiliWatch';
    this.logo =
      'https://raw.githubusercontent.com/Orz-3/mini/master/Color/bilibili.png';
    this.Run(module.filename);
  }

  cookie = '';
  dataSource = [];

  init = async () => {
    try {
      await this.getDramaList();
    } catch (e) {
      console.log(e);
    }
  };

  getDramaList = async () => {
    const url = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?type_list=268435455`;
    const method = `GET`;
    const headers = {
      Cookie: this.cookie,
      'User-Agent': `bili-universal/10320 CFNetwork/1206 Darwin/20.1.0 os/ios model/iPhone XR mobi_app/iphone build/10320 osVer/14.2 network/2 channel/AppStore`,
    };
    const response = await this.$request.get(url, {
      method,
      headers,
    });
    try {
      const { code, data } = response;
      if (code === 0 && data.cards.length > 0) {
        let dataSource = data.cards;
        dataSource.forEach((item) => {
          const card = JSON.parse(item.card);
          let temp = false;
          if (card.apiSeasonInfo) {
            temp = {};
            temp.title = card.apiSeasonInfo.title;
            temp.url = card.url;
            temp.reply = card.reply_count;
            temp.play = card.play_count;
            temp.img = card.cover;
            temp.desc = card.new_desc;
            temp.timestamp = item.desc.timestamp;
          } else if (card.videos === 1) {
            temp = {};
            temp.title = card.title;
            temp.url = card.jump_url;
            temp.reply = card.stat.reply;
            temp.play = card.stat.view;
            temp.desc = card.desc;
            temp.img = card.pic;
            temp.timestamp = item.desc.timestamp;
          }
          if (temp) this.dataSource.push(temp);
        });
        return this.dataSource;
      } else {
        throw 'cookie 失效，请重新获取';
      }
    } catch (e) {
      console.log('❌错误信息：' + e);
      return false;
    }
  };

  setListCell = async (cell, data) => {
    const { title, url, reply, play, desc, img, timestamp } = data;
    let body = cell.addStack();
    body.url = url;
    if (this.widgetFamily !== 'small') {
      const imageView = body.addStack();
      imageView.size = new Size(43, 43);
      imageView.cornerRadius = 5;
      const image = await this.$request.get(img, 'IMG');
      imageView.backgroundImage = image;
      body.addSpacer(10);
    }

    const textView = body.addStack();
    textView.layoutVertically();

    const descText = textView.addText(`${title} ${desc}`);
    descText.font = Font.boldSystemFont(14);
    descText.textColor = this.widgetColor;
    descText.lineLimit = 1;

    textView.addSpacer(3);

    const date = new Date();
    date.setTime(timestamp * 1000); //注意，这行是关键代码
    let month = date.getMonth() + 1;
    let day = date.getDate();

    const timerText1 = textView.addText(`${month}-${day} 更新了`);
    timerText1.font = Font.lightSystemFont(10);
    timerText1.textColor = this.widgetColor;
    timerText1.lineLimit = 1;

    const descView = textView.addStack();

    const icon1 = descView.addText('浏览：');
    icon1.font = Font.lightSystemFont(10);
    icon1.textColor = this.widgetColor;
    descView.addSpacer(3);
    const timerText = descView.addText(`${play}`);
    timerText.font = Font.lightSystemFont(10);
    timerText.textColor = this.widgetColor;
    descView.addSpacer(5);

    const icon2 = descView.addText('评论：');
    icon2.font = Font.lightSystemFont(10);
    icon2.textColor = this.widgetColor;

    descView.addSpacer(3);
    const timerText2 = descView.addText(`${reply}`);
    timerText2.font = Font.lightSystemFont(10);
    timerText2.textColor = this.widgetColor;
    return cell;
  };

  setWidget = async (body, size) => {
    const container = body.addStack();
    container.layoutVertically();
    const dataSource = this.getRandomArrayElements(this.dataSource, size);
    for (let index = 0; index < dataSource.length; index++) {
      const data = dataSource[index];
      let listItem = container.addStack();
      await this.setListCell(listItem, data);
      container.addSpacer(10);
    }
    body.addSpacer();
    return body;
  };

  renderSmall = async (w) => {
    return await this.setWidget(w, 2);
  };

  renderLarge = async (w) => {
    return await this.setWidget(w, 6);
  };

  renderMedium = async (w) => {
    return await this.setWidget(w, 2);
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
    if (this.widgetFamily === 'medium') {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }

  renderJDHeader = async (header) => {
    header.centerAlignContent();
    await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    header.addSpacer();
    const headerMore = header.addStack();
    headerMore.url = '';
    headerMore.setPadding(1, 10, 1, 10);
    headerMore.cornerRadius = 10;
    headerMore.backgroundColor = new Color('#fff', 0.5);
    const textItem = headerMore.addText('个人中心');
    textItem.font = Font.boldSystemFont(12);
    textItem.textColor = this.widgetColor;
    textItem.lineLimit = 1;
    textItem.rightAlignText();
    return header;
  };

  Run = (filename) => {
    if (config.runsInApp) {
      this.registerAction('基础设置', this.setWidgetConfig);
      this.registerAction('账号设置', this.inputCk);
      this.registerAction('代理缓存', this._loadCk);
    }
    let _md5 = this.md5(filename + this.en);
    this.CACHE_KEY = `cache_${_md5}`;
    try {
      this.cookie = this.settings[this.en];
      if (!this.cookie) {
        throw 'CK 获取失败';
      }
      return true;
    } catch (e) {
      this.notify('错误提示', e);
      return false;
    }
  };

  _loadCk = async () => {
    try {
      const cookie = await this.getCache('@bilibili.cookie');
      if (cookie) {
        this.cookie = cookie;
        this.settings[this.en] = this.cookie;
        this.saveSettings();
      } else {
        throw 'ck 获取失败';
      }
      return true;
    } catch (e) {
      console.log(e);
      this.cookie = '';
      return false;
    }
  };

  async inputCk() {
    const a = new Alert();
    a.title = '账号设置';
    a.message = '手动输入 Ck';
    a.addTextField('Cookie', this.cookie);
    a.addAction('确定');
    a.addCancelAction('取消');
    const id = await a.presentAlert();
    if (id === -1) return;
    this.cookie = a.textFieldValue(0);
    // 保存到本地
    this.settings[this.en] = this.cookie;
    this.saveSettings();
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, '', false); //远程开发环境
