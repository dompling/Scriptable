// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: shopping-cart;
// Author: 脑瓜
// 电报群: https://t.me/Scriptable_JS @anker1209
// 采用了2Ya美女的京豆收支脚本及DmYY依赖 https://github.com/dompling/Scriptable/tree/master/Scripts
// version:2.2.5
// update:2021/11/08

if (typeof require === 'undefined') require = importModule;
const {DmYY, Runing} = require('./DmYY');

class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '京东多合一';
    this.en = 'jd_in_one';
    this.run(module.filename, args);
  }
  fm = FileManager.local();
  CACHE_FOLDER = 'JD_in_one';
  cachePath = null;

  logo = 'https://pic.imgdb.cn/item/6187994b2ab3f51d919028cc.png';
  JDImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/43300bf7-61a2-4bd1-94a1-bf2faa2ed9e8.png';
  beanImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/7ea91cf8-6dea-477c-ae72-cb4d3f646c34.png';
  plusFG = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/cd0d2b80-0857-4202-8d12-af4eb7d241d6.png';
  plusBG = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/24fc5a14-edea-4b1b-8e30-bdcc1a27a037.png';
  baitiaoImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/30c40f5b-7428-46c3-a2c0-d81b2b95ec41.png';
  plusIcon = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/06f78540-a5a4-462e-b8c5-98cb8059efc1.png';
  walletImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/cd89ceec-7895-41ee-a1a3-3d3e7223035f.png';
  jingtieImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/16a7038e-6082-4ad8-b17f-fdd08266fb22.png';
  gangbengImg = 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/9704e332-9e7f-47e8-b09a-1f1991d4aa84.png';
  userImage = 'https://img11.360buyimg.com/jdphoto/s120x120_jfs/t21160/90/706848746/2813/d1060df5/5b163ef9N4a3d7aa6.png';
  nameImg = 'https://pic.imgdb.cn/item/6188bfb62ab3f51d91bca276.png';
  tagImg = 'https://pic.imgdb.cn/item/6188bfc72ab3f51d91bcbcb0.png';

  // 请勿在此修改参数值

  version = '2.2.5';
  basicSetting = {
    scale: 1.00,
    logo: 30,
    userImage: 69,
    userStack: 103,
    division: 25,
    interval: 10,
    directory: 'Local',
    customizeName: '',
    customizeAvatar: '',
    smallShowType: '京豆、钱包数据',
    walletShowType: '红包',
  };
  chartSetting = {
    height: 130,
    daySize: 9,
    dayText: '',
    textSize: 18,
    textDayColor: '999999', 
    textNightColor: '999999',
    lineColor: '#FA6859',
    linePadding: 15,
    barPadding: 5,
    smallShowType: '双日视图',
    showType: '双日视图',
    countBean: '收入-支出',
    colorful: '关闭',
  };
  funcSetting = {
    showBaitiao: '打开',
    showPackage: '关闭',
    showFruit: '打开',
    logable: '关闭',
    alwaysRefreshChart: '打开',
  };
  package = {
    number: 0,
    title: '',
    desc: '',
    time: '',
    status: '',
  };
  baitiao = {
    title: '',
    number: 0,
    desc: '',
  };
  redPackage = {
    title: '红包',
    number: 0,
    desc: '今日无过期',
  };
  extra = {
    jingtie: 0,
    gangbeng: 0,
  };
  bean = {
    todayIncome: 0,
    todayExpense: 0,
    ydayIncome: 0,
    ydayExpense: 0,
  };

  nickName = '未知用户';
  jValue = '0';
  isPlus = false;

  cookie = '';
  userName = '';
  CookiesData = [];
  cacheChart = false;
  beanCount = 0;
  maxDays = 6;
  rangeTimer = {};
  timerKeys = [];
  fruitState = "😢";
  
  doubleDate = this.getDay(1);
  doubleDay = Object.keys(this.doubleDate);
  yestoday = this.doubleDay[0];
  today = this.doubleDay[1];
  CACHES = [];

  lineChart(labels = [], datas = [], chartTextSize, topPadding) {
    let chartTextColor = Color.dynamic(new Color(this.chartSetting.textDayColor),new Color(this.chartSetting.textNightColor),);
    let lineColor = this.chartSetting.lineColor.split(',');
    const chartStr = `
    {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [
        {
          type: 'line',
          backgroundColor: '#FFFFFF',
          borderColor: getGradientFillHelper('horizontal', ${JSON.stringify(lineColor)}),
          borderWidth: ${this.isSmall(true) ? 4 : 3},
          pointRadius: ${this.isSmall(true) ? 8 : 6},
          fill: false,
          showLine: true,
          data: ${JSON.stringify(datas)},
        },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            display: true,
            align: 'top',
            color: '#${chartTextColor.hex}',
            font: {
              family: 'ArialMT',
              size: ${chartTextSize}
            }
          },
        },
        layout: {
          padding: {
            left: -20,
            right: 0,
            top: ${topPadding},
            bottom: 0
          }
        },
        responsive: true,
        maintainAspectRatio: true,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              display: false,
            },
          },
          ],
          yAxes: [
          {
            ticks: {
              display: false,
              beginAtZero: false,
            },
            gridLines: {
              display: false,
            },
          },
          ],
        },
      },
    }`;
    return chartStr;
  }

  barChart(labels = [], datas = [], chartTextSize, topPadding, showType) {
    let chartTextColor = Color.dynamic(new Color(this.chartSetting.textDayColor),new Color(this.chartSetting.textNightColor),);
    let backgroundColor = [];
    if (this.chartSetting.colorful === '打开') backgroundColor = JSON.stringify(this.colorfulBar())
      else backgroundColor = `getGradientFillHelper('vertical', ${JSON.stringify(this.chartColors())})`
    const chartStr = `
    {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [
        {
          type: '${showType}',
          borderWidth: 0,
          pointRadius: 0,
          barPercentage: 0.5,
          backgroundColor: ${backgroundColor},
          borderColor: false,
          data: ${JSON.stringify(datas)},
        },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            display: true,
            align: 'top',
            offset: -4,
            anchor:'end',
            color: '#${chartTextColor.hex}',
            font: {
              family: 'ArialMT',
              size: ${chartTextSize}
            }
          },
        },
        layout: {
          padding: {
            left: -20,
            right: 0,
            top: ${topPadding},
            bottom: 0
          }
        },
        responsive: true,
        maintainAspectRatio: true,
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        scales: {
          xAxes: [
          {
            gridLines: {
              offsetGridLines: true,
              display: false,
            },
            ticks: {
              display: false,
            },
          },
          ],
          yAxes: [
          {
            ticks: {
              display: false,
              beginAtZero: true,
            },
            gridLines: {
              offsetGridLines: true,
              display: false,
            },
          },
          ],
        },
      },
    }`;
    return chartStr;
  }

  chartColors () {
    let colorArr = [['#FFF000', '#E62490'], ['#FDEB71', '#F8D800'], ['#ABDCFF', '#0396FF'], ['#FEB692', '#EA5455'], ['#FEB692', '#EA5455'], ['#CE9FFC', '#7367F0'], ['#90F7EC', '#32CCBC'], ['#FFF6B7', '#F6416C'], ['#E2B0FF', '#9F44D3'], ['#F97794', '#F072B6'], ['#FCCF31', '#F55555'], ['#5EFCE8', '#736EFE'], ['#FAD7A1', '#E96D71'], ['#FFFF1C', '#00C3FF'], ['#FEC163', '#DE4313'], ['#F6CEEC', '#D939CD'], ['#FDD819', '#E80505'], ['#FFF3B0', '#CA26FF'], ['#2AFADF', '#4C83FF'], ['#EECDA3', '#EF629F'], ['#C2E59C', '#64B3F4'], ['#FFF886', '#F072B6'], ['#F5CBFF', '#C346C2'], ['#FFF720', '#3CD500'], ['#EE9AE5', '#5961F9'], ['#FFC371', '#FF5F6D'], ['#FFD3A5', '#FD6585'], ['#C2FFD8', '#465EFB'], ['#FFC600', '#FD6E6A'], ['#FFC600', '#FD6E6A'], ['#92FE9D', '#00C9FF'], ['#FFDDE1', '#EE9CA7'], ['#F0FF00', '#58CFFB'], ['#FFE985', '#FA742B'], ['#72EDF2', '#5151E5'], ['#F6D242', '#FF52E5'], ['#F9D423', '#FF4E50'], ['#3C8CE7', '#00EAFF'], ['#FCFF00', '#FFA8A8'], ['#FF96F9', '#C32BAC'], ['#D0E6A5', '#FFDD94'], ['#FFDD94', '#FA897B'], ['#FFCC4B', '#FF7D58'], ['#D0E6A5', '#86E3CE'], ['#F0D5B6', '#F16238'], ['#F8EC70', '#F9C708'], ['#C4E86B', '#00BCB4'], ['#F5CEC7', '#E79796'], ['#FFC446', '#FA0874'], ['#E1EE32', '#FFB547'], ['#FFD804', '#2ACCC8'], ['#E9A6D2', '#E9037B'], ['#F8EC70', '#49E2F6'], ['#A2F8CD', '#A2F852'], ['#49E2F6', '#A2F8CD'], ['#FDEFE2', '#FE214F'], ['#F8EC70', '#A2F8CD'], ['#F8EC70', '#49E2F6'], ['#D1FFB7', '#FFB7D1'], ['#B7FFE4', '#E4B7FF'], ['#FFB7D1', '#E4B7FF'], ['#D0E6A5', '#86E3CE'], ['#E8E965', '#64C5C7']];
    let chartColors = colorArr[Math.floor(Math.random() * colorArr.length)];
    //chartColors = ['#DB36A4', '#F7FF00']; // 固定京豆图表填充颜色
    return chartColors;
  }

  colorfulBar () {
    let colorArr = [['#1B9E77', '#D95F02', '#7570B3', '#E7298A', '#66A61E', '#E6AB02'], ['#F46277', '#FC8D59', '#FEE08B', '#E6F598', '#99D594', '#3288BD'], ['#A6CEE3', '#1F78B4', '#B2DF8A', '#33A02C', '#FB9A99', '#E31A1C'], ['#E41A1C', '#377EB8', '#4DAF4A', '#984EA3', '#FF7F00', '#9ED80E'], ['#F81B02', '#FC7715', '#AFBF41', '#50C49F', '#3B95C4', '#B560D4'], ['#FFC000', '#A5D028', '#08CC78', '#F24099', '#5AA6C0', '#F56617'], ['#F09415', '#C1B56B', '#4BAF73', '#5AA6C0', '#D17DF9', '#FA7E5C'], ['#0F6FC6', '#009DD9', '#0BD0D9', '#10CF9B', '#7CCA62', '#A5C249'], ['#9ACD4C', '#FAA93A', '#D35940', '#B258D3', '#63A0CC', '#8AC4A7'], ['#A7EA52', '#EFAB16', '#78AC35', '#35ACA2', '#4083CF', '#FF8021'], ['#9EC544', '#50BEA3', '#4A9CCC', '#9A66CA', '#C54F71', '#DE9C3C'], ['#41AEBD', '#97E9D5', '#A2CF49', '#608F3D', '#F4DE3A', '#FCB11C'], ['#2FA3EE', '#4BCAAD', '#86C157', '#D99C3F', '#CE6633', '#A35DD1'], ['#3399FF', '#69FFFF', '#CCFF33', '#3333FF', '#9933FF', '#FF33FF'], ['#FBC01E', '#EFE1A2', '#FA8716', '#F2575F', '#A5D848', '#A155F9'], ['#90C226', '#54A021', '#E6B91E', '#E76618', '#C42F1A', '#FA8716'], ['#0F6FC6', '#009DD9', '#0BD0D9', '#10CF9B', '#7CCA62', '#A5C249'], ['#FFB91D', '#F97817', '#6DE304', '#F98080', '#8F58F9', '#F789EA'], ['#C70F0C', '#DD6B0D', '#FAA700', '#93E50D', '#17C7BA', '#0A96E4'], ['#40BAD2', '#FAB900', '#90BB23', '#EE7008', '#1AB39F', '#D5393D'], ['#80B606', '#E29F1D', '#2397E2', '#35ACA2', '#5430BB', '#8D34E0'], ['#549E39', '#8AB833', '#C0CF3A', '#029676', '#4AB5C4', '#0989B1'], ['#99CB38', '#63A537', '#37A76F', '#44C1A3', '#4EB3CF', '#51C3F9'], ['#8C73D0', '#C2E8C4', '#C5A6E8', '#B45EC7', '#9FDAFB', '#95C5B0'], ['#1CADE4', '#2683C6', '#27CED7', '#42BA97', '#3E8853', '#62A39F'], ['#B31166', '#E33D6F', '#E45F3C', '#E9943A', '#9B6BF2', '#D53DD0'], ['#76C5EF', '#FEA022', '#FF6700', '#70A525', '#A5D848', '#20768C'], ['#A1D68B', '#5EC795', '#4DADCF', '#CDB756', '#E29C36', '#8EC0C1'], ['#418AB3', '#A6B727', '#F69200', '#80C34F', '#FEC306', '#DF5327'], ['#7FD13B', '#EA157A', '#FEB80A', '#00ADDC', '#738AC8', '#1AB39F'], ['#F0AD00', '#60B5CC', '#E66C7D', '#6BB76D', '#E88651', '#C64847'], ['#5B9BD5', '#ED7D31', '#A5D848', '#FFC000', '#4472C4', '#70AD47'], ['#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646'], ['#F95F9A', '#AC66BB', '#DE6C36', '#F9B639', '#CF6DA4', '#FA8D3D'], ['#F2D908', '#9DE61E', '#0D8BE6', '#C61B1B', '#E26F08', '#8D35D1'], ['#A5B592', '#F3A447', '#E7BC29', '#D092A7', '#9C85C0', '#809EC2'], ['#30ACEC', '#80C34F', '#E29D3E', '#D64A3B', '#D64787', '#A666E1'], ['#A2C816', '#E07602', '#E4C402', '#7DC1EF', '#21449B', '#A2B170'], ['#FF7F01', '#F1B015', '#FBEC85', '#D2C2F1', '#DA5AF4', '#9D09D1'], ['#FDA023', '#A7EA52', '#5ECCF3', '#64A73B', '#EB5605', '#B9CA1A'], ['#00C6BB', '#6FEBA0', '#B6DF5E', '#EFB251', '#EF755F', '#ED515C'], ['#E32D91', '#C830CC', '#4EA6DC', '#4775E7', '#8971E1', '#D54773'], ['#1CADE4', '#2683C6', '#27CED7', '#42BA97', '#3E8853', '#62A39F'], ['#073779', '#8FD9FB', '#FFCC00', '#EB6615', '#C76402', '#B523B4'], ['#4E67C8', '#5ECCF3', '#A7EA52', '#5DCEAF', '#FF8021', '#F14124'], ['#3891A7', '#FEB80A', '#FC8389', '#84AA33', '#F9934E', '#4379EF'], ['#990000', '#FF6600', '#FFBA00', '#99CC00', '#528A02', '#9C007F'], ['#F7901E', '#FEC60B', '#9FE62F', '#4EA5D1', '#4282EA', '#854FED'], ['#E8BC4A', '#83C1C6', '#E78D35', '#909CE1', '#839C41', '#F9826E'], ['#86CE24', '#00A2E6', '#FAC810', '#AA69F7', '#D06B20', '#FF8021'], ['#DF2E28', '#FE801A', '#E9BF35', '#81BB42', '#32C7A9', '#4A9BDC'], ['#31B6FD', '#4584D3', '#5BD078', '#A5D028', '#F5C040', '#05E0DB'], ['#FFCA08', '#F8931D', '#CE8D3E', '#EC7016', '#E64823', '#9C6A6A'], ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948'], ['#4E79A7', '#A0CBE8', '#F28E2B', '#FFBE7D', '#59A14F', '#8CD17D'], ['#E03531', '#F0BD27', '#51B364', '#FF684C', '#FFDA66', '#8ACE7E'], ['#4E9F50', '#87D180', '#EF8A0C', '#FCC66D', '#3CA8BC', '#98D9E4'], ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#E377C2'], ['#32A251', '#ACD98D', '#FF7F0F', '#FFB977', '#3CB7CC', '#98D9E4'], ];
    let chartColors = colorArr[Math.floor(Math.random() * colorArr.length)];
    //chartColors = ['#C1B14A','#6FBC75','#39B6B3','#86A1CD','#D083AB','#DF786B']; // 固定京豆图表填充颜色
    return chartColors;
  }

  isSmall (a = false) {
    if (a) return config.widgetFamily == 'small' ? true : false;
    else return config.widgetFamily == 'small' ? '_small' : '';
  }

  // #####################小组件###################
  renderSmall = async (w) => {
    const bodyStack = w.addStack();
    bodyStack.layoutVertically();
    if (this.basicSetting.smallShowType === '个人信息') {
      await this.setUserShow(bodyStack);
    } else {
      await this.setHeaderShow(bodyStack);
      bodyStack.addSpacer();
      switch (this.chartSetting.smallShowType) {
        case '折线图表' :
        await this.setChartShow(bodyStack, 1);
        break;
        case '柱状图表' :
        await this.setChartShow(bodyStack, 2);
        break;
        case '曲线面积图':
        await this.setChartShow(bodyStack, 3);
        break;
        default:
        await this.setBeanShow(bodyStack, 22 * this.basicSetting.scale, 40 * this.basicSetting.scale);
      }
      bodyStack.addSpacer(5 * this.basicSetting.scale);
      if (this.funcSetting.showBaitiao === '打开' && this.baitiao.number > 0) {
        await this.setBaitiaoShow(bodyStack, true);
      } else if (this.basicSetting.walletShowType === '红包') {
        await this.setRedPackageShow(bodyStack, true);
      } else {
        await this.setCoinShow(bodyStack, true);
      }
    }
    return w;
  }

  // #####################中组件###################
  renderMedium = async (w) => {
    const bodyStack = w.addStack();
    await this.setUserShow(bodyStack);
    bodyStack.addSpacer(this.basicSetting.division * this.basicSetting.scale);
    const mainStack = bodyStack.addStack();
    mainStack.layoutVertically();
    await this.setHeaderShow(mainStack, this.JDImg);
    mainStack.addSpacer();
    if (this.funcSetting.showPackage === '打开' && this.package.number > 0) {
      await this.setPackageShow(mainStack);
      mainStack.addSpacer();
    } else {
      switch (this.chartSetting.showType) {
        case '折线图表':
        await this.setChartShow(mainStack, 1);
        mainStack.addSpacer(5 * this.basicSetting.scale);
        break;
        case '柱状图表':
        await this.setChartShow(mainStack, 2);
        mainStack.addSpacer(5 * this.basicSetting.scale);
        break;
        case '曲线面积图':
        await this.setChartShow(mainStack, 3);
        mainStack.addSpacer(5 * this.basicSetting.scale);
        break;
        default:
        await this.setBeanShow(mainStack, 30 * this.basicSetting.scale, 50 * this.basicSetting.scale);
        mainStack.addSpacer();
      }
    }
    if (this.funcSetting.showBaitiao === '打开' && this.baitiao.number > 0) {
      await this.setBaitiaoShow(mainStack);
    } else if (this.basicSetting.walletShowType === '红包') {
      await this.setRedPackageShow(mainStack);
    } else {
      await this.setCoinShow(mainStack);
    }
    return w;
  }

  // #####################大组件###################
  renderLarge = async (w) => {
    const bodyStack = w.addStack();
    bodyStack.size = new Size(0, 150);
    bodyStack.addSpacer();
    await this.setUserShow(bodyStack);
    bodyStack.addSpacer();
    w.addSpacer(20);
    const text = w.addText('\u6211\u600e\u4e48\u8fd9\u4e48\u597d\u770b');
    w.addSpacer(20);
    text.font = Font.thinSystemFont(30);
    text.centerAlignText();
    const emoji = w.addText('🤣🥰🤪');
    emoji.centerAlignText();
    w.addSpacer();
    return w;
  }

  // #####################用户信息###################
  async setUserShow(stack) {
    const userStack = stack.addStack();
    userStack.size = new Size(this.basicSetting.userStack * this.basicSetting.scale, 0);
    userStack.layoutVertically();
    // 头像
    const userImgStack = userStack.addStack();
    userImgStack.addSpacer();
    const imgStack = userImgStack.addStack();
    if (this.isPlus) {
      imgStack.size = new Size(this.basicSetting.userImage * this.basicSetting.scale, this.basicSetting.userImage * this.basicSetting.scale * 1.039);
      imgStack.backgroundImage = await this.getImageByUrl(this.plusBG, 'plusBGImage.png');
    }
    const subStack = imgStack.addStack();
    subStack.url = 'openapp.jdmobile://';
    subStack.size = new Size(this.basicSetting.userImage * this.basicSetting.scale, this.basicSetting.userImage * this.basicSetting.scale);
    subStack.cornerRadius = this.basicSetting.userImage / 2 * this.basicSetting.scale;
    subStack.backgroundImage = await this.getImageByUrl(this.basicSetting.customizeAvatar || this.userImage, `userImage_${this.userName}.png`);
    if (this.isPlus) {
      const userImg = subStack.addImage(await this.getImageByUrl(this.plusFG, 'plusFGImage.png'));
    }
    userImgStack.addSpacer();
    userStack.addSpacer();
    // 物流提示
    const tipStack = userStack.addStack();
    tipStack.addSpacer();
    const signStack = tipStack.addStack();
    signStack.size = new Size(14 * this.basicSetting.scale, 14 * this.basicSetting.scale)
    signStack.backgroundColor = new Color('0dD6A0');
    signStack.cornerRadius = 14 * this.basicSetting.scale / 2;
    signStack.centerAlignContent();
    let signIcon = SFSymbol.named('checkmark');
    const signItem = signStack.addImage(signIcon.image);
    signItem.imageSize = new Size(8 * this.basicSetting.scale, 8 * this.basicSetting.scale);
    signItem.tintColor = new Color('FFFFFF');
    if (this.package.number > 0) {
      tipStack.addSpacer(3 * this.basicSetting.scale);
      const packageStack = tipStack.addStack();
      packageStack.size = new Size(14 * this.basicSetting.scale, 14 * this.basicSetting.scale)
      packageStack.backgroundColor = new Color('FC8600');
      packageStack.cornerRadius = 14 * this.basicSetting.scale / 2;
      packageStack.centerAlignContent();
      packageStack.setPadding(1 * this.basicSetting.scale, 2 * this.basicSetting.scale, 1 * this.basicSetting.scale, 2 * this.basicSetting.scale);
      let packageNum = packageStack.addText(this.package.number.toString());
      packageNum.font = Font.mediumSystemFont(15 * this.basicSetting.scale);
      packageNum.textColor = new Color('FFFFFF');
      packageNum.minimumScaleFactor = 0.1;
    }
    if (this.funcSetting.showFruit === '打开') {
      tipStack.addSpacer(3 * this.basicSetting.scale);
      const fruitStack = tipStack.addStack();
      fruitStack.size = new Size(14 * this.basicSetting.scale, 14 * this.basicSetting.scale)
      fruitStack.backgroundColor = new Color('118AB2');
      fruitStack.cornerRadius = 14 * this.basicSetting.scale / 2;
      fruitStack.centerAlignContent();
      fruitStack.setPadding(1 * this.basicSetting.scale, 2 * this.basicSetting.scale, 1 * this.basicSetting.scale, 2 * this.basicSetting.scale);
      let fruitText = fruitStack.addText(this.fruitState);
      fruitText.font = Font.mediumSystemFont(15 * this.basicSetting.scale);
      fruitText.textColor = new Color('FFFFFF');
      fruitText.minimumScaleFactor = 0.1;
    }
    tipStack.addSpacer();
    userStack.addSpacer();
    // 用户名
    const nameStack = userStack.addStack();
    nameStack.centerAlignContent();
    if (this.isPlus) {
      const nameImg = nameStack.addImage(await this.getImageByUrl(this.plusIcon, 'plusIcon.png'));
      nameImg.imageSize = new Size(15 * this.basicSetting.scale, 15 * this.basicSetting.scale);
    } else {
      const nameIcon = nameStack.addImage(await this.getImageByUrl(this.nameImg, 'nameImg.png'));
      nameIcon.imageSize = new Size(15 * this.basicSetting.scale, 15 * this.basicSetting.scale);
    }
    nameStack.addSpacer(5 * this.basicSetting.scale);
    const name = nameStack.addText(this.basicSetting.customizeName || this.nickName);
    name.lineLimit = 1;
    name.font = Font.regularSystemFont(14 * this.basicSetting.scale);
    userStack.addSpacer(5 * this.basicSetting.scale);
    // 京享值
    const valueStack = userStack.addStack();
    valueStack.centerAlignContent();
    const lableIcon = valueStack.addImage(await this.getImageByUrl(this.tagImg, 'tagImg.png'));
    lableIcon.imageSize = new Size(15 * this.basicSetting.scale, 15 * this.basicSetting.scale);
    valueStack.addSpacer(5 * this.basicSetting.scale);
    const value = valueStack.addText(this.jValue.toString());
    value.font = Font.mediumSystemFont(14 * this.basicSetting.scale);

    valueStack.addSpacer(5 * this.basicSetting.scale);
    const jStack = valueStack.addStack();
    jStack.backgroundColor = new Color('fa2d19'); // “京享”二字背景颜色
    jStack.cornerRadius = 5;
    jStack.setPadding(1 * this.basicSetting.scale, 4 * this.basicSetting.scale, 1 * this.basicSetting.scale, 4 * this.basicSetting.scale);
    const jLable = jStack.addText('京享');
    jLable.font = Font.systemFont(8 * this.basicSetting.scale);
    jLable.textColor = new Color('FFFFFF') // “京享”二字字体颜色
    ;[name, value].map(t => t.textColor = this.widgetColor);
  }

  // #####################顶部内容###################
  async setHeaderShow(stack, image) {
    const topStack = stack.addStack();
    topStack.centerAlignContent();
    if (image) {
    const JDLogo = topStack.addImage(await this.getImageByUrl(this.logo, 'logoImage.png'));
    JDLogo.imageSize = new Size(this.basicSetting.logo * this.basicSetting.scale, this.basicSetting.logo * this.basicSetting.scale);
    topStack.addSpacer(10 * this.basicSetting.scale);
    const JD = topStack.addImage(await this.getImageByUrl(image, 'jingdongImage.png'));
    JD.imageSize = new Size(194 * 0.2 * this.basicSetting.scale, 78 * 0.2 * this.basicSetting.scale);
    } else {
      const imgStack = topStack.addStack();
      if (this.isPlus) {
        imgStack.size = new Size(30 * this.basicSetting.scale, 30 * this.basicSetting.scale * 1.039);
        imgStack.backgroundImage = await this.getImageByUrl(this.plusBG, 'plusBGImage.png');
      }
      const subStack = imgStack.addStack();
      subStack.url = 'openapp.jdmobile://';
      subStack.size = new Size(30 * this.basicSetting.scale, 30 * this.basicSetting.scale);
      subStack.cornerRadius = 30 / 2 * this.basicSetting.scale;
      subStack.backgroundImage = await this.getImageByUrl(this.basicSetting.customizeAvatar || this.userImage, `userImage_${this.userName}.png`);
      if (this.isPlus) {
        const userImg = subStack.addImage(await this.getImageByUrl(this.plusFG, 'plusFGImage.png'));
      }
    }
    topStack.addSpacer();
    const jdBean = topStack.addText(this.beanCount.toString());
    jdBean.font = Font.mediumSystemFont(20 * this.basicSetting.scale);
    jdBean.textColor = new Color('fa2d19'); // 右上角京豆数颜色
    jdBean.url = 'openapp.jdmobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fbean.m.jd.com%2FbeanDetail%2Findex.action%3FresourceValue%3Dbean%22%7D';
    const desStack = topStack.addStack();
    desStack.layoutVertically();
    desStack.addSpacer(5.5 * this.basicSetting.scale);
    const desText = desStack.addText(' 京豆');
    desText.font = Font.mediumSystemFont(10 * this.basicSetting.scale);
    desText.textColor = new Color('fa2d19', 0.7);
  }

  // #####################京豆收支###################
  async setBeanShow(stack, textSize, imageSize) {
    const beanStack = stack.addStack();
    // 今日收支
    const yestodayStack = beanStack.addStack();
    yestodayStack.layoutVertically();
    try {
      this.bean.ydayIncome = this.rangeTimer[this.yestoday][0] - this.rangeTimer[this.yestoday][1];
      this.bean.ydayExpense = this.rangeTimer[this.yestoday][1];
      this.bean.todayIncome = this.rangeTimer[this.today][0] - this.rangeTimer[this.today][1];;
      this.bean.todayExpense = this.rangeTimer[this.today][1];
    } catch (e) {
      this.notify(this.name, '\u597d\u50cf\u4f60\u6628\u5929\u6ca1\u6709\u4f7f\u7528\u8be5\u5c0f\u7ec4\u4ef6\uff0c\u8bf7\u91cd\u7f6e\u4eac\u8c46\u6570\u636e');
    }
    this.rowBeanCell(
      yestodayStack,
      this.bean.ydayExpense.toString(),
      this.bean.ydayIncome.toString(),
      textSize,
      '昨日',
      );
    beanStack.addSpacer();
    // 京豆图片
    const ddStack = beanStack.addStack();
    ddStack.layoutVertically();
    const ddImg = ddStack.addImage(await this.getImageByUrl(this.beanImg, 'beanImage.png'));
    ddImg.imageSize = new Size(imageSize, imageSize);
    beanStack.addSpacer();
    // 昨日收支
    const todayStack = beanStack.addStack();
    todayStack.layoutVertically();
    this.rowBeanCell(
      todayStack,
      this.bean.todayExpense.toString(),
      this.bean.todayIncome.toString(),
      textSize,
      '今日',
      );
  }

  // #####################京豆图表###################
  async setChartShow(stack, type) {
    let labels = [], data = [];
    Object.keys(this.rangeTimer).forEach((day) => {
      const value = this.rangeTimer[day];
      const arrDay = day.split('-');
      labels.push(arrDay[2]);
      if (this.chartSetting.countBean === '收入-支出')
        data.push(value[0]);
      else data.push(value[0] - value[1]);
    });
    let cacheKey = `chart${type}Image${this.isSmall()}_${this.userName}.png`;
    let textSize = this.chartSetting.textSize;
    let linePadding = this.chartSetting.linePadding;
    let barPadding = this.chartSetting.barPadding;
    if (config.widgetFamily === 'small') {
      data.splice(0, 2);
      labels.splice(0, 2);
      textSize = this.chartSetting.textSize + 7;
      linePadding = this.chartSetting.linePadding + 10;
      barPadding = this.chartSetting.barPadding + 5;
    }
    let chartStr;
    switch (type) {
      case 2:
      chartStr = this.barChart(labels, data, textSize, barPadding, 'bar');
      break;
      case 3:
      chartStr = this.barChart(labels, data, textSize, barPadding, 'line');
      break;
      default:
      chartStr = this.lineChart(labels, data, textSize, linePadding);
    }
    const url = `https://quickchart.io/chart?w=${400}&h=${this.chartSetting.height}&f=png&c=${encodeURIComponent(chartStr)}`;
    const chart = await this.getImageByUrl(url, cacheKey, this.cacheChart);

    const chartStack = stack.addStack();
    const chartImage = chartStack.addImage(chart);
    const beanDateStack = stack.addStack();
    let showDays = data.length;
    for (let i = 0; i < showDays; i++) {
      beanDateStack.addSpacer();
      let subStack = beanDateStack.addStack();
      let beanDay = beanDateStack.addText(`${labels[i]}${this.chartSetting.dayText}`);
      beanDay.textColor = this.widgetColor;
      beanDay.font = new Font('ArialMT', this.chartSetting.daySize * this.basicSetting.scale);
      beanDay.textOpacity = 0.8;
      beanDateStack.addSpacer();
    }
  }

  // #####################物流信息###################
  setPackageShow(stack) {
    const packageStack = stack.addStack();
    const detailStack = packageStack.addStack();
    detailStack.layoutVertically();
    const titleStack = detailStack.addStack();
    titleStack.centerAlignContent();
    const title = titleStack.addText(this.package.title);
    title.lineLimit = 1;
    title.font = Font.mediumSystemFont(12 * this.basicSetting.scale);
    detailStack.addSpacer(2 * this.basicSetting.scale);
    const desc = detailStack.addText(this.package.desc);
    desc.lineLimit = 3;
    desc.font = Font.regularSystemFont(12 * this.basicSetting.scale);
    detailStack.addSpacer(2 * this.basicSetting.scale);
    const statusStack = detailStack.addStack();
    const time = statusStack.addText(this.package.time);
    statusStack.addSpacer();
    const status = statusStack.addText(this.package.status);
    ;[title, desc, time, status].map(t => t.textColor = this.widgetColor);
    ;[time, status].map(t => t.font = Font.regularSystemFont(9 * this.basicSetting.scale));
    ;[time, status].map(t => t.textOpacity = 0.7);
  }

  // #####################金贴&钢镚##################
  async setCoinShow(stack, vertical = false) {
    await this.getExtraData();
    const extraDataStack = stack.addStack();
    const jtImage = await this.getImageByUrl(this.jingtieImg, 'jtImage.png');
    const gbImage = await this.getImageByUrl(this.gangbengImg, 'gbImage.png');
    const dataStack = extraDataStack.addStack();
    if (vertical) dataStack.layoutVertically();
    this.rowCell(dataStack, jtImage, this.extra.jingtie.toString(), '金贴');
    if (vertical) extraDataStack.addSpacer(5 * this.basicSetting.scale);
    if (!vertical) dataStack.addSpacer(20 * this.basicSetting.scale);
    this.rowCell(dataStack, gbImage, this.extra.gangbeng.toString(), '钢镚');
  }

  // #####################京东红包##################
  async setRedPackageShow(stack, small = false) {
    await this.getRedPackageData();
    const walletImage = await this.getImageByUrl(this.walletImg, 'walletImage.png');
    small ? this.rowSmallWalletCell(stack, walletImage, this.redPackage) : this.rowWalletCell(stack, walletImage, this.redPackage);
  }

  // #####################京东白条##################
  async setBaitiaoShow(stack, small = false) {
    const baitiaoImage = await this.getImageByUrl(this.baitiaoImg, 'baitiaoImage.png');
    small ? this.rowSmallWalletCell(stack, baitiaoImage, this.baitiao) : this.rowWalletCell(stack, baitiaoImage, this.baitiao);
  }

  rowCell(stack, image, value, title) {
    const rowStack = stack.addStack();
    rowStack.centerAlignContent();
    const rowImage = rowStack.addImage(image);
    rowImage.imageSize = new Size(13 * this.basicSetting.scale, 13 * this.basicSetting.scale);
    rowStack.addSpacer();
    const rowValue = rowStack.addText(value);
    rowValue.font = Font.mediumSystemFont(15 * this.basicSetting.scale);
    rowStack.addSpacer();
    const rowTitle = rowStack.addText(title);
    rowTitle.font = Font.regularSystemFont(13 * this.basicSetting.scale);
    ;[rowValue, rowTitle].map(t => t.textColor = this.widgetColor);
  }

  rowBeanCell(stack, min, add, textSize, label) {
    const rowOne = stack.addStack();
    const labelText = rowOne.addText(label);
    labelText.font = Font.regularSystemFont(10 * this.basicSetting.scale);
    labelText.textOpacity = 0.7;
    const rowTwo = stack.addStack();
    const rowNumber = rowTwo.addText(add);
    rowNumber.font = Font.lightSystemFont(textSize);
    if (min < 0) {
      const rowThree = stack.addStack();
      const minText = rowThree.addText(min);
      minText.font = Font.mediumSystemFont(10 * this.basicSetting.scale);
      minText.textColor = new Color('fa2d19');  // 支出京豆颜色
    }
    ;[labelText, rowNumber].map(t => t.textColor = this.widgetColor);
  }

  rowWalletCell(stack, image, data) {
    const stackOne = stack.addStack();
    stackOne.centerAlignContent();
    const stackImage = stackOne.addImage(image);
    stackImage.imageSize = new Size(127 * 0.17 * this.basicSetting.scale, 75 * 0.17 * this.basicSetting.scale);
    stackOne.addSpacer(5 * this.basicSetting.scale);
    const title = stackOne.addText(data.title);
    title.font = Font.regularSystemFont(13 * this.basicSetting.scale);
    stackOne.addSpacer();
    const number = stackOne.addText(`${data.number}`);
    number.font = Font.mediumSystemFont(15 * this.basicSetting.scale);
    stackOne.addSpacer();
    const desc = stackOne.addText(data.desc);
    desc.font = Font.regularSystemFont(10 * this.basicSetting.scale);
    desc.textOpacity = 0.7;
    ;[title, number, desc].map(t => t.textColor = this.widgetColor);
  }

  rowSmallWalletCell(stack, image, data) {
    const stackOne = stack.addStack();
    stackOne.centerAlignContent();
    const stackImage = stackOne.addImage(image);
    stackImage.imageSize = new Size(127 * 0.17 * this.basicSetting.scale, 75 * 0.17 * this.basicSetting.scale);
    stackOne.addSpacer();
    const number = stackOne.addText(`${data.number}`);
    number.font = Font.mediumSystemFont(15 * this.basicSetting.scale);
    stack.addSpacer(5 * this.basicSetting.scale);
    const stackTwo = stack.addStack();
    stackTwo.centerAlignContent();
    const title = stackTwo.addText(data.title);
    title.font = Font.regularSystemFont(13 * this.basicSetting.scale);
    stackTwo.addSpacer();
    const desc = stackTwo.addText(data.desc);
    desc.font = Font.regularSystemFont(10 * this.basicSetting.scale);
    desc.textOpacity = 0.7;
    ;[number, title, desc].map(t => t.textColor = this.widgetColor);
  }

  init = async () => {
    try {
      let beanCacheKey = `beanData${this.isSmall()}_${this.userName}`;
      let beanCacheData = !this.loadStringCache(beanCacheKey) ? {} : JSON.parse(this.loadStringCache(beanCacheKey));
      let beanCache = beanCacheData.data ? beanCacheData.data.assetInfo.beanNum : 0;
      await this.TotalBean();
      await this.wxData();
      console.log(`京豆数据：${beanCache}`);
      console.log(`京豆数据：${this.beanCount}`);

      if (!this.cookie) return;
      if (Keychain.contains(this.CACHE_KEY)) {
        this.rangeTimer = JSON.parse(Keychain.get(this.CACHE_KEY));
        if (this.rangeTimer.hasOwnProperty(this.today) && beanCache !== 0 && beanCache == this.beanCount) {
          this.cacheChart = this.funcSetting.alwaysRefreshChart ==='打开' ? false : true;
          console.log('京豆数据：无变化，使用缓存数据');
          return;
        }

        this.rangeTimer[this.today] = [0, 0];
        const timerKeys = Object.keys(this.rangeTimer);
        if (timerKeys.length > this.maxDays) {
          for (let i = 0; i < timerKeys.length - this.maxDays; i++) {
            delete this.rangeTimer[timerKeys[i]];
          }
          Keychain.set(this.CACHE_KEY, JSON.stringify(this.rangeTimer));
        }

        this.timerKeys = [this.today];
      } else {
        this.rangeTimer = this.getDay(5);
        this.timerKeys = Object.keys(this.rangeTimer);
      }
      await this.getAmountData();
    } catch (e) {
      console.log(e);
    }
  };

  getAmountData = async () => {
    let i = 0,
    page = 1;
    do {
      const response = await this.getJingBeanBalanceDetail(page);
      const result = response.code === '0';
      console.log(`第${page}页：${result ? '请求成功' : '请求失败'}`);
      if (response.code === '3') {
        i = 1;
        this.notify(this.name, response.message)
        console.log(response);
      }
      if (response && result) {
        page++;
        let detailList = response.jingDetailList;
        if (detailList && detailList.length > 0) {
          for (let item of detailList) {
            const dates = item.date.split(' ');
            if (this.timerKeys.indexOf(dates[0]) > -1) {
              const amount = Number(item.amount);
              this.rangeTimer[dates[0]][0] += amount;
              if (amount < 0)
                this.rangeTimer[dates[0]][1] += amount;
            } else {
              i = 1;
              Keychain.set(this.CACHE_KEY, JSON.stringify(this.rangeTimer));
              break;
            }
          }
        }
      }
    } while (i === 0);
  }

  getDay(dayNumber) {
    let data = {};
    let i = dayNumber;
    do {
      const today = new Date();
      const year = today.getFullYear();
      const targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * i;
      today.setTime(targetday_milliseconds);
      let month = today.getMonth() + 1;
      month = month >= 10 ? month : `0${month}`;
      let day = today.getDate();
      day = day >= 10 ? day : `0${day}`;
      data[`${year}-${month}-${day}`] = [0, 0];
      i--;
    } while (i >= 0);
    return data;
  }

  TotalBean = async () => {
    const dataName = '京豆数据';
    let userCache = `beanData${this.isSmall()}`;
    const url = 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion';
    const options = {
      headers: {
        cookie: this.cookie,
      },
    };
    const response = await this.httpRequest(dataName, url, true, options, userCache);
    try {
      if (response.retcode === '0' && response['data']) {
        this.beanCount = response.data.assetInfo.beanNum;
        this.userImage = response.data.userInfo.baseInfo.headImageUrl.replace(/big/, 'mid') || 'https://img11.360buyimg.com/jdphoto/s120x120_jfs/t21160/90/706848746/2813/d1060df5/5b163ef9N4a3d7aa6.png';
        this.nickName = response.data.userInfo.baseInfo.nickname;
        this.isPlus = response.data.userInfo.isPlusVip === '1' ? true : false;
      } else {
        this.notify(this.name, response.msg);
        console.log('京豆数据：获取失败，' + response.msg)
      }
    } catch (e) {
      console.log(e);
      console.log('京豆数据：获取失败，')
    }
  }

  wxData = async () => {
    const dataName = '微信数据';
    let userCache = `wxData${this.isSmall()}`;
    const url = 'https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp';
    const options = {
      headers: {
        cookie: this.cookie,
      },
    };
    const response = await this.httpRequest(dataName, url, true, options, userCache);
    try {
      if (response['user']) {
        this.jValue = response.user.uclass.replace(/[^0-9]/ig, '');
      } else {
        this.notify(this.name, response.msg);
        console.log('微信数据：获取失败，' + response.msg)
      }
    } catch (e) {
      console.log(e);
    }
  }

  getJingBeanBalanceDetail = async (page) => {
    try {
      const options = {
        url: `https://bean.m.jd.com/beanDetail/detail.json`,
        body: `page=${page}`,
        headers: {
          'X-Requested-With': `XMLHttpRequest`,
          Connection: `keep-alive`,
          'Accept-Encoding': `gzip, deflate, br`,
          'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
          Origin: `https://bean.m.jd.com`,
          'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15`,
          Cookie: this.cookie,
          Host: `bean.m.jd.com`,
          Referer: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`,
          'Accept-Language': `zh-cn`,
          Accept: `application/json, text/javascript, */*; q=0.01`,
        },
      };
      let params = {...options, method: 'POST'};
      let request = new Request(params.url);
      Object.keys(params).forEach((key) => {
        request[key] = params[key];
      });
      return await request.loadJSON();
    } catch (e) {
      console.log(e);
    }
  }

  getExtraData = async () => {
    const JTDataName = '金贴数据';
    const JTUrl = 'https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance';
    const GBDataName = '钢镚数据';
    const GBUrl = 'https://coin.jd.com/m/gb/getBaseInfo.html';
    const options = {
      headers: {
        cookie: this.cookie,
        Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
      },
    };
    try {
      const JTData = await this.httpRequest(JTDataName, JTUrl, true, options, 'jintieData');
      const GBData = await this.httpRequest(GBDataName, GBUrl, true, options, 'gangbengData');
      if (JTData.resultCode === 0) {
        this.extra.jingtie = JTData.resultData.data['balance'];
      } else {
        this.notify(this.name, JTdata.resultMsg);
        console.log('金贴数据：获取失败，' + JTdata.resultMsg);
      };
      if (GBData.gbBalance) this.extra.gangbeng = GBData.gbBalance;
    } catch(e) {
      console.log(e);
    }
  }

  getPackageData = async () => {
    const dataName = '包裹数据';
    const url ='https://wq.jd.com/bases/wuliudetail/notify?sceneval=2&sceneval=2&g_login_type=1&callback';
    const options = {
      headers: {
        cookie: this.cookie,
        Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
      },
    };
    try {
      const data = await this.httpRequest(dataName, url, true, options, 'packageData');
      if (data.errCode == 0 && data['dealLogList']) {
        console.log('包裹数据：获取成功');
        console.log(`包裹数据：您有${data['dealLogList'].length}个包裹`);
        if (data['dealLogList'].length > 0) {
          let item = data.dealLogList[Math.floor(Math.random() * data['dealLogList'].length)]
          this.package.number = data.dealLogList.length;
          this.package.title = item['name'];
          this.package.desc = item['wlStateDesc'];
          this.package.time = item['createTime'];
          this.package.status = item['stateName'];
        }
      } else {
        console.log('包裹数据：获取失败');
      } 
    } catch (e) {
      console.log(e);
    }
  }

  getRedPackageData = async () => {
    const dataName = '红包数据';
    const url =
    'https://wq.jd.com/user/info/QueryUserRedEnvelopesV2?type=1&orgFlag=JD_PinGou_New&page=1&cashRedType=1&redBalanceFlag=1&channel=3&sceneval=2&g_login_type=1';
    const options = {
      headers: {
        cookie: this.cookie,
        Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
      },
    };
    try {
      const data = await this.httpRequest(dataName, url, true, options, 'redPackageData');
      if (data.errcode === 0) {
        this.redPackage.number = data.data.balance ? data.data.balance : 0;
        if (data.data.expiredBalance && data.data.expiredBalance !== '') this.redPackage.desc = `即将过期${data.data.expiredBalance}`;
      } else {
        this.notify(this.name, data.msg);
        console.log('红包数据：获取失败，' + data.msg);
      }
    } catch (e) {
      console.log(e);
    }
  }

  getJValue = async () => {
    const dataName = '京享数据';
    const url = 'https://vip.m.jd.com/scoreDetail/current';
    const options = {
      headers: {
        cookie: this.cookie,
      },
    };
    try {
      const data = await this.httpRequest(dataName, url, true, options, 'JValue');
      if (data.code === 0) {
        this.jValue = data.model.scoreDescription.userScore.score;
      } else {
        console.log('京享数据：获取失败');
      };
    } catch (e) {
      console.log(e);
    }
  }

  getBaitiaoData = async () => {
    const dataName = '白条数据';
    const url = 'https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew';
    const options = {
      body: 'reqData={"clientType":"ios","clientVersion":"13.2.3","deviceId":"","environment":"3"}',
      headers: {
        cookie: this.cookie,
      },
    };
    try {
      const data = await this.httpRequest(dataName, url, true, options, 'baitiaoData', 'POST', false);
      if (data.resultCode !== 0) {
        return this.notify(this.name, data['resultMsg']);
      }
      this.baitiao.title = data['resultData']['data']['bill']['title'];
      this.baitiao.number = data['resultData']['data']['bill']['amount'].replace(/,/g, '');
      this.baitiao.desc = data['resultData']['data']['bill']['buttonName'].replace(/最近还款日/, '');
    } catch (e) {
      console.log(e);
    }
  }

  getFruitData = async () => {
    const dataName = '东东农场';
    const url = 'https://api.m.jd.com/client.action?functionId=initForFarm';
    const options = {
      body: 'body=version:4&appid=wh5&clientVersion=9.1.0',
      headers: {
        'User-Agent': 'jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': this.cookie,
      },
    };
    try {
      const data = await this.httpRequest(dataName, url, true, options, 'FruitData', 'POST', false);
      if (data.msg && data.msg == 'not login') {
        this.fruitState = "X";
      }
      else if (data.farmUserPro.treeState == 2 || data.farmUserPro.treeState == 3) {
        this.fruitState = "100";
      }
      else if (data.farmUserPro.treeState == 0) {
        this.fruitState = "X";
      }
      else {
        this.fruitState = Math.floor((data.farmUserPro.treeEnergy / data.farmUserPro.treeTotalEnergy) * 100).toString();
      }
    } catch (e) {
      console.log(e);
    }
  }
  
  getImageByUrl = async(url, cacheKey, useCache = true, logable = true) => {
    if (this.CACHES.indexOf(cacheKey) < 0) {
      this.CACHES.push(cacheKey);
      this.settings.CACHES = this.CACHES;
      this.saveSettings(false);
    }
    if (useCache) {
      const cacheImg = this.loadImgCache(cacheKey);
      if (cacheImg != undefined && cacheImg != null) {
        if (logable) console.log(`使用缓存：${cacheKey}`);
        return this.loadImgCache(cacheKey);
      }
    }

    try {
      if (logable) console.log(`在线请求：${cacheKey}`);
      const req = new Request(url);
      const imgData = await req.load();
      const img = Image.fromData(imgData);
      this.saveImgCache(cacheKey, img);
      return img;
    } catch (e) {
      console.error(`图片加载失败：${e}`);
      let cacheImg = this.loadImgCache(cacheKey);
      if (cacheImg != undefined) {
        console.log(`使用缓存图片：${cacheKey}`);
        return cacheImg;
      }
      console.log(`使用预设图片`);
      let ctx = new DrawContext();
      ctx.size = new Size(80, 80);
      ctx.setFillColor(Color.darkGray());
      ctx.fillRect(new Rect(0, 0, 80, 80));
      return await ctx.getImage();
    }
  }

  saveImgCache(cacheKey, img) {
    if (!this.fm.fileExists(this.cachePath)) {
      this.fm.createDirectory(this.cachePath, true);
    };
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    this.fm.writeImage(cacheFile, img);
  }

  loadImgCache(cacheKey) {
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    const fileExists = this.fm.fileExists(cacheFile);
    let img = undefined;
    if (fileExists) {
      img = Image.fromFile(cacheFile);
    }
    return img;
  }

  httpRequest = async(dataName, url, json = true, options, key, method = 'GET', logable = this.funcSetting.logable === '打开') => {
    let cacheKey = `${key}_${this.userName}`;
    if (this.CACHES.indexOf(cacheKey) < 0) {
      this.CACHES.push(cacheKey);
      this.settings.CACHES = this.CACHES;
      this.saveSettings(false);
    }
    const localCache = this.loadStringCache(cacheKey);
    const lastCacheTime = this.getCacheModificationDate(cacheKey);
    const timeInterval = Math.floor((this.getCurrentTimeStamp() - lastCacheTime) / 60);
    console.log(
      `${dataName}：缓存${timeInterval}分钟前，有效期${this.basicSetting.interval}分钟，${localCache.length}`);
    if (timeInterval < this.basicSetting.interval && localCache != null && localCache.length > 0) {
      console.log(`${dataName}：读取缓存`);
      return json ? JSON.parse(localCache) : localCache;
    }
    let data = null;
    try {
      console.log(`${dataName}：在线请求`);
      let req = new Request(url);
      req.method = method;
      Object.keys(options).forEach((key) => {
        req[key] = options[key];
      });
      data = await (json ? req.loadJSON() : req.loadString());
    } catch (e) {
      console.error(`${dataName}：请求失败：${e}`);
    }
    if (!data && localCache != null && localCache.length > 0) {
      console.log(`${dataName}：获取失败，读取缓存`);
      return json ? JSON.parse(localCache) : localCache;
    }
    this.saveStringCache(cacheKey, json ? JSON.stringify(data) : data);
    if (logable) {
      console.log(`${dataName}：在线请求响应数据：${JSON.stringify(data)}`);
    }
    return data;
  }

  loadStringCache(cacheKey) {
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    const fileExists = this.fm.fileExists(cacheFile);
    let cacheString = '';
    if (fileExists) {
      cacheString = this.fm.readString(cacheFile);
    }
    return cacheString;
  }

  saveStringCache(cacheKey, content) {
    if (!this.fm.fileExists(this.cachePath)) {
      this.fm.createDirectory(this.cachePath, true);
    };
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    this.fm.writeString(cacheFile, content);
  }

  getCacheModificationDate(cacheKey) {
    const cacheFile = this.fm.joinPath(this.cachePath, cacheKey);
    const fileExists = this.fm.fileExists(cacheFile);
    if (fileExists) {
      return this.fm.modificationDate(cacheFile).getTime() / 1000;
    } else {
      return 0;
    }
  }

  getCurrentTimeStamp() {
    return new Date().getTime() / 1000;
  }

  timeFormat(time) {
    let date;
    if (time) {
      date = new Date(time);
    } else {
      date = new Date();
    }
    return ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '月' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate()) + '日';
  }

  async updateCheck(version){
    let data;
    try {
      let updateCheck = new Request('https://raw.githubusercontent.com/anker1209/Scriptable/main/upcoming.json');
      data = await updateCheck.loadJSON();
      if (data.version != version) {
        let updata = new Alert();
        updata.title = `有新版 ${data.version} 可用`;
        updata.addAction('去Github更新');
        updata.addAction('网页版商店更新');
        updata.addCancelAction('稍后');
        updata.message = '\n更新说明:\n' + data.notes + '\n\n点击相应按钮更新脚本';
        let id = await updata.present();
        if (id == 0) {
          Safari.openInApp('https://raw.githubusercontent.com/anker1209/Scriptable/main/scripts/JD-in-one-v2.js');
        } else if (id == 1) {
          Safari.openInApp('http://scriptablejs.gitee.io/store/#/menu/myInfo');
        } else {
          return;
        }
      } else {
        let updata = new Alert();
        updata.title = '暂无更新';
        updata.addCancelAction('好的');
        updata.message = `\n当前版本 ${version} 为最新版本`;
        await updata.present();
      }
    } catch(e) {
      console.log(e);
    }
  }

  async faqTable() {
    const table = new UITable();
    table.showSeparators = false;
    let data;
    try {
      let faq = new Request('https://raw.githubusercontent.com/anker1209/Scriptable/main/faq.json');
      data = await faq.loadJSON();
      let info = new UITableRow();
      info.height = parseFloat(data.height);
      let desc = info.addText(data.update, data.desc);
      desc.subtitleColor = Color.blue();
      desc.titleFont = Font.mediumSystemFont(14);
      desc.subtitleFont = Font.systemFont(14);
      table.addRow(info);
      for (let i = 0; i < data.data.length; i++) {
        let header = new UITableRow();
        header.backgroundColor = Color.dynamic(new Color('F5F5F5'), new Color('000000'));;
        let heading = header.addText(data.data[i].name)
        heading.titleFont = Font.mediumSystemFont(17);
        heading.centerAligned();
        table.addRow(header);
        data.data[i].item.forEach((faq) => {
            let row = new UITableRow();
            row.height = parseFloat(faq['height']);
            let rowtext = row.addText(faq['question'], faq['answer']);
            rowtext.titleFont = Font.mediumSystemFont(16);
            rowtext.titleColor = Color.blue();
            rowtext.subtitleFont = Font.systemFont(14);
            rowtext.subtitleColor = Color.dynamic(new Color('000000', 0.7), new Color('ffffff', 0.7));
            table.addRow(row);
        });
      }
    } catch (e) {
      console.log(e);
    }
    await table.present();
  }

  async settingCategory(table, item, outfit, category) {
    let header = new UITableRow();
    let heading = header.addText(outfit)
    heading.titleFont = Font.mediumSystemFont(17);
    heading.centerAligned();
    table.addRow(header);
    item.forEach((data) => {
      Object.keys(data.option).forEach((key) => {
        let row = new UITableRow();
        let rowIcon = row.addImageAtURL(data['icon']);
        rowIcon.widthWeight = 100;
        let rowtext = row.addText(data['title']);
        rowtext.widthWeight = 400;
        let rowNumber = row.addText(`${this.settings[category][key]}  >`);
        rowNumber.widthWeight = 500;
        rowNumber.rightAligned();
        rowNumber.titleColor = Color.gray();
        rowNumber.titleFont = Font.systemFont(16);
        rowtext.titleFont = Font.systemFont(16);
        row.dismissOnSelect = false;
        row.onSelect = async () => {
          if (data.type == 'text') {
            await this.alertInput(data['title'], data['desc'], category, data['option']);
          } else if (data.type == 'menu') {
            await this.showAlert(data['title'], data['desc'], data['menu'], category, key,);
          }
          await this.tableContent(table);
        }
        table.addRow(row);
      });
    });
    table.reload();
  }

  async tableContent(table) {
    const basic = [
      {type: 'text', title: '全局缩放比例', desc: '排版溢出、显示不全的请优先调低此数，建议递减0.05调整，如0.95、0.90……\n\n缺省值：1.00', option: {scale: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/scale.png'},
      {type: 'text', title: '京东标志大小', desc: '京东logo（形象狗）大小\n\n缺省值：30', option: {logo: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/logo.png'},
      {type: 'text', title: '用户头像大小', desc: '⚠️注意：若要修改头像，请在京东app上传后将缓存清除再运行脚本。\n\n缺省值：69', option: {userImage: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/userImage.png'},
      {type: 'text', title: '左侧栏宽度', desc: '左侧用户信息栏整体宽度\n\n缺省值：103', option: {userStack: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/userStack.png'},
      {type: 'text', title: '左右栏间距', desc: '左侧用户信息栏与右侧京豆数据间距\n\n缺省值：25', option: {division: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/division.png'},
      {type: 'text', title: '缓存时间', desc: '数据请求间隔时间\n请设置合适时间，避免频繁访问接口数据以及加载缓慢。单位：分钟\n\n缺省值：10', option: {interval: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/interval.png'},
      {type: 'menu', title: '缓存位置', desc: '将缓存保存在Local或者iCloud。\n\n缺省值：Local', option: {directory: ''}, menu: ['Local', 'iCloud'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/directory.png'},
      {type: 'text', title: '自定义昵称', desc: '自定义用户信息栏的昵称名称，\n留空将显示京东账号昵称。\n\n注意：单脚本多账户若使用自定义昵称，所有账户将同时显示此昵称，如需单独自定义昵称，请复制脚本单独设置。', option: {customizeName: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/customizeName.png'},
      {type: 'text', title: '自定义头像', desc: '自定义用户信息栏的头像，\n留空将显示京东APP头像。\n\n注意：单脚本多账户若使用自定义头像，所有账户将同时显示此头像，如需单独自定义头像，请复制脚本单独设置。', option: {customizeAvatar: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/customizeAvatar.png'},
      {type: 'menu', title: '小组件显示内容', desc: '\n缺省值：京豆、钱包数据', option: {smallShowType: ''}, menu: ['京豆、钱包数据', '个人信息'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/smallShowType.png'},
      {type: 'menu', title: '钱包显示类型', desc: '若要显示钱包内容，白条需关闭或者白条打开的情况下无待还白条。\n\n缺省值：红包', option: {walletShowType: ''}, menu: ['红包', '钢镚和金贴'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/walletShowType.png'},
    ];
    const chart = [
      {type: 'text', title: '图表高度', desc: '京豆数据未与日期对齐的，\n请调低此数值\n\n⚠️如需即时查看调整效果，\n[功能设置]-->刷新图表 需打开。\n\n缺省值：130', option: {height: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/height.png'},
      {type: 'text', title: '日期文字大小', desc: '京豆图表底部日期文字大小\n\n缺省值：9', option: {daySize: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/daySize.png'},
      {type: 'text', title: '日期文字后缀', desc: '京豆图表底部日期文字后缀', option: {dayText: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/dayText.png'},
      {type: 'text', title: '京豆数文字大小', desc: '京豆图表数据文字大小\n\n⚠️如需即时查看调整效果，\n[功能设置]-->刷新图表 需打开。\n\n缺省值：18', option: {textSize: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/textSize.png'},
      {type: 'text', title: '京豆数白天颜色', desc: '⚠️如需即时查看调整效果，\n[功能设置]-->刷新图表 需打开。\n\n缺省值：999999', option: {textDayColor: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/textDayColor.png'},
      {type: 'text', title: '京豆数晚上颜色', desc: '⚠️如需即时查看调整效果，\n[功能设置]-->刷新图表 需打开。\n\n缺省值：999999', option: {textNightColor: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/textNightColor.png'},
      {type: 'text', title: '折线图线条颜色', desc: '支持渐变色，每个颜色之间以英文逗号分隔，颜色值必须带“#”。\n\n缺省值：#FA6859', option: {lineColor: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/lineColor.png'},
      {type: 'text', title: '折线图表顶边距', desc: '京豆折线图顶边距\n京豆数据在顶部被剪切显示不全的，\n请调高此数值。\n\n⚠️如需即时查看调整效果，\n[功能设置]-->刷新图表 需打开。\n\n缺省值：15', option: {linePadding: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/linePadding.png'},
      {type: 'text', title: '柱状图表顶边距', desc: '京豆柱状图和曲线面积图顶边距\n京豆数据在顶部被剪切显示不全的,\n请调高此数值。\n\n⚠️如需即时查看调整效果，\n[功能设置]-->刷新图表 需打开。\n\n缺省值：5', option: {barPadding: ''}, icon: 'https://gitee.com/anker1209/image/raw/master/jd/barPadding.png'},
      {type: 'menu', title: '小组件图表类型', desc: '\n缺省值：双日视图', option: {smallShowType: ''}, menu: ['双日视图', '折线图表', '柱状图表', '曲线面积图'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/smallShowType2.png'},
      {type: 'menu', title: '中组件图表类型', desc: '\n缺省值：双日视图', option: {showType: ''}, menu: ['双日视图', '折线图表', '柱状图表', '曲线面积图'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/showType.png'},
      {type: 'menu', title: '每日京豆数计算', desc: '\n缺省值：收入-支出', option: {countBean: ''}, menu: ['收入-支出', '收入'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/countBean.png'},
      {type: 'menu', title: '多彩柱状图', desc: '设置为打开时仅对柱状图表生效\n\n缺省值：关闭', option: {colorful: ''}, menu: ['打开', '关闭'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/colorful.png'},
    ];
    const func = [
      {type: 'menu', title: '白条信息', desc: '关闭或者打开后无待还白条的情况下，\n会显示基础设置里选择的钱包内容。\n\n缺省值：打开', option: {showBaitiao: ''}, menu: ['打开', '关闭'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/showBaitiao.png'},
      {type: 'menu', title: '包裹信息', desc: '只有中组件显示一条物流信息，\n若无物流信息会显示图表设置里选择的图表类型。\n\n缺省值：关闭', option: {showPackage: ''}, menu: ['打开', '关闭'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/showPackage.png'},
      {type: 'menu', title: '农场进度', desc: '显示东东农场种植进度。\n\n缺省值：打开', option: {showFruit: ''}, menu: ['打开', '关闭'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/showFruit.png'},
      {type: 'menu', title: '运行日志', desc: '出现数据异常请将此值设为true，\n查看运行日志。\n\n⚠️注意：\n查看运行日志需将缓存时间更改为0。\n\n缺省值：关闭', option: {logable: ''}, menu: ['打开', '关闭'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/logable.png'},
      {type: 'menu', title: '刷新图表', desc: '打开，每次刷新组件会随机刷新图表颜色（仅柱状图表和曲线面积图）；关闭，则只有在京豆数据有变化的情况下刷新图表颜色及数据。建议在排版调整没有问题后，设置为关闭。设置为打开会加长数据载入时间。\n\n⚠️注意：图表设置选项里修改图表高度、颜色、文字大小、顶边距需打开此选项以查看即时反馈。\n\n缺省值：打开', option: {alwaysRefreshChart: ''}, menu: ['打开', '关闭'], icon: 'https://gitee.com/anker1209/image/raw/master/jd/alwaysRefreshChart.png'},
    ];
    table.removeAllRows();
    let topRow = new UITableRow();
    let leftText = topRow.addButton('教程');
    leftText.widthWeight = 0.25;
    leftText.onTap = async () => {
      await Safari.open('https://github.com/anker1209/Scriptable#jd_in_one');
    }
    let faqText = topRow.addButton('常见问题');
    faqText.widthWeight = 0.25;
    faqText.leftAligned();
    faqText.onTap = async () => {
      await this.faqTable();
    }
    let versionText = topRow.addButton('版本检测');
    versionText.widthWeight = 0.25;
    versionText.rightAligned();
    versionText.onTap = async () => {
      await this.updateCheck(this.version);
    }
    let rightText = topRow.addButton('电报群');
    rightText.widthWeight = 0.25;
    rightText.rightAligned();
    rightText.onTap = async () => {
      await Safari.open('https://t.me/Scriptable_JS');
    }
    table.addRow(topRow);

    let header = new UITableRow();
    let heading = header.addText('重置设置')
    heading.titleFont = Font.mediumSystemFont(17);
    heading.centerAligned();
    table.addRow(header);
    let row1 = new UITableRow();
    let rowtext1 = row1.addText('重置缓存','若需要修改头像或数据显示错误，尝试此操作');
    rowtext1.titleFont = Font.systemFont(16);
    rowtext1.subtitleFont = Font.systemFont(12);
    rowtext1.subtitleColor = new Color('999999');
    row1.dismissOnSelect = false;
    row1.onSelect = async () => {
      const options = ['取消', '重置'];
      const message = '所有在线请求的数据缓存将会被清空';
      const index = await this.generateAlert(message, options);
      if (index === 0) return;
      this.fm.remove(this.cachePath);
      delete this.settings['CACHES'];
      this.saveSettings();
    }
    table.addRow(row1);
    let row2 = new UITableRow();
    let rowtext2 = row2.addText('重置京豆数据','若京豆数据缺失或显示有误，尝试此操作');
    rowtext2.titleFont = Font.systemFont(16);
    rowtext2.subtitleFont = Font.systemFont(12);
    rowtext2.subtitleColor = new Color('999999');
    row2.dismissOnSelect = false;
    row2.onSelect = async () => {
      const options = ['取消', '重置'];
      const message = '若缺少京豆数据或显示为0（双日视图或图表的京豆数）采用此操作。京豆数据重置后，将会重新抓取近6天的京豆明细。请勿频繁使用，会产生大量数据';
      const index = await this.generateAlert(message, options);
      if (index === 0) return;
      Keychain.remove(this.settings.CACHE_KEY);
      delete this.settings.CACHE_KEY;
      this.saveSettings();
    }
    table.addRow(row2);
    let row3 = new UITableRow();
    let rowtext3 = row3.addText('重置设置参数','设置参数绑定脚本文件名，请勿随意更改脚本文件名');
    rowtext3.titleFont = Font.systemFont(16);
    rowtext3.subtitleFont = Font.systemFont(12);
    rowtext3.subtitleColor = new Color('999999');
    row3.dismissOnSelect = false;
    row3.onSelect = async () => {
      const options = ['取消', '重置'];
      const message = '本菜单里的所有设置参数将会重置为默认值，重置后请重新打开设置菜单';
      const index = await this.generateAlert(message, options);
      if (index === 0) return;
      delete this.settings['basicSetting'];
      delete this.settings['chartSetting'];
      delete this.settings['funcSetting'];
      this.saveSettings();
    }
    table.addRow(row3);
    await this.settingCategory(table, basic, '基础设置', 'basicSetting');
    await this.settingCategory(table, chart, '图表设置', 'chartSetting');
    await this.settingCategory(table, func, '功能设置', 'funcSetting');
  }

  async editSettings() {
    const table = new UITable();
    table.showSeparators = true;
    await this.tableContent(table);
    await table.present(true);
  }

  alertInput = async (title, desc, category, opt = {}) => {
    const a = new Alert();
    a.title = title;
    a.message = !desc ? '' : desc;
    let key = Object.keys(opt)[0];
    a.addTextField(key, `${this.settings[category][key]}`);
    a.addAction('确定');
    a.addCancelAction('取消');
    const id = await a.presentAlert();
    if (id === -1) return;
    this.settings[category][key] = a.textFieldValue(0);
    this.saveSettings();
  };

  async showAlert(title, message, options, category, key) {
    let alert = new Alert();
    alert.title = title;
    alert.message = message;
    alert.addCancelAction('取消')
    for (const option of options) {
      alert.addAction(option);
    };
    let id = await alert.presentAlert();
    if (id === -1) return;
    this.settings[category][key] = options[id];
    this.saveSettings();
  }

  run = (filename, args) => {
    if(!this.settings.basicSetting) this.settings.basicSetting = this.basicSetting;
    Object.keys(this.basicSetting).forEach((key) => {
      if(!this.settings.basicSetting.hasOwnProperty(key))
        this.settings['basicSetting'][key] = this.basicSetting[key];
    });
    if(!this.settings.chartSetting) this.settings.chartSetting = this.chartSetting;
    Object.keys(this.chartSetting).forEach((key) => {
      if(!this.settings.chartSetting.hasOwnProperty(key))
        this.settings['chartSetting'][key] = this.chartSetting[key];
    });
    if(!this.settings.funcSetting) this.settings.funcSetting = this.funcSetting;
    Object.keys(this.funcSetting).forEach((key) => {
      if(!this.settings.funcSetting.hasOwnProperty(key))
        this.settings['funcSetting'][key] = this.funcSetting[key];
    });
    if(!this.settings.CACHES) this.settings.CACHES = [];
    this.CACHES = this.settings.CACHES;
    if (this.settings['basicSetting']['directory'] === 'iCloud') this.fm = FileManager.iCloud();
    this.cachePath = this.fm.joinPath(this.fm.documentsDirectory(), this.CACHE_FOLDER);

    if (config.runsInApp) {
      this.registerAction('参数配置', this.editSettings, 'https://gitee.com/anker1209/image/raw/master/jd/setting.png');
      this.registerAction('账号设置', async () => {
        const index = await this.generateAlert('设置账号信息', [
          '网站登录',
          '手动输入',
        ]);
        if (index === 0) {
          await this.jdWebView();
        } else {
          await this.setAlertInput('账号设置', '京东账号cookie\n\n⚠️\n用户名和cookie必须输入！\n多账号注意用户名不要重复！', {
            username: '用户名，必须输入！多账号勿重复！',
            cookie: 'Cookie',
          });
        }
      }, 'https://gitee.com/anker1209/image/raw/master/jd/account.png');
      this.registerAction('代理缓存', this.actionSettings, 'https://gitee.com/anker1209/image/raw/master/jd/boxjs.png');
      this.registerAction('基础设置', this.setWidgetConfig, 'https://gitee.com/anker1209/image/raw/master/jd/preferences.png');
    }
    Object.keys(this.settings['basicSetting']).forEach((key) => {
      if (key == 'customizeName' || key == 'customizeAvatar' || key == 'smallShowType' || key == 'walletShowType' || key == 'directory') {
        this.basicSetting[key] = this.settings['basicSetting'][key];
      } else if (!isNaN(this.settings['basicSetting'][key])) {
        this.basicSetting[key] = parseFloat(this.settings['basicSetting'][key]);
      }
    });
    Object.keys(this.settings['chartSetting']).forEach((key) => {
      if (key == 'textDayColor' || key == 'textNightColor' || key =='showType' || key == 'smallShowType' || key == 'countBean' || key == 'colorful' || key == 'lineColor' || key == 'dayText') {
        this.chartSetting[key] = this.settings['chartSetting'][key];
      } else if (!isNaN(this.settings['chartSetting'][key])) {
        this.chartSetting[key] = parseFloat(this.settings['chartSetting'][key]);
      }
    });
    Object.keys(this.settings['funcSetting']).forEach((key) => {
      this.funcSetting[key] = this.settings['funcSetting'][key];
    });

   
  };

  jdWebView = async () => {
    const webView = new WebView();
    const url =
      'https://mcr.jd.com/credit_home/pages/index.html?btPageType=BT&channelName=024';
    await webView.loadURL(url);
    await webView.present(true);
    const req = new Request(
      'https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew',
    );
    req.method = 'POST';
    req.body =
      'reqData={"clientType":"ios","clientVersion":"13.2.3","deviceId":"","environment":"3"}';
    await req.loadJSON();
    const cookies = req.response.cookies;
    const account = {username: '', cookie: ''};
    const cookie = [];
    cookies.forEach((item) => {
      const value = `${item.name}=${item.value}`;
      if (item.name === 'pt_key') cookie.push(value);
      if (item.name === 'pt_pin') {
        account.username = item.value;
        cookie.push(value);
      }
    });
    account.cookie = cookie.join('; ');
    console.log(account);

    if (account.cookie) {
      this.settings = {...this.settings, ...account};
      this.saveSettings(false);
      console.log(`${this.name}: cookie获取成功，请关闭窗口！`);
      this.notify(this.name, 'cookie获取成功，请关闭窗口！');
    }
  };

  _loadJDCk = async () => {
    try {
      const CookiesData = await this.getCache('CookiesJD');
      if (CookiesData) {
        this.CookiesData = this.transforJSON(CookiesData);
      }
      const CookieJD = await this.getCache('CookieJD');
      if (CookieJD) {
        const userName = CookieJD.match(/pt_pin=(.+?);/)[1];
        const ck1 = {
          cookie: CookieJD,
          userName,
        };
        this.CookiesData.push(ck1);
      }
      const Cookie2JD = await this.getCache('CookieJD2');
      if (Cookie2JD) {
        const userName = Cookie2JD.match(/pt_pin=(.+?);/)[1];
        const ck2 = {
          cookie: Cookie2JD,
          userName,
        };
        this.CookiesData.push(ck2);
      }
      return true;
    } catch (e) {
      console.log(e);
      this.CookiesData = [];
      return false;
    }
  };

  async actionSettings() {
    try {
      const table = new UITable();
      if (!(await this._loadJDCk())) throw 'BoxJS 数据读取失败';
      // 如果是节点，则先远程获取
      this.settings.cookieData = this.CookiesData;
      this.saveSettings(false);
      this.CookiesData.map((t, index) => {
        const r = new UITableRow();
        r.addText(`parameter：${index}    ${t.userName}`);
        r.onSelect = (n) => {
          this.settings.username = t.userName;
          this.settings.cookie = t.cookie;
          this.saveSettings();
        };
        table.addRow(r);
      });
      let body = '京东 Ck 缓存成功，根据下标选择相应的 Ck';
      if (this.settings.cookie) {
        body += '，或者使用当前选中Ck：' + this.settings.username;
      }
      this.notify(this.name, body);
      table.present(false);
    } catch (e) {
      this.notify(
        this.name,
        '',
        'BoxJS 数据读取失败，请点击通知查看教程',
        'https://chavyleung.gitbook.io/boxjs/awesome/videos',
      );
    }
  }


  async getCookie() {
    this.JDindex =
      typeof args.widgetParameter === 'string'
        ? parseInt(args.widgetParameter)
        : false;
   let _md5 = this.md5(module.filename + this.en);
    if (this.funcSetting.logable === '打开') console.log('当前配置内容：' + JSON.stringify(this.settings));
    await this._loadJDCk();
    this.JDindex =
      typeof args.widgetParameter === "string"
        ? parseInt(args.widgetParameter)
        : false;
    try {
      if (this.JDindex !== false && this.JDindex + 1 > 0) {
        this.cookie = this.CookiesData[this.JDindex]['cookie'];
        this.userName =this.CookiesData[this.JDindex]["userName"];
      } else {
        const cacheCookie = this.CookiesData.find(item=>item.userName === this.settings.username) || {};
        this.userName = cacheCookie.userName;
        this.cookie = cacheCookie.cookie;
      }
      if (!this.cookie) throw "京东 CK 获取失败";
      this.userName = decodeURI(this.userName);
      this.CACHE_KEY = `cache_${_md5}_` + this.userName;
      this.settings.CACHE_KEY = this.CACHE_KEY;
      this.saveSettings(false);
      return true;
    } catch (e) {
      this.notify("错误提示", e);
      return false;
    }
  }

  async render() {
    await this.getCookie();
    if (!this.cookie || !this.userName) {
      this.notify(this.name, 'cookie或用户名未设置');
      return;
    };
    await this.init();
    await this.getPackageData();
    if (this.funcSetting.showBaitiao === '打开') await this.getBaitiaoData();
    if (this.funcSetting.showFruit === '打开') await this.getFruitData();
    if (this.funcSetting.logable === '打开') console.log(this.rangeTimer);
    const widget = new ListWidget();
    const padding = 14 * this.basicSetting.scale;
    widget.setPadding(padding, padding, padding, padding);
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

await Runing(Widget, '', false);