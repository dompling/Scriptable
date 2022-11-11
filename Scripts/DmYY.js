// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: cogs;

/*
 * Author: 2Ya
 * Github: https://github.com/dompling
 */

class DmYY {
  constructor(arg, defaultSettings) {
    this.arg = arg;
    this.defaultSettings = defaultSettings || {};
    try {
      this.init();
    } catch (error) {
      console.log(error);
    }
    this.isNight = Device.isUsingDarkAppearance();
  }

  _actions = {};
  BACKGROUND_NIGHT_KEY;
  widgetColor;
  backGroundColor;
  useBoxJS = true;
  isNight;
  _actionsIcon = {};

  // 获取 Request 对象
  getRequest = (url = '') => {
    return new Request(url);
  };

  // 发起请求
  http = async (options = { headers: {}, url: '' }, type = 'JSON') => {
    let request;
    try {
      if (type === 'IMG') {
        const fileName = `${this.cacheImage}/${this.md5(options.url)}`;
        request = this.getRequest(options.url);
        let response;
        if (this.FILE_MGR.fileExists(fileName)) {
          request.loadImage().then((res) => {
            this.FILE_MGR.writeImage(fileName, res);
          });
          return Image.fromFile(fileName);
        } else {
          response = await request.loadImage();
          this.FILE_MGR.writeImage(fileName, response);
        }
        return response;
      }
      request = this.getRequest();
      Object.keys(options).forEach((key) => {
        request[key] = options[key];
      });
      request.headers = { ...this.defaultHeaders, ...options.headers };

      if (type === 'JSON') {
        return await request.loadJSON();
      }
      if (type === 'STRING') {
        return await request.loadString();
      }
      return await request.loadJSON();
    } catch (e) {
      console.log('error:' + e);
      if (type === 'IMG') return SFSymbol.named('photo').image;
    }
  };

  //request 接口请求
  $request = {
    get: async (url = '', options = {}, type = 'JSON') => {
      let params = { ...options, method: 'GET' };
      if (typeof url === 'object') {
        params = { ...params, ...url };
      } else {
        params.url = url;
      }
      let _type = type;
      if (typeof options === 'string') _type = options;
      return await this.http(params, _type);
    },
    post: async (url = '', options = {}, type = 'JSON') => {
      let params = { ...options, method: 'POST' };
      if (typeof url === 'object') {
        params = { ...params, ...url };
      } else {
        params.url = url;
      }
      let _type = type;
      if (typeof options === 'string') _type = options;
      return await this.http(params, _type);
    },
  };

  // 获取 boxJS 缓存
  getCache = async (key = '', notify = true) => {
    try {
      let url = 'http://' + this.prefix + '/query/boxdata';
      if (key) url = 'http://' + this.prefix + '/query/data/' + key;
      const boxdata = await this.$request.get(
        url,
        key ? { timeoutInterval: 1 } : {}
      );
      if (key) {
        this.settings.BoxJSData = {
          ...this.settings.BoxJSData,
          [key]: boxdata.val,
        };
        this.saveSettings(false);
      }
      if (boxdata.val) return boxdata.val;

      return boxdata.datas;
    } catch (e) {
      if (key && this.settings.BoxJSData[key]) {
        return this.settings.BoxJSData[key];
      }
      if (notify)
        await this.notify(
          `${this.name} - BoxJS 数据读取失败`,
          '请检查 BoxJS 域名是否为代理复写的域名，如（boxjs.net 或 boxjs.com）。\n若没有配置 BoxJS 相关模块，请点击通知查看教程',
          'https://chavyleung.gitbook.io/boxjs/awesome/videos'
        );
      return false;
    }
  };

  transforJSON = (str) => {
    if (typeof str == 'string') {
      try {
        return JSON.parse(str);
      } catch (e) {
        console.log(e);
        return str;
      }
    }
    console.log('It is not a string!');
  };

  // 选择图片并缓存
  chooseImg = async () => {
    return await Photos.fromLibrary();
  };

  // 设置 widget 背景图片
  getWidgetBackgroundImage = async (widget) => {
    const backgroundImage = this.getBackgroundImage();
    if (backgroundImage) {
      const opacity = Device.isUsingDarkAppearance()
        ? Number(this.settings.darkOpacity)
        : Number(this.settings.lightOpacity);
      widget.backgroundImage = await this.shadowImage(
        backgroundImage,
        '#000',
        opacity
      );
      return true;
    } else {
      if (this.backGroundColor.colors) {
        widget.backgroundGradient = this.backGroundColor;
      } else {
        widget.backgroundColor = this.backGroundColor;
      }
      return false;
    }
  };

  /**
   * 验证图片尺寸： 图片像素超过 1000 左右的时候会导致背景无法加载
   * @param img Image
   */
  verifyImage = async (img) => {
    try {
      const { width, height } = img.size;
      const direct = true;
      if (width > 1000) {
        const options = ['取消', '打开图像处理'];
        const message =
          '您的图片像素为' +
          width +
          ' x ' +
          height +
          '\n' +
          '请将图片' +
          (direct ? '宽度' : '高度') +
          '调整到 1000 以下\n' +
          (!direct ? '宽度' : '高度') +
          '自动适应';
        const index = await this.generateAlert(message, options);
        if (index === 1)
          Safari.openInApp('https://www.sojson.com/image/change.html', false);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * 获取截图中的组件剪裁图
   * 可用作透明背景
   * 返回图片image对象
   * 代码改自：https://gist.github.com/mzeryck/3a97ccd1e059b3afa3c6666d27a496c9
   * @param {string} title 开始处理前提示用户截图的信息，可选（适合用在组件自定义透明背景时提示）
   */
  async getWidgetScreenShot(title = null) {
    // Crop an image into the specified rect.
    function cropImage(img, rect) {
      let draw = new DrawContext();
      draw.size = new Size(rect.width, rect.height);

      draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y));
      return draw.getImage();
    }

    // Pixel sizes and positions for widgets on all supported phones.
    function phoneSizes() {
      return {
        // 12 Pro Max
        2778: {
          small: 510,
          medium: 1092,
          large: 1146,
          left: 96,
          right: 678,
          top: 246,
          middle: 882,
          bottom: 1518,
        },

        // 12 and 12 Pro
        2532: {
          small: 474,
          medium: 1014,
          large: 1062,
          left: 78,
          right: 618,
          top: 231,
          middle: 819,
          bottom: 1407,
        },

        // 11 Pro Max, XS Max
        2688: {
          small: 507,
          medium: 1080,
          large: 1137,
          left: 81,
          right: 654,
          top: 228,
          middle: 858,
          bottom: 1488,
        },

        // 11, XR
        1792: {
          small: 338,
          medium: 720,
          large: 758,
          left: 54,
          right: 436,
          top: 160,
          middle: 580,
          bottom: 1000,
        },

        // 11 Pro, XS, X, 12 mini
        2436: {
          x: {
            small: 465,
            medium: 987,
            large: 1035,
            left: 69,
            right: 591,
            top: 213,
            middle: 783,
            bottom: 1353,
          },

          mini: {
            small: 465,
            medium: 987,
            large: 1035,
            left: 69,
            right: 591,
            top: 231,
            middle: 801,
            bottom: 1371,
          },
        },

        // Plus phones
        2208: {
          small: 471,
          medium: 1044,
          large: 1071,
          left: 99,
          right: 672,
          top: 114,
          middle: 696,
          bottom: 1278,
        },

        // SE2 and 6/6S/7/8
        1334: {
          small: 296,
          medium: 642,
          large: 648,
          left: 54,
          right: 400,
          top: 60,
          middle: 412,
          bottom: 764,
        },

        // SE1
        1136: {
          small: 282,
          medium: 584,
          large: 622,
          left: 30,
          right: 332,
          top: 59,
          middle: 399,
          bottom: 399,
        },

        // 11 and XR in Display Zoom mode
        1624: {
          small: 310,
          medium: 658,
          large: 690,
          left: 46,
          right: 394,
          top: 142,
          middle: 522,
          bottom: 902,
        },

        // Plus in Display Zoom mode
        2001: {
          small: 444,
          medium: 963,
          large: 972,
          left: 81,
          right: 600,
          top: 90,
          middle: 618,
          bottom: 1146,
        },
      };
    }

    let message =
      title || '开始之前，请先前往桌面，截取空白界面的截图。然后回来继续';
    let exitOptions = ['我已截图', '前去截图 >'];
    let shouldExit = await this.generateAlert(message, exitOptions);
    if (shouldExit) return;

    // Get screenshot and determine phone size.
    let img = await Photos.fromLibrary();
    let height = img.size.height;
    let phone = phoneSizes()[height];
    if (!phone) {
      message = '好像您选择的照片不是正确的截图，请先前往桌面';
      await this.generateAlert(message, ['我已知晓']);
      return;
    }

    // Extra setup needed for 2436-sized phones.
    if (height === 2436) {
      const files = this.FILE_MGR_LOCAL;
      let cacheName = 'mz-phone-type';
      let cachePath = files.joinPath(files.libraryDirectory(), cacheName);

      // If we already cached the phone size, load it.
      if (files.fileExists(cachePath)) {
        let typeString = files.readString(cachePath);
        phone = phone[typeString];
        // Otherwise, prompt the user.
      } else {
        message = '您的📱型号是?';
        let types = ['iPhone 12 mini', 'iPhone 11 Pro, XS, or X'];
        let typeIndex = await this.generateAlert(message, types);
        let type = typeIndex === 0 ? 'mini' : 'x';
        phone = phone[type];
        files.writeString(cachePath, type);
      }
    }

    // Prompt for widget size and position.
    message = '截图中要设置透明背景组件的尺寸类型是？';
    let sizes = ['小尺寸', '中尺寸', '大尺寸'];
    let size = await this.generateAlert(message, sizes);
    let widgetSize = sizes[size];

    message = '要设置透明背景的小组件在哪个位置？';
    message +=
      height === 1136
        ? ' （备注：当前设备只支持两行小组件，所以下边选项中的「中间」和「底部」的选项是一致的）'
        : '';

    // Determine image crop based on phone size.
    let crop = { w: '', h: '', x: '', y: '' };
    if (widgetSize === '小尺寸') {
      crop.w = phone.small;
      crop.h = phone.small;
      let positions = [
        '左上角',
        '右上角',
        '中间左',
        '中间右',
        '左下角',
        '右下角',
      ];
      let _posotions = [
        'Top left',
        'Top right',
        'Middle left',
        'Middle right',
        'Bottom left',
        'Bottom right',
      ];
      let position = await this.generateAlert(message, positions);

      // Convert the two words into two keys for the phone size dictionary.
      let keys = _posotions[position].toLowerCase().split(' ');
      crop.y = phone[keys[0]];
      crop.x = phone[keys[1]];
    } else if (widgetSize === '中尺寸') {
      crop.w = phone.medium;
      crop.h = phone.small;

      // Medium and large widgets have a fixed x-value.
      crop.x = phone.left;
      let positions = ['顶部', '中间', '底部'];
      let _positions = ['Top', 'Middle', 'Bottom'];
      let position = await this.generateAlert(message, positions);
      let key = _positions[position].toLowerCase();
      crop.y = phone[key];
    } else if (widgetSize === '大尺寸') {
      crop.w = phone.medium;
      crop.h = phone.large;
      crop.x = phone.left;
      let positions = ['顶部', '底部'];
      let position = await this.generateAlert(message, positions);

      // Large widgets at the bottom have the "middle" y-value.
      crop.y = position ? phone.middle : phone.top;
    }

    // Crop image and finalize the widget.
    return cropImage(img, new Rect(crop.x, crop.y, crop.w, crop.h));
  }

  setLightAndDark = async (title, desc, val) => {
    try {
      const a = new Alert();
      a.title = title;
      a.message = desc;
      a.addTextField('', `${this.settings[val]}`);
      a.addAction('确定');
      a.addCancelAction('取消');
      const id = await a.presentAlert();
      if (id === -1) return;
      this.settings[val] = a.textFieldValue(0);
      this.saveSettings();
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * 弹出输入框
   * @param title 标题
   * @param desc  描述
   * @param opt   属性
   * @returns {Promise<void>}
   */
  setAlertInput = async (title, desc, opt = {}, isSave = true) => {
    const a = new Alert();
    a.title = title;
    a.message = !desc ? '' : desc;
    Object.keys(opt).forEach((key) => {
      a.addTextField(opt[key], this.settings[key]);
    });
    a.addAction('确定');
    a.addCancelAction('取消');
    const id = await a.presentAlert();
    if (id === -1) return;
    const data = {};
    Object.keys(opt).forEach((key, index) => {
      data[key] = a.textFieldValue(index);
    });
    // 保存到本地
    if (isSave) {
      this.settings = { ...this.settings, ...data };
      return this.saveSettings();
    }
    return data;
  };

  /**
   * 设置当前项目的 boxJS 缓存
   * @param opt key value
   * @returns {Promise<void>}
   */
  setCacheBoxJSData = async (opt = {}) => {
    const options = ['取消', '确定'];
    const message = '代理缓存仅支持 BoxJS 相关的代理！';
    const index = await this.generateAlert(message, options);
    if (index === 0) return;
    try {
      const boxJSData = await this.getCache();
      Object.keys(opt).forEach((key) => {
        this.settings[key] = boxJSData[opt[key]] || '';
      });
      // 保存到本地
      this.saveSettings();
    } catch (e) {
      console.log(e);
      this.notify(
        this.name,
        'BoxJS 缓存读取失败！点击查看相关教程',
        'https://chavyleung.gitbook.io/boxjs/awesome/videos'
      );
    }
  };

  /**
   * 设置组件内容
   * @returns {Promise<void>}
   */
  setWidgetConfig = async () => {
    const table = new UITable();
    table.showSeparators = true;
    await this.renderDmYYTables(table);
    await table.present();
  };

  async preferences(table, arr, outfit) {
    let header = new UITableRow();
    let heading = header.addText(outfit);
    heading.titleFont = Font.mediumSystemFont(17);
    heading.centerAligned();
    table.addRow(header);
    for (const item of arr) {
      const row = new UITableRow();
      row.dismissOnSelect = !!item.dismissOnSelect;
      if (item.url) {
        const rowIcon = row.addImageAtURL(item.url);
        rowIcon.widthWeight = 100;
      } else {
        const icon = item.icon || {};
        const image = await this.drawTableIcon(
          icon.name,
          icon.color,
          item.cornerWidth
        );
        const imageCell = row.addImage(image);
        imageCell.widthWeight = 100;
      }
      let rowTitle = row.addText(item['title']);
      rowTitle.widthWeight = 400;
      rowTitle.titleFont = Font.systemFont(16);
      if (this.settings[item.val] || item.val) {
        let valText = row.addText(
          `${this.settings[item.val] || item.val}`.toUpperCase()
        );
        const fontSize = !item.val ? 26 : 16;
        valText.widthWeight = 500;
        valText.rightAligned();
        valText.titleColor = Color.blue();
        valText.titleFont = Font.mediumSystemFont(fontSize);
      } else {
        const imgCell = UITableCell.imageAtURL(
          'https://gitee.com/scriptableJS/Scriptable/raw/master/images/more.png'
        );
        imgCell.rightAligned();
        imgCell.widthWeight = 500;
        row.addCell(imgCell);
      }

      row.onSelect = item.onClick
        ? async () => {
            try {
              await item.onClick(item, table);
            } catch (e) {
              console.log(e);
            }
          }
        : async () => {
            if (item.type == 'input') {
              await this.setLightAndDark(
                item['title'],
                item['desc'],
                item['val']
              );
            } else if (item.type == 'setBackground') {
              const backImage = await this.getWidgetScreenShot();
              if (backImage) {
                await this.setBackgroundImage(backImage, true);
                await this.setBackgroundNightImage(backImage, true);
              }
            } else if (item.type == 'removeBackground') {
              const options = ['取消', '清空'];
              const message = '该操作不可逆，会清空所有背景图片！';
              const index = await this.generateAlert(message, options);
              if (index === 0) return;
              await this.setBackgroundImage(false, true);
              await this.setBackgroundNightImage(false, true);
            } else {
              const backImage = await this.chooseImg();
              if (!backImage || !(await this.verifyImage(backImage))) return;
              if (item.type == 'setDayBackground')
                await this.setBackgroundImage(backImage, true);
              if (item.type == 'setNightBackground')
                await this.setBackgroundNightImage(backImage, true);
            }
            await this.renderDmYYTables(table);
          };
      table.addRow(row);
    }
    table.reload();
  }

  drawTableIcon = async (
    icon = 'square.grid.2x2',
    color = '#e8e8e8',
    cornerWidth = 42
  ) => {
    const sfi = SFSymbol.named(icon);
    sfi.applyFont(Font.mediumSystemFont(30));
    const imgData = Data.fromPNG(sfi.image).toBase64String();
    const html = `
    <img id="sourceImg" src="data:image/png;base64,${imgData}" />
    <img id="silhouetteImg" src="" />
    <canvas id="mainCanvas" />
    `;
    const js = `
    var canvas = document.createElement("canvas");
    var sourceImg = document.getElementById("sourceImg");
    var silhouetteImg = document.getElementById("silhouetteImg");
    var ctx = canvas.getContext('2d');
    var size = sourceImg.width > sourceImg.height ? sourceImg.width : sourceImg.height;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(sourceImg, (canvas.width - sourceImg.width) / 2, (canvas.height - sourceImg.height) / 2);
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pix = imgData.data;
    //convert the image into a silhouette
    for (var i=0, n = pix.length; i < n; i+= 4){
      //set red to 0
      pix[i] = 255;
      //set green to 0
      pix[i+1] = 255;
      //set blue to 0
      pix[i+2] = 255;
      //retain the alpha value
      pix[i+3] = pix[i+3];
    }
    ctx.putImageData(imgData,0,0);
    silhouetteImg.src = canvas.toDataURL();
    output=canvas.toDataURL()
    `;

    let wv = new WebView();
    await wv.loadHTML(html);
    const base64Image = await wv.evaluateJavaScript(js);
    const iconImage = await new Request(base64Image).loadImage();
    const size = new Size(160, 160);
    const ctx = new DrawContext();
    ctx.opaque = false;
    ctx.respectScreenScale = true;
    ctx.size = size;
    const path = new Path();
    const rect = new Rect(0, 0, size.width, size.width);

    path.addRoundedRect(rect, cornerWidth, cornerWidth);
    path.closeSubpath();
    ctx.setFillColor(new Color(color));
    ctx.addPath(path);
    ctx.fillPath();
    const rate = 36;
    const iw = size.width - rate;
    const x = (size.width - iw) / 2;
    ctx.drawImageInRect(iconImage, new Rect(x, x, iw, iw));
    return ctx.getImage();
  };

  async renderDmYYTables(table) {
    const basic = [
      {
        icon: { name: 'arrow.clockwise', color: '#1890ff' },
        type: 'input',
        title: '刷新时间',
        desc: '刷新时间仅供参考，具体刷新时间由系统判断，单位：分钟',
        val: 'refreshAfterDate',
      },
      {
        icon: { name: 'photo', color: '#13c2c2' },
        type: 'input',
        title: '白天背景颜色',
        desc: '请自行去网站上搜寻颜色（Hex 颜色）\n支持渐变色，各颜色之间以英文逗号分隔',
        val: 'lightBgColor',
      },
      {
        icon: { name: 'photo.fill', color: '#52c41a' },
        type: 'input',
        title: '晚上背景颜色',
        desc: '请自行去网站上搜寻颜色（Hex 颜色）\n支持渐变色，各颜色之间以英文逗号分隔',
        val: 'darkBgColor',
      },
      {
        icon: { name: 'sun.max.fill', color: '#d48806' },
        type: 'input',
        title: '白天字体颜色',
        desc: '请自行去网站上搜寻颜色（Hex 颜色）',
        val: 'lightColor',
      },
      {
        icon: { name: 'moon.stars.fill', color: '#d4b106' },
        type: 'input',
        title: '晚上字体颜色',
        desc: '请自行去网站上搜寻颜色（Hex 颜色）',
        val: 'darkColor',
      },
    ];
    const background = [
      {
        icon: { name: 'text.below.photo', color: '#faad14' },
        type: 'setBackground',
        title: '透明背景设置',
      },
      {
        icon: { name: 'photo.on.rectangle', color: '#fa8c16' },
        type: 'setDayBackground',
        title: '白天背景图片',
      },
      {
        icon: { name: 'photo.fill.on.rectangle.fill', color: '#fa541c' },
        type: 'setNightBackground',
        title: '晚上背景图片',
      },
      {
        icon: { name: 'record.circle', color: '#722ed1' },
        type: 'input',
        title: '白天蒙层透明',
        desc: '完全透明请设置为0',
        val: 'lightOpacity',
      },
      {
        icon: { name: 'record.circle.fill', color: '#eb2f96' },
        type: 'input',
        title: '晚上蒙层透明',
        desc: '完全透明请设置为0',
        val: 'darkOpacity',
      },
      {
        icon: { name: 'clear', color: '#f5222d' },
        type: 'removeBackground',
        title: '清空背景图片',
      },
    ];
    const boxjs = {
      icon: { name: 'shippingbox', color: '#f7bb10' },
      type: 'input',
      title: 'BoxJS 域名',
      desc: '',
      val: 'boxjsDomain',
    };
    if (this.useBoxJS) basic.push(boxjs);
    table.removeAllRows();
    let topRow = new UITableRow();
    topRow.height = 60;
    let leftText = topRow.addButton('Github');
    leftText.widthWeight = 0.3;
    leftText.onTap = async () => {
      await Safari.openInApp('https://github.com/dompling/Scriptable');
    };
    let centerRow = topRow.addImageAtURL(
      'https://s3.ax1x.com/2021/03/16/6y4oJ1.png'
    );
    centerRow.widthWeight = 0.4;
    centerRow.centerAligned();
    centerRow.onTap = async () => {
      await Safari.open('https://t.me/Scriptable_JS');
    };
    let rightText = topRow.addButton('重置所有');
    rightText.widthWeight = 0.3;
    rightText.rightAligned();
    rightText.onTap = async () => {
      const options = ['取消', '重置'];
      const message =
        '该操作不可逆，会清空所有组件配置！重置后请重新打开设置菜单。';
      const index = await this.generateAlert(message, options);
      if (index === 0) return;
      this.settings = {};
      await this.setBackgroundImage(false, false);
      this.FILE_MGR.remove(this.cacheImage);
      this.saveSettings();
    };
    table.addRow(topRow);
    await this.preferences(table, basic, '基础设置');
    await this.preferences(table, background, '背景图片');
  }

  init(widgetFamily = config.widgetFamily) {
    // 组件大小：small,medium,large
    this.widgetFamily = widgetFamily;
    this.SETTING_KEY = this.md5(Script.name());
    //用于配置所有的组件相关设置

    // 文件管理器
    // 提示：缓存数据不要用这个操作，这个是操作源码目录的，缓存建议存放在local temp目录中
    this.FILE_MGR =
      FileManager[
        module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local'
      ]();

    this.cacheImage = this.FILE_MGR.joinPath(
      this.FILE_MGR.libraryDirectory(),
      `${Script.name()}/images`
    );

    if (!this.FILE_MGR.fileExists(this.cacheImage)) {
      this.FILE_MGR.createDirectory(this.cacheImage, true);
    }

    // 本地，用于存储图片等
    this.FILE_MGR_LOCAL = FileManager.local();
    this.BACKGROUND_KEY = this.FILE_MGR_LOCAL.joinPath(
      this.FILE_MGR_LOCAL.documentsDirectory(),
      'bg_' + this.SETTING_KEY + '.jpg'
    );

    this.BACKGROUND_NIGHT_KEY = this.FILE_MGR_LOCAL.joinPath(
      this.FILE_MGR_LOCAL.documentsDirectory(),
      'bg_' + this.SETTING_KEY + 'night.jpg'
    );

    this.settings = this.getSettings();

    this.settings = { ...this.defaultSettings, ...this.settings };

    this.settings.lightColor = this.settings.lightColor || '#000000';
    this.settings.darkColor = this.settings.darkColor || '#ffffff';
    this.settings.lightBgColor = this.settings.lightBgColor || '#ffffff';
    this.settings.darkBgColor = this.settings.darkBgColor || '#000000';
    this.settings.boxjsDomain = this.settings.boxjsDomain || 'boxjs.net';
    this.settings.refreshAfterDate = this.settings.refreshAfterDate || '30';
    this.settings.lightOpacity = this.settings.lightOpacity || '0.4';
    this.settings.darkOpacity = this.settings.darkOpacity || '0.7';

    this.prefix = this.settings.boxjsDomain;
    const lightBgColor = this.getColors(this.settings.lightBgColor);
    const darkBgColor = this.getColors(this.settings.darkBgColor);
    if (lightBgColor.length > 1 || darkBgColor.length > 1) {
      this.backGroundColor = !Device.isUsingDarkAppearance()
        ? this.getBackgroundColor(lightBgColor)
        : this.getBackgroundColor(darkBgColor);
    } else if (lightBgColor.length > 0 && darkBgColor.length > 0) {
      this.backGroundColor = Color.dynamic(
        new Color(this.settings.lightBgColor),
        new Color(this.settings.darkBgColor)
      );
    }

    this.widgetColor = Color.dynamic(
      new Color(this.settings.lightColor),
      new Color(this.settings.darkColor)
    );
  }

  getColors = (color = '') => {
    const colors = typeof color === 'string' ? color.split(',') : color;
    return colors;
  };

  getBackgroundColor = (colors) => {
    const locations = [];
    const linearColor = new LinearGradient();
    const cLen = colors.length;
    linearColor.colors = colors.map((item, index) => {
      locations.push(Math.floor(((index + 1) / cLen) * 100) / 100);
      return new Color(item, 1);
    });
    linearColor.locations = locations;
    return linearColor;
  };

  /**
   * 注册点击操作菜单
   * @param {string} name 操作函数名
   * @param {func} func 点击后执行的函数
   */
  registerAction(name, func, icon = { name: 'gear', color: '#096dd9' }) {
    this._actions[name] = func.bind(this);
    this._actionsIcon[name] = icon;
  }

  /**
   * base64 编码字符串
   * @param {string} str 要编码的字符串
   */
  base64Encode(str) {
    const data = Data.fromString(str);
    return data.toBase64String();
  }

  /**
   * base64解码数据 返回字符串
   * @param {string} b64 base64编码的数据
   */
  base64Decode(b64) {
    const data = Data.fromBase64String(b64);
    return data.toRawString();
  }

  /**
   * md5 加密字符串
   * @param {string} str 要加密成md5的数据
   */
  md5(str) {
    function d(n, t) {
      var r = (65535 & n) + (65535 & t);
      return (((n >> 16) + (t >> 16) + (r >> 16)) << 16) | (65535 & r);
    }

    function f(n, t, r, e, o, u) {
      return d(((c = d(d(t, n), d(e, u))) << (f = o)) | (c >>> (32 - f)), r);
      var c, f;
    }

    function l(n, t, r, e, o, u, c) {
      return f((t & r) | (~t & e), n, t, o, u, c);
    }

    function v(n, t, r, e, o, u, c) {
      return f((t & e) | (r & ~e), n, t, o, u, c);
    }

    function g(n, t, r, e, o, u, c) {
      return f(t ^ r ^ e, n, t, o, u, c);
    }

    function m(n, t, r, e, o, u, c) {
      return f(r ^ (t | ~e), n, t, o, u, c);
    }

    function i(n, t) {
      var r, e, o, u;
      (n[t >> 5] |= 128 << t % 32), (n[14 + (((t + 64) >>> 9) << 4)] = t);
      for (
        var c = 1732584193,
          f = -271733879,
          i = -1732584194,
          a = 271733878,
          h = 0;
        h < n.length;
        h += 16
      )
        (c = l((r = c), (e = f), (o = i), (u = a), n[h], 7, -680876936)),
          (a = l(a, c, f, i, n[h + 1], 12, -389564586)),
          (i = l(i, a, c, f, n[h + 2], 17, 606105819)),
          (f = l(f, i, a, c, n[h + 3], 22, -1044525330)),
          (c = l(c, f, i, a, n[h + 4], 7, -176418897)),
          (a = l(a, c, f, i, n[h + 5], 12, 1200080426)),
          (i = l(i, a, c, f, n[h + 6], 17, -1473231341)),
          (f = l(f, i, a, c, n[h + 7], 22, -45705983)),
          (c = l(c, f, i, a, n[h + 8], 7, 1770035416)),
          (a = l(a, c, f, i, n[h + 9], 12, -1958414417)),
          (i = l(i, a, c, f, n[h + 10], 17, -42063)),
          (f = l(f, i, a, c, n[h + 11], 22, -1990404162)),
          (c = l(c, f, i, a, n[h + 12], 7, 1804603682)),
          (a = l(a, c, f, i, n[h + 13], 12, -40341101)),
          (i = l(i, a, c, f, n[h + 14], 17, -1502002290)),
          (c = v(
            c,
            (f = l(f, i, a, c, n[h + 15], 22, 1236535329)),
            i,
            a,
            n[h + 1],
            5,
            -165796510
          )),
          (a = v(a, c, f, i, n[h + 6], 9, -1069501632)),
          (i = v(i, a, c, f, n[h + 11], 14, 643717713)),
          (f = v(f, i, a, c, n[h], 20, -373897302)),
          (c = v(c, f, i, a, n[h + 5], 5, -701558691)),
          (a = v(a, c, f, i, n[h + 10], 9, 38016083)),
          (i = v(i, a, c, f, n[h + 15], 14, -660478335)),
          (f = v(f, i, a, c, n[h + 4], 20, -405537848)),
          (c = v(c, f, i, a, n[h + 9], 5, 568446438)),
          (a = v(a, c, f, i, n[h + 14], 9, -1019803690)),
          (i = v(i, a, c, f, n[h + 3], 14, -187363961)),
          (f = v(f, i, a, c, n[h + 8], 20, 1163531501)),
          (c = v(c, f, i, a, n[h + 13], 5, -1444681467)),
          (a = v(a, c, f, i, n[h + 2], 9, -51403784)),
          (i = v(i, a, c, f, n[h + 7], 14, 1735328473)),
          (c = g(
            c,
            (f = v(f, i, a, c, n[h + 12], 20, -1926607734)),
            i,
            a,
            n[h + 5],
            4,
            -378558
          )),
          (a = g(a, c, f, i, n[h + 8], 11, -2022574463)),
          (i = g(i, a, c, f, n[h + 11], 16, 1839030562)),
          (f = g(f, i, a, c, n[h + 14], 23, -35309556)),
          (c = g(c, f, i, a, n[h + 1], 4, -1530992060)),
          (a = g(a, c, f, i, n[h + 4], 11, 1272893353)),
          (i = g(i, a, c, f, n[h + 7], 16, -155497632)),
          (f = g(f, i, a, c, n[h + 10], 23, -1094730640)),
          (c = g(c, f, i, a, n[h + 13], 4, 681279174)),
          (a = g(a, c, f, i, n[h], 11, -358537222)),
          (i = g(i, a, c, f, n[h + 3], 16, -722521979)),
          (f = g(f, i, a, c, n[h + 6], 23, 76029189)),
          (c = g(c, f, i, a, n[h + 9], 4, -640364487)),
          (a = g(a, c, f, i, n[h + 12], 11, -421815835)),
          (i = g(i, a, c, f, n[h + 15], 16, 530742520)),
          (c = m(
            c,
            (f = g(f, i, a, c, n[h + 2], 23, -995338651)),
            i,
            a,
            n[h],
            6,
            -198630844
          )),
          (a = m(a, c, f, i, n[h + 7], 10, 1126891415)),
          (i = m(i, a, c, f, n[h + 14], 15, -1416354905)),
          (f = m(f, i, a, c, n[h + 5], 21, -57434055)),
          (c = m(c, f, i, a, n[h + 12], 6, 1700485571)),
          (a = m(a, c, f, i, n[h + 3], 10, -1894986606)),
          (i = m(i, a, c, f, n[h + 10], 15, -1051523)),
          (f = m(f, i, a, c, n[h + 1], 21, -2054922799)),
          (c = m(c, f, i, a, n[h + 8], 6, 1873313359)),
          (a = m(a, c, f, i, n[h + 15], 10, -30611744)),
          (i = m(i, a, c, f, n[h + 6], 15, -1560198380)),
          (f = m(f, i, a, c, n[h + 13], 21, 1309151649)),
          (c = m(c, f, i, a, n[h + 4], 6, -145523070)),
          (a = m(a, c, f, i, n[h + 11], 10, -1120210379)),
          (i = m(i, a, c, f, n[h + 2], 15, 718787259)),
          (f = m(f, i, a, c, n[h + 9], 21, -343485551)),
          (c = d(c, r)),
          (f = d(f, e)),
          (i = d(i, o)),
          (a = d(a, u));
      return [c, f, i, a];
    }

    function a(n) {
      for (var t = '', r = 32 * n.length, e = 0; e < r; e += 8)
        t += String.fromCharCode((n[e >> 5] >>> e % 32) & 255);
      return t;
    }

    function h(n) {
      var t = [];
      for (t[(n.length >> 2) - 1] = void 0, e = 0; e < t.length; e += 1)
        t[e] = 0;
      for (var r = 8 * n.length, e = 0; e < r; e += 8)
        t[e >> 5] |= (255 & n.charCodeAt(e / 8)) << e % 32;
      return t;
    }

    function e(n) {
      for (var t, r = '0123456789abcdef', e = '', o = 0; o < n.length; o += 1)
        (t = n.charCodeAt(o)),
          (e += r.charAt((t >>> 4) & 15) + r.charAt(15 & t));
      return e;
    }

    function r(n) {
      return unescape(encodeURIComponent(n));
    }

    function o(n) {
      return a(i(h((t = r(n))), 8 * t.length));
      var t;
    }

    function u(n, t) {
      return (function (n, t) {
        var r,
          e,
          o = h(n),
          u = [],
          c = [];
        for (
          u[15] = c[15] = void 0,
            16 < o.length && (o = i(o, 8 * n.length)),
            r = 0;
          r < 16;
          r += 1
        )
          (u[r] = 909522486 ^ o[r]), (c[r] = 1549556828 ^ o[r]);
        return (
          (e = i(u.concat(h(t)), 512 + 8 * t.length)), a(i(c.concat(e), 640))
        );
      })(r(n), r(t));
    }

    function t(n, t, r) {
      return t ? (r ? u(t, n) : e(u(t, n))) : r ? o(n) : e(o(n));
    }

    return t(str);
  }

  /**
   * 渲染标题内容
   * @param {object} widget 组件对象
   * @param {string} icon 图标地址
   * @param {string} title 标题内容
   * @param {bool|color} color 字体的颜色（自定义背景时使用，默认系统）
   */
  async renderHeader(widget, icon, title, color = false) {
    let header = widget.addStack();
    header.centerAlignContent();
    try {
      const image = await this.$request.get(icon, 'IMG');
      let _icon = header.addImage(image);
      _icon.imageSize = new Size(14, 14);
      _icon.cornerRadius = 4;
    } catch (e) {
      console.log(e);
    }
    header.addSpacer(10);
    let _title = header.addText(title);
    if (color) _title.textColor = color;
    _title.textOpacity = 0.7;
    _title.font = Font.boldSystemFont(12);
    _title.lineLimit = 1;
    widget.addSpacer(15);
    return widget;
  }

  /**
   * @param message 描述内容
   * @param options 按钮
   * @returns {Promise<number>}
   */

  async generateAlert(message, options) {
    let alert = new Alert();
    alert.message = message;

    for (const option of options) {
      alert.addAction(option);
    }
    return await alert.presentAlert();
  }

  /**
   * 弹出一个通知
   * @param {string} title 通知标题
   * @param {string} body 通知内容
   * @param {string} url 点击后打开的URL
   */
  async notify(title, body, url, opts = {}) {
    let n = new Notification();
    n = Object.assign(n, opts);
    n.title = title;
    n.body = body;
    if (url) n.openURL = url;
    return await n.schedule();
  }

  /**
   * 给图片加一层半透明遮罩
   * @param {Image} img 要处理的图片
   * @param {string} color 遮罩背景颜色
   * @param {float} opacity 透明度
   */
  async shadowImage(img, color = '#000000', opacity = 0.7) {
    if (!img) return;
    if (opacity === 0) return img;
    let ctx = new DrawContext();
    // 获取图片的尺寸
    ctx.size = img.size;

    ctx.drawImageInRect(
      img,
      new Rect(0, 0, img.size['width'], img.size['height'])
    );
    ctx.setFillColor(new Color(color, opacity));
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']));
    return await ctx.getImage();
  }

  /**
   * 获取当前插件的设置
   * @param {boolean} json 是否为json格式
   */
  getSettings(json = true) {
    let res = json ? {} : '';
    let cache = '';
    if (Keychain.contains(this.SETTING_KEY)) {
      cache = Keychain.get(this.SETTING_KEY);
    }
    if (json) {
      try {
        res = JSON.parse(cache);
      } catch (e) {}
    } else {
      res = cache;
    }

    return res;
  }

  /**
   * 存储当前设置
   * @param {bool} notify 是否通知提示
   */
  saveSettings(notify = true) {
    let res =
      typeof this.settings === 'object'
        ? JSON.stringify(this.settings)
        : String(this.settings);
    Keychain.set(this.SETTING_KEY, res);
    if (notify) this.notify('设置成功', '桌面组件稍后将自动刷新');
  }

  /**
   * 获取当前插件是否有自定义背景图片
   * @reutrn img | false
   */
  getBackgroundImage() {
    let result = null;
    if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_KEY)) {
      result = Image.fromFile(this.BACKGROUND_KEY);
    }
    if (
      Device.isUsingDarkAppearance() &&
      this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_NIGHT_KEY)
    ) {
      result = Image.fromFile(this.BACKGROUND_NIGHT_KEY);
    }
    return result;
  }

  /**
   * 设置当前组件的背景图片
   * @param {Image} img
   */
  setBackgroundImage(img, notify = true) {
    if (!img) {
      // 移除背景
      if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_KEY)) {
        this.FILE_MGR_LOCAL.remove(this.BACKGROUND_KEY);
      }
      if (notify)
        this.notify('移除成功', '小组件白天背景图片已移除，稍后刷新生效');
    } else {
      // 设置背景
      // 全部设置一遍，
      this.FILE_MGR_LOCAL.writeImage(this.BACKGROUND_KEY, img);
      if (notify)
        this.notify('设置成功', '小组件白天背景图片已设置！稍后刷新生效');
    }
  }

  setBackgroundNightImage(img, notify = true) {
    if (!img) {
      // 移除背景
      if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_NIGHT_KEY)) {
        this.FILE_MGR_LOCAL.remove(this.BACKGROUND_NIGHT_KEY);
      }
      if (notify)
        this.notify('移除成功', '小组件夜间背景图片已移除，稍后刷新生效');
    } else {
      // 设置背景
      // 全部设置一遍，
      this.FILE_MGR_LOCAL.writeImage(this.BACKGROUND_NIGHT_KEY, img);
      if (notify)
        this.notify('设置成功', '小组件夜间背景图片已设置！稍后刷新生效');
    }
  }

  getRandomArrayElements(arr, count) {
    let shuffled = arr.slice(0),
      i = arr.length,
      min = i - count,
      temp,
      index;
    min = min > 0 ? min : 0;
    while (i-- > min) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(min);
  }

  textFormat = {
    defaultText: { size: 14, font: 'regular', color: this.widgetColor },
    battery: { size: 10, font: 'bold', color: this.widgetColor },
    title: { size: 16, font: 'semibold', color: this.widgetColor },
    SFMono: { size: 12, font: 'SF Mono', color: this.widgetColor },
  };

  provideFont = (fontName, fontSize) => {
    const fontGenerator = {
      ultralight: function () {
        return Font.ultraLightSystemFont(fontSize);
      },
      light: function () {
        return Font.lightSystemFont(fontSize);
      },
      regular: function () {
        return Font.regularSystemFont(fontSize);
      },
      medium: function () {
        return Font.mediumSystemFont(fontSize);
      },
      semibold: function () {
        return Font.semiboldSystemFont(fontSize);
      },
      bold: function () {
        return Font.boldSystemFont(fontSize);
      },
      heavy: function () {
        return Font.heavySystemFont(fontSize);
      },
      black: function () {
        return Font.blackSystemFont(fontSize);
      },
      italic: function () {
        return Font.italicSystemFont(fontSize);
      },
    };

    const systemFont = fontGenerator[fontName];
    if (systemFont) {
      return systemFont();
    }
    return new Font(fontName, fontSize);
  };

  provideText = (
    string,
    container,
    format = {
      font: 'light',
      size: 14,
      color: this.widgetColor,
      opacity: 1,
      minimumScaleFactor: 1,
    }
  ) => {
    const textItem = container.addText(string);
    const textFont = format.font;
    const textSize = format.size;
    const textColor = format.color;

    textItem.font = this.provideFont(textFont, textSize);
    textItem.textColor = textColor;
    textItem.textOpacity = format.opacity || 1;
    textItem.minimumScaleFactor = format.minimumScaleFactor || 1;
    return textItem;
  };
}

// @base.end
const Runing = async (Widget, default_args = '', isDebug = true, extra) => {
  let M = null;
  // 判断hash是否和当前设备匹配
  if (config.runsInWidget) {
    M = new Widget(args.widgetParameter || '');

    if (extra) {
      Object.keys(extra).forEach((key) => {
        M[key] = extra[key];
      });
    }
    const W = await M.render();
    try {
      if (M.settings.refreshAfterDate) {
        const refreshTime = parseInt(M.settings.refreshAfterDate) * 1000 * 60;
        const timeStr = new Date().getTime() + refreshTime;
        W.refreshAfterDate = new Date(timeStr);
      }
    } catch (e) {
      console.log(e);
    }
    if (W) {
      Script.setWidget(W);
      Script.complete();
    }
  } else {
    let { act, __arg, __size } = args.queryParameters;
    M = new Widget(__arg || default_args || '');
    if (extra) {
      Object.keys(extra).forEach((key) => {
        M[key] = extra[key];
      });
    }
    if (__size) M.init(__size);
    if (!act || !M['_actions']) {
      // 弹出选择菜单
      const actions = M['_actions'];
      const table = new UITable();
      const onClick = async (item) => {
        M.widgetFamily = item.val;
        w = await M.render();
        const fnc = item.val
          .toLowerCase()
          .replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
        if (w) {
          return w[`present${fnc}`]();
        }
      };
      const preview = [
        {
          url: 'https://pic1.imgdb.cn/item/63315c3616f2c2beb1a2931a.png',
          title: '小尺寸',
          val: 'small',
          dismissOnSelect: true,
          onClick,
        },
        {
          url: 'https://pic1.imgdb.cn/item/63315c2c16f2c2beb1a28706.png',
          title: '中尺寸',
          val: 'medium',
          dismissOnSelect: true,
          onClick,
        },
        {
          url: 'https://pic1.imgdb.cn/item/63315c2716f2c2beb1a27f24.png',
          title: '大尺寸',
          val: 'large',
          dismissOnSelect: true,
          onClick,
        },
      ];
      await M.preferences(table, preview, '预览组件');
      const extra = [];
      for (let _ in actions) {
        const iconItem = M._actionsIcon[_];
        const isUrl = typeof iconItem === 'string';
        const actionItem = {
          title: _,
          onClick: actions[_],
        };
        if (isUrl) {
          actionItem.url = iconItem;
        } else {
          actionItem.icon = iconItem;
        }
        extra.push(actionItem);
      }
      await M.preferences(table, extra, '配置组件');
      return table.present();
    }
  }
};

// await new DmYY().setWidgetConfig();
module.exports = { DmYY, Runing };
