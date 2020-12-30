// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: chalkboard;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = 'B站 UP 主';
    this.en = 'BiliBiliUp';
    this.inputValue = arg || '50952087';
    this.Run();
  }

  useBoxJS = false;
  ytInitialData = {};
  videos = [];
  baseUrl = 'https://api.bilibili.com/x';
  url;

  numberFormat(value) {
    try {
      const param = {};
      let k = 10000;
      const size = ['', '万', '亿', '万亿'];
      let i;
      if (value < k) {
        param.value = value;
        param.unit = '';
      } else {
        i = Math.floor(Math.log(value) / Math.log(k));
        param.value = ((value / Math.pow(k, i))).toFixed(2);
        param.unit = size[i];
      }
      return `${param.value}${param.unit}`;
    } catch (e) {
      console.log(e);
    }
  }

  init = async () => {
    try {
      await this.getData();
      await this.getRelationStat();
      await this.getVideoList();
    } catch (e) {
      console.log('❌错误信息：' + e);
    }
  };

  getData = async () => {
    const url = `${this.baseUrl}/space/acc/info?mid=${this.inputValue}&jsonp=jsonp`;
    const response = await this.$request.get(url);
    if (response.code === 0) {
      this.ytInitialData = response.data;
    }
  };

  getRelationStat = async () => {
    const url = `${this.baseUrl}/relation/stat?vmid=${this.inputValue}&jsonp=jsonp`;
    const response = await this.$request.get(url);
    if (response.code === 0) {
      this.ytInitialData = {...this.ytInitialData, relation: response.data};
    }
  };

  getVideoList = async () => {
    const url = `${this.baseUrl}/space/arc/search?mid=${this.inputValue}&pn=1&ps=25&index=1&jsonp=jsonp`;
    const response = await this.$request.get(url);
    if (response.code === 0) {
      this.ytInitialData = {
        ...this.ytInitialData,
        videos: response.data.list.vlist.map(item => ({
          thumb: item.pic,
          title: item.title,
          view: `${this.numberFormat(item.play)}次`,
          url: item.bvid,
        })),
      };
    }
  };

  setAvatar = async (stack) => {
    stack.size = new Size(50, 50);
    stack.cornerRadius = 5;
    const {face} = this.ytInitialData;
    const imgLogo = await this.$request.get(face, 'IMG');
    const imgLogoItem = stack.addImage(imgLogo);
    imgLogoItem.imageSize = new Size(50, 50);
    return stack;
  };

  setTitleStack = (stack) => {
    const textFormatNumber = this.textFormat.title;
    textFormatNumber.color = this.backGroundColor;
    const {name} = this.ytInitialData;
    const title = name;
    textFormatNumber.size =
        title.length > 20 || this.widgetFamily === 'small' ? 16 : 20;
    const titleItem = this.provideText(title, stack, textFormatNumber);
    titleItem.lineLimit = 1;
  };

  setPathStack = (stack) => {
    const textFormatNumber = this.textFormat.defaultText;
    textFormatNumber.color = this.backGroundColor;
    textFormatNumber.size = 12;
    const {relation} = this.ytInitialData;
    let simpleText = `关注数：${this.numberFormat(relation.follower)}`;
    const titleItem = this.provideText(
        simpleText,
        stack,
        textFormatNumber,
    );
    titleItem.lineLimit = 1;
    titleItem.textOpacity = 0.9;
  };

  setFooterCell = async (stack) => {
    const datas = this.getRandomArrayElements(this.ytInitialData.videos, 3);
    for (let i = 0; i < datas.length; i++) {
      if (i === 1) stack.addSpacer();
      const video = datas[i];
      const stackVideo = stack.addStack();
      stackVideo.setPadding(10, 10, 10, 10);
      stackVideo.url = 'https://www.bilibili.com/video/' + video.url;
      stackVideo.backgroundColor = this.widgetColor;
      stackVideo.centerAlignContent();
      stackVideo.layoutVertically();
      const img = await this.$request.get(video.thumb, 'IMG');
      stackVideo.backgroundImage = await this.shadowImage(img, '#000', 0.3);
      const title = {...this.textFormat.defaultText};
      title.size = 8;
      title.color = new Color('#fff');
      this.provideText(video.title, stackVideo, title);
      stackVideo.addSpacer();
      title.color = new Color('#fff', 0.7);
      this.provideText(video.view, stackVideo, title);
      stackVideo.size = new Size(87, 56);
      stackVideo.cornerRadius = 4;
      if (i === 1) stack.addSpacer();
    }
  };

  renderSmall = async (w) => {
    return w;
  };

  renderMedium = async (w) => {
    const stackBody = w.addStack();
    stackBody.url = `https://space.bilibili.com/${this.inputValue}/`;
    stackBody.layoutVertically();
    const stackHeader = stackBody.addStack();
    stackHeader.setPadding(5, 10, 5, 10);
    stackHeader.cornerRadius = 10;
    stackHeader.backgroundColor = this.widgetColor;

    stackHeader.centerAlignContent();
    const stackLeft = stackHeader.addStack();
    await this.setAvatar(stackLeft);
    stackHeader.addSpacer(20);

    const stackRight = stackHeader.addStack();
    stackRight.layoutVertically();
    this.setTitleStack(stackRight);
    stackRight.addSpacer(5);
    this.setPathStack(stackRight);
    stackHeader.addSpacer();
    stackBody.addSpacer();

    const stackFooter = stackBody.addStack();
    stackFooter.setPadding(10, 0, 10, 0);
    stackFooter.cornerRadius = 10;
    stackFooter.backgroundColor = this.widgetColor;
    stackFooter.addSpacer();
    await this.setFooterCell(stackFooter);
    stackFooter.addSpacer();
    return w;
  };

  renderLarge = async (w) => {
    return w;
  };

  Run() {
    if (config.runsInApp) {
      this.registerAction('基础设置', this.setWidgetConfig);
    }
  }

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === 'medium') {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.renderLarge(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }
}

// @组件代码结束
// await Runing(Widget, "", true); // 正式环境
await Runing(Widget, args.widgetParameter, false); //远程开发环境
