// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: subway;

// 说明：只面向qx,loon,surge 用户,请自行添加cookie脚本
// 1.获取 cookie：https://github.com/chavyleung/scripts/tree/master/zxhc
// 2.自动获取待出行列表：https://raw.githubusercontent.com/dompling/Script/master/ZXTrians/ZXTrains.js 按照脚本内容配置

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '智行火车票';
    this.en = 'ZXTrains';
    this.logo =
      'https://raw.githubusercontent.com/Orz-3/mini/master/Color/zxhc.png';
    this.cacheName = this.md5(`dataSouce_${this.en}`);
    if (config.runsInApp) {
      this.registerAction('基础设置', this.setWidgetConfig);
    }
  }

  dataSource = [];

  init = async () => {
    try {
      this.dataSource = await this.getTrainsList();
    } catch (e) {
      console.log(e);
    }
  };

  dateToUnixTimestamp(str) {
    const dates = new Date(str.replace(/-/g, '/'));
    return parseInt(dates.getTime());
  }

  timeAgo(o) {
    var n = new Date().getTime();
    var f = n - o;
    var bs = f >= 0 ? '前' : '后'; //判断时间点是在当前时间的 之前 还是 之后
    f = Math.abs(f);
    if (f < 6e4) {
      return '刚刚';
    } //小于60秒,刚刚
    if (f < 36e5) {
      return parseInt(f / 6e4) + '分钟' + bs;
    } //小于1小时,按分钟
    if (f < 864e5) {
      return parseInt(f / 36e5) + '小时' + bs;
    } //小于1天按小时
    if (f < 2592e6) {
      return parseInt(f / 864e5) + '天' + bs;
    } //小于1个月(30天),按天数
    if (f < 31536e6) {
      return parseInt(f / 2592e6) + '个月' + bs;
    } //小于1年(365天),按月数
    return parseInt(f / 31536e6) + '年' + bs; //大于365天,按年算
  }

  async getTrainsList() {
    try {
      const travels = await this.getCache('@ZXTrains.travels');
      console.log(travels);
      if (travels) return travels;
    } catch (e) {
      console.log('未找到火车票缓存：' + e);
    }
    return false;
  }

  setWidget = async (body) => {
    let isNone = true;
    try {
      for (const item of this.dataSource) {
        let { trainFlights, timeDesc } = item.orders[0];
        const data = trainFlights[0];
        const passengerInfos = data.passengerInfos[0];
        const fromDate = this.dateToUnixTimestamp(data.fromTime);
        const toDate = this.dateToUnixTimestamp(data.toTime);
        const nowDate = parseInt(new Date().getTime());
        if (fromDate - nowDate < 1000 * 60 * 60 * 24 && nowDate < toDate) {
          const header = body.addStack();
          this.name = data.title;
          await this.renderHeader(
            header,
            this.logo,
            this.name,
            this.widgetColor,
          );
          body.addSpacer();

          const container = body.addStack();
          container.url = 'suanya://';
          container.layoutVertically();
          const timeView = container.addStack();
          timeView.setPadding(10, 10, 10, 10);
          timeView.backgroundColor = new Color('#1890ff');
          timeView.cornerRadius = 5;

          const left = timeView.addStack();
          left.layoutVertically();
          left.addSpacer();
          const leftTimer = left.addText(data.showFromTime);
          leftTimer.font = Font.boldSystemFont(16);
          leftTimer.textColor = Color.white();
          left.addSpacer();
          const leftDesc = left.addText(data.fromCityName);
          leftDesc.font = Font.lightSystemFont(12);
          leftDesc.textColor = Color.white();
          left.addSpacer();

          timeView.addSpacer();

          const center = timeView.addStack();
          center.addSpacer();
          center.layoutVertically();
          const image = await this.$request.get(data.trafficIcon, 'IMG');
          const imageView = center.addImage(image);
          imageView.imageSize = new Size(40, 40);
          center.addSpacer();
          timeView.addSpacer();

          const right = timeView.addStack();
          right.layoutVertically();
          right.addSpacer();
          const rightTimer = right.addText(data.showToTime);
          rightTimer.font = Font.boldSystemFont(16);
          rightTimer.textColor = Color.white();
          right.addSpacer();
          const rightDesc = right.addText(data.toCityName);
          rightDesc.font = Font.lightSystemFont(12);
          rightDesc.textColor = Color.white();
          right.addSpacer();

          const footerView = container.addStack();
          footerView.setPadding(10, 10, 10, 10);
          timeDesc =
            nowDate < fromDate
              ? `距离发车还有${this.timeAgo(fromDate)}`
              : `距离到达还有${this.timeAgo(toDate)}`;
          const footerLeftText = footerView.addText(timeDesc);
          footerLeftText.font = Font.boldSystemFont(12);
          footerLeftText.textColor = this.widgetColor;
          footerLeftText.textOpacity = 0.8;

          footerView.addSpacer();
          const footerRightText = footerView.addText(
            `${passengerInfos.seatCategory} ${passengerInfos.carriageNo} ${passengerInfos.seatNo} `,
          );
          footerRightText.font = Font.boldSystemFont(12);
          footerRightText.textColor = this.widgetColor;
          footerRightText.textOpacity = 0.8;

          isNone = false;
          break;
        }
      }
    } catch (e) {
      console.log(e);
    }
    if (isNone) await this.renderNone(body);
    body.addStack();
    return body;
  };

  renderSmall = async (w) => {
    return this.renderLarge(w);
  };

  renderLarge = async (w) => {
    const header = w.addStack();
    await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    w.addSpacer(20);
    const text = w.addText('暂不支持');
    text.font = Font.boldSystemFont(20);
    text.textColor = this.widgetColor;
    w.addSpacer();
    return w;
  };

  renderMedium = async (w) => {
    return await this.setWidget(w);
  };

  renderNone = async (widget) => {
    const header = widget.addStack();
    await this.renderHeader(header, this.logo, this.name, this.widgetColor);
    widget.addSpacer();
    const bodyIcon = await this.$request.get(
      'https://images3.c-ctrip.com/ztrip/img/dcx_HUOCHE.png',
      'IMG',
    );

    const body = widget.addStack();
    body.url = 'suanya://';

    const container = body.addStack();
    container.layoutVertically();
    const bodyIconView = container.addStack();
    bodyIconView.cornerRadius = 5;

    bodyIconView.addSpacer();
    bodyIconView.backgroundColor = new Color('#1890ff');
    const bodyIconItem = bodyIconView.addImage(bodyIcon);
    bodyIconItem.imageSize = new Size(90, 60);
    bodyIconView.addSpacer();

    container.addSpacer(20);
    const noneView = container.addStack();

    noneView.addSpacer();
    const noneText = noneView.addText('暂无未出行行程');
    noneText.font = Font.boldSystemFont(14);
    noneText.textColor = this.widgetColor;
    noneView.addSpacer();

    return widget;
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
      await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      await this.renderLarge(widget);
    } else {
      await this.renderSmall(widget);
    }
    return widget;
  }
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, '', false); //远程开发环境
