// Author: 脑瓜
// 电报群： https://t.me/Scriptable_JS @anker1209
// 京豆收支采用2Ya美女的脚本 https://github.com/dompling/Scriptable/tree/master/Scripts
let widgetParam = args.widgetParameter;
const files = FileManager.local();
// ######################设置####################
let cookie = ''; // 两个引号之间输入京东cookie，只需填入pt_key和pt_pin字段即可
let userID = decodeURIComponent(
  cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1],
);
const size = {
  logo: 30, // Logo大小
  userImage: 70, // 用户头像大小
  userStack: 103, // 左侧用户信息栏整体宽度
  division: 25, // 左侧与右侧间距
  chartHeight: 120, //京豆K线图高度
};
const showBaitiao = false; // 是否显示白条还款信息
const showPackage = false; // 是否显示包裹信息

// ##############################################
const w = new ListWidget();
w.setPadding(14, 14, 14, 14);

let isSign;
let CACHE_KEY = 'cache_jd_' + userID;
let packageData;
let packageNum;
let mainData;

const logo =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/e1902ff8-02e9-4dbf-99c7-cfc85ef3f1b7.png';
const JDImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/43300bf7-61a2-4bd1-94a1-bf2faa2ed9e8.png';
const jtImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/dacbd8f6-8115-4fd6-aedc-95cce83788a9.png';
const gbImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/3947a83b-7aa6-4a53-be34-8fed610ddb77.png';
const jdImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-imgbed/7ea91cf8-6dea-477c-ae72-cb4d3f646c34.png';
const plusImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/11fbba4a-4f92-4f7c-8fb3-dcff653fe20c.png';
const baitiaoImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/30c40f5b-7428-46c3-a2c0-d81b2b95ec41.png';
const carImg =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/3b30040f-e378-4502-bec6-ceddb0841b50.png';
const plusCircle =
  'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-b1ebbd3c-ca49-405b-957b-effe60782276/06f78540-a5a4-462e-b8c5-98cb8059efc1.png';

let beanCount = 0;
let incomeBean = 0;
let expenseBean = 0;
let todayIncomeBean = 0;
let todayExpenseBean = 0;
let maxDays = 6;
let rangeTimer = {};
let timerKeys = [];
let latelyDays = [];
// Keychain.remove(CACHE_KEY)
const chartTextColor = Color.dynamic(
  new Color('000000', 1),
  new Color('ffffff', 1),
);

let baitiaoData = {};
let baitiaoTitle;
let baitiaoAmount;
let baitiaoDesc;

// #####################小组件###################
async function renderSmallWidget() {
  const bodyStack = w.addStack();
  bodyStack.layoutVertically();
  if (widgetParam == 2) {
    await setUserShow(bodyStack);
  } else {
    await setHeaderShow(bodyStack);
    bodyStack.addSpacer();
    if (widgetParam == 1) {
      await setChartShow(bodyStack);
    } else {
      await setBeanShow(bodyStack, 22, 40);
    }
    bodyStack.addSpacer();
    if (showBaitiao && baitiaoAmount > 0) {
      await setSmallBaitiaoShow(bodyStack);
    } else {
      await rowCell(bodyStack, jtImg, 16, mainData.jintie, 16, '金贴', 10);
      await rowCell(
        bodyStack,
        gbImg,
        18,
        mainData['gangbeng'].toString(),
        16,
        '钢镚',
        10,
      );
    }
  }
  return w;
}
// #####################中组件###################
async function renderMediumWidget() {
  const bodyStack = w.addStack();
  await setUserShow(bodyStack);
  bodyStack.addSpacer(size.division);
  const mainStack = bodyStack.addStack();
  mainStack.layoutVertically();
  await setHeaderShow(mainStack, JDImg);
  mainStack.addSpacer();
  if (showPackage && packageNum > 0) {
    await setPackageShow(mainStack);
    mainStack.addSpacer();
    if (showBaitiao && baitiaoAmount > 0) {
      await setBaitiaoShow(mainStack);
    } else {
      await setCoinShow(mainStack);
    }
  } else {
    if (widgetParam == 1) {
      await setChartShow(mainStack); // 显示京豆收支图表
    } else {
      await setBeanShow(mainStack, 30, 50); // 显示昨天和今天京豆收支
    }
    mainStack.addSpacer();
    if (showBaitiao && baitiaoAmount > 0) {
      await setBaitiaoShow(mainStack);
    } else {
      await setCoinShow(mainStack);
    }
  }
  return w;
}
// #####################大组件###################
async function renderLargeWidget() {
  const bodyStack = w.addStack();
  bodyStack.size = new Size(0, 150);
  bodyStack.addSpacer();
  await setUserShow(bodyStack);
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
async function setUserShow(widget) {
  const userStack = widget.addStack();
  userStack.size = new Size(size.userStack, 0);
  userStack.layoutVertically();
  // 头像
  const userImgStack = userStack.addStack();
  userImgStack.addSpacer();
  const imgStack = userImgStack.addStack();
  imgStack.size = new Size(size.userImage, size.userImage);
  imgStack.cornerRadius = size.userImage / 2;
  imgStack.backgroundImage = await getImage(userImage);
  if (plus) {
    const userImg = imgStack.addImage(await getImage(plusImg));
  }
  userImgStack.addSpacer();
  userStack.addSpacer();
  // 签到和物流提示
  const tipStack = userStack.addStack();
  tipStack.addSpacer();
  let signIcon;
  if (isSign == 0) {
    signIcon = SFSymbol.named('checkmark.circle.fill');
  } else {
    signIcon = SFSymbol.named('xmark.circle.fill');
  }
  const signItem = tipStack.addImage(signIcon.image);
  signItem.imageSize = new Size(14, 14);
  if (packageNum > 0) {
    tipStack.addSpacer(3);
    const packageIcon = SFSymbol.named(packageNum + '.circle.fill');
    const packageItem = tipStack.addImage(packageIcon.image);
    packageItem.imageSize = new Size(14, 14);
    packageItem.tintColor = new Color('FC8600');
  }
  // ;[signItem, packageIcon].map(t => t.imageSize = new Size(14,14))
  tipStack.addSpacer();
  userStack.addSpacer();
  // 用户名
  const nameStack = userStack.addStack();
  nameStack.centerAlignContent();
  if (plus) {
    const nameImg = nameStack.addImage(await getImage(plusCircle));
    nameImg.imageSize = new Size(16, 16);
  } else {
    const person = SFSymbol.named('person.circle.fill');
    const nameIcon = nameStack.addImage(person.image);
    nameIcon.imageSize = new Size(16, 16);
    nameIcon.tintColor = new Color('007aff');
  }
  nameStack.addSpacer(5);
  const name = nameStack.addText(userName);
  name.font = Font.regularSystemFont(14);
  userStack.addSpacer(5);
  // 京享值
  const valueStack = userStack.addStack();
  valueStack.centerAlignContent();
  const tagIcon = SFSymbol.named('tag.circle.fill');
  const lableIcon = valueStack.addImage(tagIcon.image);
  lableIcon.imageSize = new Size(16, 16);
  lableIcon.tintColor = new Color('fa2d19');
  valueStack.addSpacer(5);
  const value = valueStack.addText(jValue.toString());
  value.font = Font.mediumSystemFont(14);
  valueStack.addSpacer(3);
  const jStack = valueStack.addStack();
  jStack.backgroundColor = new Color('fa2d19');
  jStack.cornerRadius = 5;
  jStack.setPadding(1, 4, 1, 4);
  const jLable = jStack.addText('京享');
  jLable.font = Font.systemFont(8);
  jLable.textColor = Color.white();
  return widget;
}
// #####################顶部内容###################
async function setHeaderShow(widget, image) {
  const topStack = widget.addStack();
  topStack.centerAlignContent();
  const JDLogo = topStack.addImage(await getImage(logo));
  JDLogo.imageSize = new Size(size.logo, size.logo);
  if (image) {
    topStack.addSpacer(10);
    const JD = topStack.addImage(await getImage(image));
    JD.imageSize = new Size(194 * 0.2, 78 * 0.2);
  }
  topStack.addSpacer();
  const jdBean = topStack.addText(beanCount.toString());
  jdBean.font = Font.boldSystemFont(21);
  jdBean.textColor = new Color('fa2d19');
  const desStack = topStack.addStack();
  desStack.layoutVertically();
  desStack.addSpacer(5.5);
  const desText = desStack.addText(' 京豆');
  desText.font = Font.mediumSystemFont(10);
  desText.textColor = jdBean.textColor;
  return widget;
}
// #####################京豆收支###################
async function setBeanShow(widget, textSize, imageSize) {
  const beanStack = widget.addStack();
  // 今日收支
  const todayStack = beanStack.addStack();
  todayStack.layoutVertically();
  await rowBeanCell(
    todayStack,
    todayExpenseBean.toString(),
    todayIncomeBean.toString(),
    textSize,
    '今日',
  );
  beanStack.addSpacer();
  // 京豆图片
  const ddStack = beanStack.addStack();
  ddStack.layoutVertically();
  const ddImg = ddStack.addImage(await getImage(jdImg));
  ddImg.imageSize = new Size(imageSize, imageSize);
  beanStack.addSpacer();
  // 昨日收支
  const yestodayStack = beanStack.addStack();
  yestodayStack.layoutVertically();
  await rowBeanCell(
    yestodayStack,
    expenseBean.toString(),
    incomeBean.toString(),
    textSize,
    '昨日',
  );
  return widget;
}
// #####################京豆图表###################
async function setChartShow(widget) {
  let beanNum = [],
    beanDate = [];
  Object.keys(rangeTimer).forEach(function (day) {
    const numValue = rangeTimer[day];
    const arrDay = day.split('-');
    beanDate.push(arrDay[2]);
    beanNum.push(numValue);
  });
  if (config.widgetFamily == 'small') {
    beanDate.splice(0, 2);
    beanNum.splice(0, 2);
  }
  /*const beanNumStack = widget.addStack()
  const canva = new DrawContext()
  canva.size = new Size(210,10)
  canva.opaque = false
  canva.respectScreenScale=true
  canva.setTextAlignedCenter()
  canva.setFont(Font.mediumSystemFont(10))
  for (let i = 0; i < 6; i++) {
  canva.drawTextInRect(beanNum[i].toString(), new Rect(0 + i * 210 / 6, 0, 210/6, 10))
  }
  beanNumStack.addImage(canva.getImage())*/
  const chartStack = widget.addStack();
  chartStack.addImage(await createChart());
  const beanDateStack = widget.addStack();
  let showDays = config.widgetFamily == 'small' ? 4 : 6;
  for (let i = 0; i < showDays; i++) {
    beanDateStack.addSpacer();
    let subStack = beanDateStack.addStack();
    let beanDay = beanDateStack.addText(beanDate[i]);
    beanDay.font = new Font('ArialMT', 9);
    beanDay.textOpacity = 0.8;
    beanDateStack.addSpacer();
  }
}
// #####################物流信息###################
async function setPackageShow(widget) {
  const packageStack = widget.addStack();
  const detailStack = packageStack.addStack();
  detailStack.layoutVertically();
  const packageTitleStack = detailStack.addStack();
  packageTitleStack.centerAlignContent();
  const carIcon = packageTitleStack.addImage(await getImage(carImg));
  carIcon.imageSize = new Size(18, 18);
  packageTitleStack.addSpacer(4);
  const packageTitle = packageTitleStack.addText(
    packageData.dealLogList[0]['name'],
  );
  packageTitle.lineLimit = 1;
  packageTitle.font = Font.mediumSystemFont(12);
  detailStack.addSpacer(2);
  const packageDesc = detailStack.addText(
    packageData.dealLogList[0]['wlStateDesc'],
  );
  packageDesc.lineLimit = 3;
  packageDesc.font = Font.regularSystemFont(12);
  detailStack.addSpacer(2);
  const packageStateStack = detailStack.addStack();
  const packageTime = packageStateStack.addText(
    packageData.dealLogList[0]['createTime'],
  );
  packageTime.font = Font.regularSystemFont(9);
  packageTime.textOpacity = 0.7;
  packageStateStack.addSpacer();
  const packageState = packageStateStack.addText(
    packageData.dealLogList[0]['stateName'],
  );
  packageState.font = Font.regularSystemFont(9);
  packageTime.textOpacity = 0.7;
}
// #####################金贴&钢镚##################
async function setCoinShow(widget) {
  const extraData = widget.addStack();
  await rowCell(extraData, jtImg, 18, mainData.jintie, 16, '金贴', 13);
  extraData.addSpacer();
  await rowCell(
    extraData,
    gbImg,
    18,
    mainData['gangbeng'].toString(),
    16,
    '钢镚',
    13,
  );
  return widget;
}
// #####################京东白条##################
async function setBaitiaoShow(widget) {
  const baitiaoStack = widget.addStack();
  baitiaoStack.centerAlignContent();
  const baitiaoImage = baitiaoStack.addImage(await getImage(baitiaoImg));
  baitiaoImage.imageSize = new Size(127 * 0.17, 75 * 0.17);
  baitiaoStack.addSpacer(5);
  const baitiaoText = baitiaoStack.addText(baitiaoTitle);
  baitiaoText.font = Font.regularSystemFont(13);
  baitiaoStack.addSpacer();
  const baitiaoValue = baitiaoStack.addText(baitiaoAmount);
  baitiaoValue.font = Font.mediumSystemFont(15);
  baitiaoStack.addSpacer();
  const baitiaoDate = baitiaoStack.addText(baitiaoDesc);
  baitiaoDate.font = Font.regularSystemFont(10);
  baitiaoDate.textOpacity = 0.7;
}
// ####################小组件白条##################
async function setSmallBaitiaoShow(widget) {
  const oneStack = widget.addStack();
  oneStack.centerAlignContent();
  const baitiaoImage = oneStack.addImage(await getImage(baitiaoImg));
  baitiaoImage.imageSize = new Size(127 * 0.17, 75 * 0.17);
  oneStack.addSpacer(5);
  const baitiaoText = oneStack.addText(baitiaoTitle);
  baitiaoText.font = Font.regularSystemFont(13);
  oneStack.addSpacer();
  widget.addSpacer(5);
  const twoStack = widget.addStack();
  twoStack.centerAlignContent();
  const baitiaoValue = twoStack.addText(baitiaoAmount);
  baitiaoValue.font = Font.mediumSystemFont(15);
  twoStack.addSpacer();
  const baitiaoDate = twoStack.addText(baitiaoDesc);
  baitiaoDate.font = Font.regularSystemFont(10);
  baitiaoDate.textOpacity = 0.7;
}

async function rowCell(
  widget,
  image,
  imageSize,
  text,
  textSize,
  label,
  lableSize,
) {
  const rowStack = widget.addStack();
  rowStack.centerAlignContent();
  const rowImg = rowStack.addImage(await getImage(image));
  rowImg.imageSize = new Size(imageSize, imageSize);
  rowStack.addSpacer();
  const rowNumber = rowStack.addText(text);
  rowNumber.font = Font.regularSystemFont(textSize);
  rowStack.addSpacer();
  const rowLabel = rowStack.addText(label);
  rowLabel.font = Font.systemFont(lableSize);
}

async function rowBeanCell(widget, min, add, textSize, label) {
  const rowOne = widget.addStack();
  const labelText = rowOne.addText(label);
  labelText.font = Font.mediumSystemFont(10);
  labelText.textOpacity = 0.7;
  const rowTwo = widget.addStack();
  const rowNumber = rowTwo.addText(add);
  rowNumber.font = Font.lightSystemFont(textSize);
  if (min < 0) {
    const rowThree = widget.addStack();
    const minText = rowThree.addText(min);
    minText.font = Font.mediumSystemFont(10);
    minText.textColor = new Color('fa2d19');
  }
}

async function init() {
  try {
    if (!cookie) return;
    if (Keychain.contains(CACHE_KEY)) {
      rangeTimer = JSON.parse(Keychain.get(CACHE_KEY));
      timerKeys = Object.keys(rangeTimer);
      latelyDays = Object.keys(rangeTimer);
      if (timerKeys.length >= maxDays) {
        for (let i = 0; i < timerKeys.length - maxDays; i++) {
          delete rangeTimer[timerKeys[i]];
        }
        Keychain.set(CACHE_KEY, JSON.stringify(rangeTimer));
      }
      rangeTimer[latelyDays[4]] = 0;
      rangeTimer[latelyDays[5]] = 0;
      timerKeys = [latelyDays[4], latelyDays[5]];
    } else {
      rangeTimer = getDay(5);
      timerKeys = Object.keys(rangeTimer);
    }
    await TotalBean();
    await getAmountData();
  } catch (e) {
    console.log(e);
  }
}

async function getAmountData() {
  let i = 0,
    page = 1;
  do {
    const response = await getJingBeanBalanceDetail(page);
    const result = response.code === '0';
    console.log(`第${page}页：${result ? '请求成功' : '请求失败'}`);
    if (response.code === '3') {
      i = 1;
      console.log(response);
    }
    if (response && result) {
      page++;
      let detailList = response.jingDetailList;
      if (detailList && detailList.length > 0) {
        for (let item of detailList) {
          const dates = item.date.split(' ');
          if (timerKeys.indexOf(dates[0]) > -1) {
            const amount = Number(item.amount);
            rangeTimer[dates[0]] += amount;
            if (latelyDays[4] === dates[0]) {
              const yestodayAmount = Number(item.amount);
              if (yestodayAmount > 0) incomeBean += yestodayAmount;
              if (yestodayAmount < 0) expenseBean += yestodayAmount;
            }
            if (latelyDays[5] === dates[0]) {
              const todayAmount = Number(item.amount);
              if (todayAmount > 0) todayIncomeBean += todayAmount;
              if (todayAmount < 0) todayExpenseBean += todayAmount;
            }
          } else {
            i = 1;
            Keychain.set(CACHE_KEY, JSON.stringify(rangeTimer));
            break;
          }
        }
      }
    }
  } while (i === 0);
}

function getDay(dayNumber) {
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
    data[`${year}-${month}-${day}`] = 0;
    i--;
  } while (i >= 0);
  return data;
}

async function TotalBean() {
  const url = 'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2';
  const request = new Request(url);
  request.headers = {
    cookie: cookie,
    Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
  };
  const response = await request.loadJSON();
  if (response.retcode === 0) {
    beanCount = response.base.jdNum;
    userImage = response.base.headImageUrl;
    userName = response.base.nickname;
    jValue = response.base.jvalue;
    plus = response.isPlusVip;
  } else {
    console.log('京东服务器返回空数据');
  }
  return response;
}

async function getJingBeanBalanceDetail(page) {
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
        Cookie: cookie,
        Host: `bean.m.jd.com`,
        Referer: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`,
        'Accept-Language': `zh-cn`,
        Accept: `application/json, text/javascript, */*; q=0.01`,
      },
    };
    let params = { ...options, method: 'POST' };
    let request = new Request(params.url);
    Object.keys(params).forEach((key) => {
      request[key] = params[key];
    });
    return await request.loadJSON();
  } catch (e) {
    console.log(e);
  }
}

async function chartConfig(labels = [], datas = [], chartTextSize, topPadding) {
  const chartStr = `
  {
    'type': 'bar',
    'data': {
      'labels': ${JSON.stringify(labels)}, // 替换
      'datasets': [
      {
        type: 'line',
        backgroundColor: '#ffffff',
        borderColor: getGradientFillHelper('vertical', ['#fa2d19', '#fa2d19']),
        'borderWidth': 2,
        pointRadius: 6,
        'fill': false,
        'data': ${JSON.stringify(datas)}, // 数据
      },
      ],
    },
    'options': {
      plugins: {
        datalabels: {
          display: true,
          align: 'top',
          color: '#${chartTextColor.hex}', // 文字颜色
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
      'legend': {
        'display': false,
      },
      scales: {
        xAxes: [
        {
          gridLines: {
            display: false,
            color: '#000000',
          },
          ticks: {
            display: false,
            fontColor: '#000000', 
            fontSize: '20',
          },
        },
        ],
        yAxes: [
        {
          ticks: {
            display: false,
            beginAtZero: false,
            fontColor: '#000000',
          },
          gridLines: {
            display: false,
            color: '#000000',
          },
        },
        ],
      },
    },
  }`;
  return chartStr;
}

async function createChart() {
  let labels = [],
    data = [];
  Object.keys(rangeTimer).forEach(function (month) {
    const value = rangeTimer[month];
    const arrMonth = month.split('-');
    labels.push(`${arrMonth[1]}.${arrMonth[2]}`);
    data.push(value);
  });
  let chartTextSize = 18;
  let topPadding = 20;
  if (config.widgetFamily == 'small') {
    data.splice(0, 2);
    labels.splice(0, 2);
    chartTextSize = chartTextSize + 7;
    topPadding = topPadding + 10;
  }
  const chartStr = await chartConfig(labels, data, chartTextSize, topPadding);
  console.log(chartStr);
  const url = `https://quickchart.io/chart?w=400&h=${
    size.chartHeight
  }&f=png&c=${encodeURIComponent(chartStr)}`;
  return await getImage(url);
}

// 获取金贴和钢镚
async function getMainData(isSign) {
  //津贴查询
  const JTUrl = 'https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance';
  const JTReq = new Request(JTUrl);
  JTReq.headers = {
    cookie: cookie,
    Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
  };
  const JTData = await JTReq.loadJSON();
  //钢镚查询
  const GBUrl = 'https://coin.jd.com/m/gb/getBaseInfo.html';
  const GBReq = new Request(GBUrl);
  GBReq.headers = {
    cookie: cookie,
    Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
  };
  const GBData = await GBReq.loadJSON();
  //签到查询,正则
  const substr = 'pt_key=' + cookie.match(/pt_key=(\S*);/)[1] + ';';
  const substr1 = 'pt_pin=' + cookie.match(/pt_pin=(\S*);/)[1] + ';';
  if (isSign == 1) {
    const signUrl = 'http://jd.kzddck.cn:3001/?cookie=' + substr + substr1;
    const signReq = new Request(signUrl);
    console.log('开始签到');
    try {
      console.log('正在签到');
      await signReq.load();
      console.log('签到成功');
      let myDate = new Date();
      let ty = myDate.toLocaleDateString();
      Keychain.set('time' + userID, ty);
      console.log('time写入成功');
    } catch (e) {
      console.log(e);
      console.log('可能签到失败了');
    }
  } else if (isSign == 0) {
    console.log('今日已签到');
  }
  const data = {
    jintie: JTData.resultData.data['balance'],
    gangbeng: GBData.gbBalance,
  };
  return data;
}

async function cache() {
  let cache = Keychain.contains('time' + userID);
  let myDate = new Date();
  let ty = myDate.toLocaleDateString();
  if (cache == true) {
    let caches = Keychain.get('time' + userID);
    if (caches == ty) {
      var cachedata = 0;
    }
  } else {
    console.log('还没有签到');
    var cachedata = 1;
  }
  return cachedata;
}

async function getPackageData() {
  var url =
    'https://wq.jd.com/bases/wuliudetail/notify?sceneval=2&sceneval=2&g_login_type=1&callback';
  var req = new Request(url);
  req.headers = {
    cookie: cookie,
    Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
  };
  var data = await req.loadJSON();
  if (data.errCode == 0) {
    await cache();
    console.log('cookie正常');
  } else {
    console.log('cookie失效');
    var data = {
      dealLogList: [
        {
          stateName: 'Cookie失效了',
          name: 'Cookie失效了',
          img: 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/',
          createTime: 'Cookie失效了',
          wlStateDesc: 'Cookie失效了',
        },
      ],
    };
  }
  return data;
}

async function getBaitiaoData() {
  const req = new Request(
    'https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew',
  );
  req.method = 'POST';
  req.body =
    'reqData={"clientType":"ios","clientVersion":"13.2.3","deviceId":"","environment":"3"}';
  req.headers = {
    cookie: cookie,
  };
  const res = await req.loadJSON();
  return res;
}

async function getImage(url) {
  const req = await new Request(url);
  return await req.loadImage();
}

if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '京东豆多合一';
    this.en = 'jd_all_one';
    this.run();
  }

  run = () => {
    if (config.runsInApp) {
      this.registerAction('账号设置', async () => {
        await this.setAlertInput('账号设置', '京东账号 Ck', {
          username: '昵称',
          cookie: 'Cookie',
        });
      });
      this.registerAction('代理缓存', this.actionSettings);
      this.registerAction('基础设置', this.setWidgetConfig);
    }
    cookie = this.settings.cookie ? `${this.settings.cookie};` : cookie;
    userID = decodeURIComponent(
      cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1],
    );
  };

  CookiesData = [];

  // 加载京东 Ck 节点列表
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

  async render() {
    await this.getWidgetBackgroundImage(w);
    isSign = await cache();
    CACHE_KEY = 'cache_jd_' + userID;
    packageData = await getPackageData();
    packageNum = packageData.dealLogList.length;
    mainData = await getMainData(isSign);
    await init();
    if (showBaitiao) {
      baitiaoData = await getBaitiaoData();
      baitiaoTitle = baitiaoData['resultData']['data']['bill']['title'];
      baitiaoAmount = baitiaoData['resultData']['data']['bill'][
        'amount'
      ].replace(/,/g, '');
      baitiaoDesc = baitiaoData['resultData']['data']['bill'][
        'buttonName'
      ].replace(/最近还款日/g, '');
    }

    if (config.widgetFamily == 'small') {
      return await renderSmallWidget();
    } else if (config.widgetFamily == 'large') {
      return await renderLargeWidget();
    } else {
      return await renderMediumWidget();
    }
  }
}

await Runing(Widget, '', false);

//version:1.0.0
