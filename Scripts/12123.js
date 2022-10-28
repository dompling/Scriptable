// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: car;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.en = '12123';
    this.name = '交管 12123';
    config.runsInApp && this.registerAction('Token', async () => {
      const token = this.settings.token;
      this.settings.token = await this.getCache('token_12123') || token;
      if (this.settings.token) this.saveSettings(false);
      return this.setAlertInput('Token', '设置 token', {
        token: '获取Token作者: @FoKit',
      });
    }, {name: 'paperplane', color: '#722ed1'});
    config.runsInApp && this.registerAction('基础设置', this.setWidgetConfig);
  }

  dataSource = {
    left: {
      title: '川 G88888', icon: 'car.fill', listItem: [
        {label: '未处违法', value: `0`, unit: '条'},
        {label: '车辆状态', value: '正常'},
        {label: '上次更新', value: '10:40'},
      ],
    }, right: {
      title: '驾驶证', icon: 'creditcard.fill', listItem: [
        {label: '累计积分', value: `0`, unit: '分'},
        {label: '证件状态', value: '正常'},
      ],
    },
  };

  init = async () => {
    if (this.settings.dataSource) {
      this.dataSource = this.settings.dataSource;
    } else {
      await this.cacheData();
    }
    this.cacheData();
  };

  cacheData = async () => {
    try {
      const response = await this.$request.post(
        `https://miniappcsfw.122.gov.cn:8443/openapi/invokeApi/business/biz`, {
          body: `params=${JSON.stringify({
            productId: 'p10000000000000000001',
            api: 'biz.vio.unhandledVioCount.query"',
            verifyToken: this.settings.token,
          })}`,
        });
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  renderImage = async (uri) => {
    return this.$request.get(uri, 'IMG');
  };

  notSupport(w) {
    const stack = w.addStack();
    stack.addText('暂不支持');
    return w;
  }

  renderSmall = async (w) => {
    this.notSupport(w);
    return w;
  };

  renderLarge = async (w) => {
    return this.notSupport(w);
  };

  renderCard = (w, data) => {
    w.borderColor = this.widgetColor;
    w.borderWidth = 2;
    w.cornerRadius = 8;

    w.layoutVertically();
    w.setPadding(10, 10, 10, 10);
    const topStack = w.addStack();
    topStack.layoutHorizontally();
    topStack.centerAlignContent();
    const iconImage = SFSymbol.named(data.icon).image;
    const iconImageStack = topStack.addImage(iconImage);
    iconImageStack.tintColor = this.widgetColor;
    iconImageStack.imageSize = new Size(30, 30);

    topStack.addSpacer(10);

    const licensePlateText = topStack.addText(data.title);
    licensePlateText.textColor = this.widgetColor;
    licensePlateText.font = this.provideFont('bold', 14);

    w.addSpacer();
    data.listItem.forEach((item, index) => {
      const listItemStack = w.addStack();
      listItemStack.centerAlignContent();
      const labelText = listItemStack.addText(item.label);
      labelText.textColor = this.widgetColor;
      labelText.font = this.provideFont('medium', 14);

      listItemStack.addSpacer();
      if (index !== data.listItem.length - 1) w.addSpacer();

      const valueText = listItemStack.addText(item.value);
      valueText.textColor = this.widgetColor;
      valueText.font = this.provideFont('medium', 14);

      if (item.unit) {
        const unitText = listItemStack.addText(item.unit);
        unitText.textColor = this.widgetColor;
        unitText.font = this.provideFont('medium', 14);
      }

    });
  };

  renderMedium = async (w) => {
    const containerStack = w.addStack();
    containerStack.layoutHorizontally();
    containerStack.centerAlignContent();

    const leftStack = containerStack.addStack();
    this.renderCard(leftStack, this.dataSource.left);

    containerStack.addSpacer(10);

    const rightStack = containerStack.addStack();
    this.renderCard(rightStack, this.dataSource.right);
    return w;
  };

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
await Runing(Widget, '', false); //远程开发环境
