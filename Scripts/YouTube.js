// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = 'YouTube';
    this.en = 'YouTube';
    this.inputValue = arg ||
        'https://m.youtube.com/channel/UCMUnInmOkrWN4gof9KlhNmQ';
    this.url = `${this.baseUrl}/c/${this.inputValue}`;
    if (this.inputValue.includes('m.youtube.com')) {
      this.url = this.inputValue;
    }
    this.Run();
  }

  useBoxJS = false;
  ytInitialData = {};
  videos = [];
  baseUrl = 'https://m.youtube.com';
  url;

  init = async () => {
    try {
      await this.getData();
    } catch (e) {
      console.log(e);
    }
  };

  getData = async () => {
    const url = this.url;

    const webView = new WebView();
    await webView.loadURL(url);
    const javascript = `completion(ytInitialData||window['ytInitialData']);`;
    this.ytInitialData = await webView.evaluateJavaScript(javascript, true).
        then(
            async (e) => {
              return typeof e === 'string' ? JSON.parse(e) : e;
            });
    this.getCell();
  };

  getCell() {
    const {contents} = this.ytInitialData;
    let videos = [];
    Object.keys(contents).forEach(key => {
      const result = contents[key];
      const homeContent = result.tabs[0].tabRenderer.content.sectionListRenderer.contents;
      homeContent.forEach((item) => {
        let contents;
        if (item.itemSectionRenderer) {
          contents = item.itemSectionRenderer.contents;
          contents.forEach(video => {
            if (!video.shelfRenderer) return;
            const cateVideo = video.shelfRenderer.content;
            if (cateVideo) {
              const data = [];
              Object.keys(cateVideo).forEach(cv => {
                cateVideo[cv].items.forEach(cell => {
                  const cellVideo = this.getCellVideo(cell);
                  if (cellVideo) data.push(cellVideo);
                });
                videos = [
                  ...videos,
                  ...data,
                ];
              });
            }
          });
        } else if (item.shelfRenderer) {
          contents = item.shelfRenderer;
          contents = contents.content.verticalListRenderer.items;
          contents.forEach(compactVideoRenderer => {
            const data = this.getCellVideo2(compactVideoRenderer);
            if (data) videos.push(data);
          });
        }
      });
    });
    this.videos = videos;
  }

  getCellVideo(data) {
    try {
      const {gridVideoRenderer} = data;
      return {
        thumb: gridVideoRenderer.thumbnail.thumbnails[0].url,
        title: gridVideoRenderer.title.simpleText,
        view: gridVideoRenderer.viewCountText.simpleText,
        url: gridVideoRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url,
      };
    } catch (e) {
      console.log(e);
    }
  }

  getCellVideo2(data) {
    try {
      const {compactVideoRenderer} = data;
      return {
        thumb: compactVideoRenderer.thumbnail.thumbnails[0].url,
        title: compactVideoRenderer.title.runs[0].text,
        view: compactVideoRenderer.viewCountText.runs[0].text,
        url: compactVideoRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url,
      };
    } catch (e) {
      console.log(e);
    }
  }

  setAvatar = async (stack) => {
    stack.size = new Size(50, 50);
    stack.cornerRadius = 5;
    const {metadata: {channelMetadataRenderer}} = this.ytInitialData;
    const avatar = channelMetadataRenderer.avatar.thumbnails.find(
        item => item.url);
    const imgLogo = await this.$request.get(avatar, 'IMG');
    const imgLogoItem = stack.addImage(imgLogo);
    imgLogoItem.imageSize = new Size(50, 50);
    return stack;
  };

  setTitleStack = (stack) => {
    const textFormatNumber = this.textFormat.title;
    textFormatNumber.color = this.backGroundColor;
    const {metadata: {channelMetadataRenderer}} = this.ytInitialData;
    const title = channelMetadataRenderer.title;
    textFormatNumber.size =
        title.length > 20 || this.widgetFamily === 'small' ? 16 : 20;
    const titleItem = this.provideText(title, stack, textFormatNumber);
    titleItem.lineLimit = 1;
  };

  setPathStack = (stack) => {
    const textFormatNumber = this.textFormat.defaultText;
    textFormatNumber.color = new Color('#2481cc');
    textFormatNumber.size = 12;
    const {header} = this.ytInitialData;
    let simpleText = '';
    Object.keys(header).forEach(key => {
      const item = header[key];
      if (item.subscriberCountText && !simpleText) {
        simpleText = item.subscriberCountText.simpleText;
      }
      if (!simpleText && item.subscribeButton) {
        simpleText = item.subscriberCountText.runs[0].text;
      }
    });
    const titleItem = this.provideText(
        simpleText,
        stack,
        textFormatNumber,
    );
    titleItem.lineLimit = 1;
  };

  setFooterCell = async (stack) => {
    const datas = this.getRandomArrayElements(this.videos, 3);
    for (let i = 0; i < datas.length; i++) {
      if (i === 1) stack.addSpacer();
      const video = datas[i];
      const stackVideo = stack.addStack();
      stackVideo.setPadding(10, 10, 10, 10);
      stackVideo.url = this.baseUrl + video.url;
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
    stackBody.url = this.url;
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
