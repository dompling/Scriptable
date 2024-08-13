// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: car;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

/**
 * 重写修改自作者
 * @channel https://t.me/yqc_123/
 * @feedback https://t.me/NobyDa_Chat
 * @author 小白脸|𝐎𝐍𝐙𝟑𝐕
 *
 * 添加重写：https://raw.githubusercontent.com/dompling/Script/master/wsgw/index.js
 *
 */

const defaultData = {
  user: '**',
  left: {
    dayElePq: [],
    balance: 0,
    arrearsOfFees: false,
  },
  right: {
    previousBill: 0,
    previousBillRate: 0,
    thisYear: 0,
    thisYearRate: 0,
  },
  update: '',
};

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.en = 'wsgw';
    this.name = '网上国网';
    this.userNum = args.widgetParameter || 0;
    if (config.runsInApp) {
      this.registerAction({
        icon: { name: 'photo.tv', color: '#5A74EF' },
        type: 'color',
        title: '左侧背景',
        desc: '左侧背景色',
        val: 'leftColor',
      });
      this.registerAction('基础设置', this.setWidgetConfig);
    }
  }

  date = new Date();

  dataSource = { ...defaultData };

  init = async () => {
    if (this.settings.data && this.settings.data.length) {
      this.dataSource = { ...this.settings.data[this.userNum] };
    } else {
      await this.cacheData();
    }
    console.log(`当前用户下标：${this.userNum}`);
    this.cacheData();
  };

  cacheData = async () => {
    try {
      const response = await this.$request.get(
        'http://api.wsgw-rewrite.com/electricity/bill/all'
      );
      this.settings.data = [];
      response.forEach((dataInfo) => {
        const dataSource = {
          user: '**',
          left: {
            dayElePq: [],
            balance: 0,
            arrearsOfFees: false,
          },
          right: {
            previousBill: 0,
            previousBillRate: 0,
            thisYear: 0,
            thisYearRate: 0,
          },
          update: '',
        };

        dataSource.user = dataInfo.userInfo.consName_dst.replaceAll('*', '');
        dataSource.left.balance = parseFloat(dataInfo.eleBill.sumMoney);
        dataSource.left.dayElePq = dataInfo.dayElecQuantity.sevenEleList
          .filter((item) => item.dayElePq !== '-')
          .map((item) => ({
            label: item.day,
            value: parseFloat(item.dayElePq),
          }));

        dataSource.left.arrearsOfFees = dataInfo.arrearsOfFees;

        dataSource.right.previousBill = parseFloat(
          this.last(dataInfo.monthElecQuantity.mothEleList).monthEleCost
        );

        const oldVal = this.last(
          dataInfo.monthElecQuantity.mothEleList,
          2
        ).monthEleCost;

        dataSource.right.previousBillRate =
          ((dataSource.right.previousBill - oldVal) / oldVal) * 100;

        dataSource.right.previousBillRate = parseFloat(
          dataSource.right.previousBillRate.toFixed(2)
        );

        dataSource.right.thisYear = parseFloat(
          dataInfo.monthElecQuantity.dataInfo.totalEleCost
        );

        const lastYearVal = dataInfo.lastYearElecQuantity.dataInfo.totalEleCost;

        dataSource.right.thisYearRate =
          ((dataSource.right.thisYear - lastYearVal) / lastYearVal) * 100;

        dataSource.right.thisYearRate = parseFloat(
          dataSource.right.thisYearRate.toFixed(2)
        );

        dataSource.update = dataInfo.eleBill.date;
        this.settings.data.push({ ...dataSource });
      });
      console.log(this.settings.data);
      this.dataSource = { ...this.settings.data[this.userNum] };
      this.saveSettings(false);
    } catch (e) {
      console.log(`接口数据异常：请检查 BoxJS 重写`);
      console.log(e);
    }
  };

  last = (data = [], index = 1) => {
    return data[data.length - index];
  };

  renderImage = async (uri) => {
    return this.$request.get(uri, 'IMG');
  };

  notSupport(w) {
    const stack = w.addStack();
    stack.addText('暂不支持');
    return w;
  }

  barChart() {
    return `
    {
  "type": "bar",
  "data": {
    "labels": ${JSON.stringify(this.dataSource.left.dayElePq.map((item) => item.label).reverse())},
    "datasets": [
      {
        "label": "Sales",
        "data": ${JSON.stringify(this.dataSource.left.dayElePq.map((item) => parseFloat(item.value)).reverse())},
        "backgroundColor": "#fff",
        "borderColor": "#fff",
        "borderWidth": 1,
        "borderRadius": {
          "topLeft": 30,
          "topRight": 30,
          "bottomLeft": 30,  // 只为柱状图底部设置圆角
          "bottomRight": 30
        },
        "barPercentage": 0.8,  // 控制柱子的宽度
        "categoryPercentage": 0.4,
        "borderSkipped": false  // 应用自定义的圆角设置
      }
    ]
  },
  "options": {
    "plugins": {
      "legend": {
        "display": false  // 隐藏图例
      },
      "title": {
        "display": false  // 隐藏标题
      }
    },
    "scales": {
      "x": {
        "display": false  // 完全隐藏 X 轴
      },
      "y": {
        "display": false  // 完全隐藏 Y 轴
      }
    },
    "layout": {
      "padding": 0  // 移除图表周围的内边距
    }
  }
}
`;
  }

  createLeft = async (widget) => {
    const fontStyle = { color: new Color('#fff'), size: 20, opacity: 0.8 };
    const leftStack = widget.addStack();
    leftStack.cornerRadius = 10;
    leftStack.layoutVertically();
    leftStack.backgroundColor = new Color(
      this.settings.leftColor || '#5A74EF',
      0.8
    );
    leftStack.setPadding(10, 10, 10, 10);

    const chartStack = leftStack.addStack();

    const chartImage = await this.renderImage(
      `https://quickchart.io/chart?v=4&w=800&h=400&f=png&c=${encodeURIComponent(this.barChart())}`
    );
    const chartImageStack = chartStack.addImage(chartImage);
    chartImageStack.imageSize = new Size(120, 60);

    leftStack.addSpacer();

    this.provideText('Balance', leftStack, fontStyle);

    const todayStack = leftStack.addStack();
    todayStack.centerAlignContent();
    if (this.dataSource.left.arrearsOfFees)
      fontStyle.color = new Color('#f65755');

    fontStyle.size = 20;
    this.provideText('¥ ', todayStack, fontStyle);

    fontStyle.opacity = 1;
    const todayUse = this.dataSource.left.balance;

    this.provideText(` ${todayUse.toLocaleString()}`, todayStack, fontStyle);
  };

  createDot = (stack, color) => {
    const dotStack = stack.addStack();
    dotStack.setPadding(0, 0, 2, 0);
    const dot = dotStack.addStack();

    dot.size = new Size(10, 10);
    dot.backgroundColor = new Color(color);
    dot.cornerRadius = 10;
  };

  createCell = (widget, data = { title: '', num: 0, radio: 0 }) => {
    const cellStack = widget.addStack();
    cellStack.backgroundColor = new Color('#404045');
    cellStack.setPadding(10, 10, 10, 10);
    cellStack.cornerRadius = 10;
    cellStack.layoutVertically();

    const fontStyle = { color: new Color('#fff'), size: 14, opacity: 0.6 };
    this.provideText(data.title, cellStack, fontStyle);

    const dataStack = cellStack.addStack();
    dataStack.bottomAlignContent();

    fontStyle.size = 12;
    this.provideText('¥ ', dataStack, fontStyle);

    fontStyle.opacity = 1;
    fontStyle.size = 20;
    this.provideText(` ${data.num.toLocaleString()}`, dataStack, fontStyle);
    dataStack.addSpacer();

    const dotStack = dataStack.addStack();
    this.createDot(dotStack, data.radio > 0 ? '#7EEF8F' : '#ED86A5');

    fontStyle.size = 12;
    this.provideText(
      data.radio > 0 ? ` +${data.radio}%` : ` -${Math.abs(data.radio)}%`,
      dataStack,
      fontStyle
    );
  };

  createRight = async (widget) => {
    const rightStack = widget.addStack();
    rightStack.layoutVertically();
    this.createCell(rightStack, {
      title: 'Last Month',
      num: this.dataSource.right.previousBill,
      radio: this.dataSource.right.previousBillRate,
    });
    rightStack.addSpacer();
    this.createCell(rightStack, {
      title: 'This Year',
      num: this.dataSource.right.thisYear,
      radio: this.dataSource.right.thisYearRate,
    });
  };

  renderSmall = async (w) => {
    w.setPadding(10, 10, 10, 10);
    await this.createLeft(w);
    return w;
  };

  renderMedium = async (w) => {
    w.setPadding(10, 10, 10, 10);
    const containerStack = w.addStack();
    containerStack.layoutHorizontally();
    await this.createLeft(containerStack);
    containerStack.addSpacer(10);
    await this.createRight(containerStack);
    return w;
  };

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    widget.url = `com.wsgw.e.zsdl://platformapi/`;
    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === 'medium') {
      return await this.renderMedium(widget);
    } else if (this.widgetFamily === 'large') {
      return await this.notSupport(widget);
    } else {
      return await this.renderSmall(widget);
    }
  }
}

// @组件代码结束
await Runing(Widget, '0', false); //远程开发环境
