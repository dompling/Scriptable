// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: paper-plane;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = "Telegram";
    this.en = "Telegram";
    this.inputValue = arg || "Durov";
    this.Run();
  }

  useBoxJS = false;
  dataSource = {
    footer: {},
  };

  init = async () => {
    try {
      await this.getData();
    } catch (e) {
      console.log(e);
    }
  };

  getData = async () => {
    let data = await this.$request.get(
      "https://t.me/s/" + this.inputValue,
      "STRING"
    );
    data = data.match(
      /tgme_channel_info_header">(.|\n)+tgme_channel_download_telegram"/
    )[0];
    this.dataSource.logo = data.match(/https.+jpg/)[0];
    this.dataSource.title = data.match(
      /header_title"><span dir="auto">(.+)<\/span>/
    )[1];
    let entities = this.dataSource.title.match(/&#\d{2,3};/g);
    if (entities) {
      for (let k in entities) {
        let rExp = new RegExp(entities[k], "g");
        this.dataSource.title = this.dataSource.title.replace(
          rExp,
          this.entityToString(entities[k])
        );
      }
    }
    let counters = data.match(/counter_value">.+?<\/span>/g);
    let type = data.match(/counter_type">.+?<\/span>/g);
    counters.forEach((item, index) => {
      const value = item.match(/counter_value">(.+?)<\/span>/)[1];
      const key = type[index].match(/counter_type">(.+?)<\/span>/)[1];
      this.dataSource.footer[key] = value;
    });
  };

  entityToString(entity) {
    let entities = entity.split(";");
    entities.pop();
    return entities
      .map((item) =>
        String.fromCharCode(
          item[2] === "x"
            ? parseInt(item.slice(3), 16)
            : parseInt(item.slice(2))
        )
      )
      .join("");
  }

  setAvatar = async (stack) => {
    stack.size = new Size(60, 60);
    stack.cornerRadius = 10;
    const { logo } = this.dataSource;
    const imgLogo = await this.$request.get(logo, "IMG");
    const imgLogoItem = stack.addImage(imgLogo);
    imgLogoItem.imageSize = new Size(60, 60);
    return stack;
  };

  setNumberStack = (stack, data) => {
    stack.layoutVertically();
    stack.addSpacer();
    const textFormatNumber = this.textFormat.title;
    textFormatNumber.color = this.widgetColor;
    textFormatNumber.size = 18;
    const stackTitle = stack.addStack();
    stackTitle.addSpacer();
    const valueItem = this.provideText(
      data.value,
      stackTitle,
      textFormatNumber
    );
    valueItem.lineLimit = 1;
    stackTitle.addSpacer();

    stack.addSpacer(5);

    const textFormatDesc = this.textFormat.defaultText;
    textFormatDesc.color = new Color("#aaaaaa");
    textFormatDesc.size = 12;
    const stackDesc = stack.addStack();
    stackDesc.addSpacer();
    const descItem = this.provideText(data.key, stackDesc, textFormatDesc);
    descItem.lineLimit = 1;
    stackDesc.addSpacer();
    stack.addSpacer();

    return stack;
  };

  setTitleStack = (stack) => {
    const textFormatNumber = this.textFormat.title;
    textFormatNumber.color = this.widgetColor;
    const title = this.dataSource.title;
    textFormatNumber.size =
      title.length > 20 || this.widgetFamily === "small" ? 16 : 20;
    const titleItem = this.provideText(title, stack, textFormatNumber);
    titleItem.lineLimit = 1;
  };

  setPathStack = (stack) => {
    const textFormatNumber = this.textFormat.defaultText;
    textFormatNumber.color = new Color("#2481cc");
    textFormatNumber.size = 12;
    const titleItem = this.provideText(
      `@${this.inputValue}`,
      stack,
      textFormatNumber
    );
    titleItem.lineLimit = 1;
  };

  renderSmall = async (w) => {
    const stackBody = w.addStack();
    stackBody.url = `https://t.me/${this.inputValue}`;
    stackBody.layoutVertically();
    stackBody.addSpacer();
    const stackHeader = stackBody.addStack();
    const stackLeft = stackHeader.addStack();
    await this.setAvatar(stackLeft);
    stackHeader.addSpacer(5);

    const stackRight = stackHeader.addStack();
    Object.keys(this.dataSource.footer).forEach((key, index) => {
      if (index === 0) {
        const value = this.dataSource.footer[key];
        this.setNumberStack(stackRight, { key, value });
      }
    });

    stackBody.addSpacer();
    const stackFooter = stackBody.addStack();
    stackFooter.layoutVertically();
    this.setTitleStack(stackFooter);
    stackFooter.addSpacer(5);
    this.setPathStack(stackFooter);
    stackBody.addSpacer();
    return w;
  };

  renderMedium = async (w) => {
    const stackBody = w.addStack();
    stackBody.url = `https://t.me/${this.inputValue}`;
    stackBody.layoutVertically();
    stackBody.addSpacer();
    const stackHeader = stackBody.addStack();
    const stackLeft = stackHeader.addStack();
    await this.setAvatar(stackLeft);
    stackHeader.addSpacer(20);

    const stackRight = stackHeader.addStack();
    stackRight.layoutVertically();
    stackRight.addSpacer(5);
    this.setTitleStack(stackRight);
    stackRight.addSpacer(5);
    this.setPathStack(stackRight);

    stackBody.addSpacer();

    const stackFooter = stackBody.addStack();
    Object.keys(this.dataSource.footer).forEach((key) => {
      const value = this.dataSource.footer[key];
      const stack = stackFooter.addStack();
      this.setNumberStack(stack, { key, value });
    });
    stackBody.addSpacer();
    return w;
  };

  renderLarge = async (w) => {
    return await this.renderMedium(w);
  };

  Run() {
    if (config.runsInApp) {
      this.registerAction("基础设置", this.setWidgetConfig);
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
// await Runing(Widget, "", true); // 正式环境
await Runing(Widget, args.widgetParameter); //远程开发环境
