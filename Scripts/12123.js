// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: car;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

const API_PARAMS = {
  api4: 'biz.vio.detail.query',
  infoURL: 'https://miniappcsfw.122.gov.cn:8443/openapi/invokeApi/business/biz',
  api1: 'biz.vio.unhandledVioCount.query',
  productId: 'p10000000000000000001',
  alipay: 'alipays://platformapi/startapp?appId=2019050964403523',
  api2: 'biz.vio.peccancyChannelList.query',
  status:
    'alipays://platformapi/startapp?appId=2019050964403523&page=pages%2Flicense%2Flicense',
  update: 'https://gitcode.net/4qiao/scriptable/raw/master/api/violation.js',
  api3: 'biz.vio.peccancyUnhandleInfoList.query',
  Ver: 'Version 1.2\n\nverifyToken过期需打开Quantumult-X',
};

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg, {
      lightBgColor: '#2581f2',
      darkBgColor: '#2581f2',
      darkColor: '#fff',
      lightColor: '#fff',
    });
    this.en = '12123';
    this.name = '交管 12123';
    config.runsInApp &&
      this.registerAction({
        icon: { name: 'paperplane', color: '#722ed1' },
        type: 'input',
        title: 'Token',
        desc: '微信小程序交管12123获取',
        val: 'Token',
        onClick: async () => {
          const token = this.settings.token;
          this.settings.token =
            (await this.getCache('wx_12123', false)) || token;
          if (this.settings.token) this.saveSettings(false);
          return this.setAlertInput('Token', '设置 token', {
            token: '微信小程序交管12123获取',
          });
        },
      });

    config.runsInApp && this.registerAction('基础设置', this.setWidgetConfig);
  }

  format = (str) => {
    return parseInt(str) >= 10 ? str : `0${str}`;
  };

  date = new Date();
  arrUpdateTime = [
    this.format(this.date.getMonth() + 1),
    this.format(this.date.getDate()),
    this.format(this.date.getHours()),
    this.format(this.date.getMinutes()),
  ];

  dataSource = {
    left: {
      title: '川 G88888',
      icon: 'car.fill',
      listItem: [
        { label: '未处违法', value: `0`, unit: '条' },
        { label: '车辆状态', value: '正常' },
        { label: '上次更新', value: '00:00' },
      ],
    },
    right: {
      title: '驾驶证',
      icon: 'creditcard.fill',
      listItem: [
        { label: '证件状态', value: '正常' },
        { label: '累计扣分', value: `0`, unit: '分' },
        { label: '重置日期', value: '—' },
      ],
    },
  };

  init = async () => {
    this.settings.token =
      (await this.getCache('wx_12123', false)) || this.settings.token;
    if (this.settings.dataSource) {
      this.dataSource = this.settings.dataSource;
    } else {
      await this.cacheData();
    }
    this.cacheData();
  };

  cacheData = async () => {
    try {
      const token = this.settings.token.replace('params=', '');
      const body = JSON.parse(decodeURIComponent(token));
      const params = {
        sign: body.sign,
        // businessId: body.businessId,
        verifyToken: body.verifyToken,
        // businessPrincipalId: body.businessPrincipalId,
      };

      const response = await this.$request.post(API_PARAMS.infoURL, {
        body: `params=${JSON.stringify({
          api: API_PARAMS.api1,
          productId: API_PARAMS.productId,
          ...params,
        })}`,
      });
      console.log(response);
      if (response.success) {
        const illegal = response.data.list[0] || {};
        this.dataSource.left.listItem[0].value = illegal.count || 0;

        const details = await this.$request.post(API_PARAMS.infoURL, {
          body: `params=${encodeURIComponent(
            JSON.stringify({
              api: 'biz.user.integration.query',
              productId: API_PARAMS.productId,
              ...params,
            })
          )}`,
        });

        console.log(details);

        if (details.success) {
          const { drivingLicense, vehicles } = details.data;
          const reaccDate = drivingLicense.reaccDate.split('-');
          this.dataSource.right.title = `驾驶证 ${drivingLicense.allowToDrive}`;
          this.dataSource.right.listItem[1].value =
            drivingLicense.cumulativePoint;
          this.dataSource.right.listItem[2].value = `${reaccDate[1]}-${reaccDate[2]}`;

          if (vehicles.length) {
            this.dataSource.left.title = vehicles[0].plateNumber;
          }
        }

        this.dataSource.left.listItem[2].value = `${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`;

        this.settings.dataSource = this.dataSource;
        this.saveSettings(false);
      } else {
        this.notify(
          `verifyToken已过期 ⚠️`,
          '点击通知框自动跳转到支付宝小程序交管12123页面获取最新的Token ( 请确保已打开辅助工具 )',
          API_PARAMS.alipay
        );
      }
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

      const valueText = listItemStack.addText(`${item.value}`);
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
