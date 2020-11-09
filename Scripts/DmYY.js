// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: map-pin;

/*
 * Author: 2Ya
 * Github: https://github.com/dompling
 */

class DmYY {
  constructor(arg) {
    this.arg = arg;
    this._actions = {};
    this.init();
    this.backgroundImage = this.getBackgroundImage();
    this.widgetColor = this.backgroundImage
      ? new Color("#fff")
      : Color.dynamic(Color.black(), Color.white());
  }

  prefix = "boxjs.net";
  isNight = Device.isUsingDarkAppearance();

  // 获取 Request 对象
  getRequest = (url = "") => {
    return new Request(url);
  };

  // 发起请求
  http = async (options = { headers: {}, url: "" }, type = "JSON") => {
    try {
      let request;
      if (type !== "IMG") {
        request = this.getRequest();
        Object.keys(options).forEach((key) => {
          request[key] = options[key];
        });
        request.headers = { ...this.defaultHeaders, ...options.headers };
      } else {
        request = this.getRequest(options.url);
        return await request.loadImage();
      }
      if (type === "JSON") {
        return await request.loadJSON();
      }
      if (type === "STRING") {
        return await request.loadString();
      }
      return await request.loadJSON();
    } catch (e) {
      console.log("error:" + e);
    }
  };

  //request 接口请求
  $request = {
    get: async (url = "", options = {}, type = "JSON") => {
      const params = { url, ...options, method: "GET" };
      let _type = type;
      if (typeof options === "string") _type = options;
      return await this.http(params, _type);
    },
    post: async (url = "", options = {}, type = "JSON") => {
      const params = { url, ...options, method: "POST" };
      let _type = type;
      if (typeof options === "string") _type = options;
      return await this.http(params, _type);
    },
  };

  // 获取 boxJS 缓存
  getCache = async (key) => {
    try {
      const url = `http://${this.prefix}/query/boxdata`;
      const boxdata = await this.$request.get(url);
      if (key && boxdata.datas[key]) return boxdata.datas[key];
      return boxdata.datas;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  transforJSON = (str) => {
    if (typeof str == "string") {
      try {
        return JSON.parse(str);
      } catch (e) {
        console.log(e);
        return str;
      }
    }
    console.log("It is not a string!");
  };

  // 选择图片并缓存
  chooseImg = async () => {
    const photoLibrary = await Photos.fromLibrary();
    return photoLibrary;
  };

  // 设置 widget 背景图片
  getWidgetBackgroundImage = async (widget) => {
    if (this.backgroundImage) {
      widget.backgroundImage = await this.shadowImage(
        this.backgroundImage,
        "#000",
        this.isNight ? 0.7 : 0.4
      );
    }
    return widget;
  };

  setWidgetBackground = async () => {
    const alert = new Alert();
    alert.title = "设置背景图";
    alert.message = "清空或设置新的背景图";
    alert.addAction("设置新背景图");
    alert.addAction("清空背景");
    alert.addCancelAction("取消");
    const actions = [
      async () => {
        const backImage = await this.chooseImg();
        await this.setBackgroundImage(backImage, true);
      },
      () => {
        this.setBackgroundImage(false, true);
      },
    ];
    const id = await alert.presentAlert();
    if (id === -1) return;
    actions[id] && actions[id].call(this);
  };

  init(widgetFamily = config.widgetFamily) {
    // 组件大小：small,medium,large
    this.widgetFamily = widgetFamily;
    this.SETTING_KEY = this.md5(Script.name());
    // 文件管理器
    // 提示：缓存数据不要用这个操作，这个是操作源码目录的，缓存建议存放在local temp目录中
    this.FILE_MGR = FileManager[
      module.filename.includes("Documents/iCloud~") ? "iCloud" : "local"
    ]();
    // 本地，用于存储图片等
    this.FILE_MGR_LOCAL = FileManager.local();
    this.BACKGROUND_KEY = this.FILE_MGR_LOCAL.joinPath(
      this.FILE_MGR_LOCAL.documentsDirectory(),
      `bg_${this.SETTING_KEY}.jpg`
    );
    this.settings = this.getSettings();
  }

  /**
   * 注册点击操作菜单
   * @param {string} name 操作函数名
   * @param {func} func 点击后执行的函数
   */
  registerAction(name, func) {
    this._actions[name] = func.bind(this);
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
      for (var t = "", r = 32 * n.length, e = 0; e < r; e += 8)
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
      for (var t, r = "0123456789abcdef", e = "", o = 0; o < n.length; o += 1)
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
    const image = await this.$request.get(icon, "IMG");
    console.log(image);
    let _icon = header.addImage(image);
    _icon.imageSize = new Size(14, 14);
    _icon.cornerRadius = 4;
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
  async shadowImage(img, color = "#000000", opacity = 0.7) {
    let ctx = new DrawContext();
    // 获取图片的尺寸
    ctx.size = img.size;

    ctx.drawImageInRect(
      img,
      new Rect(0, 0, img.size["width"], img.size["height"])
    );
    ctx.setFillColor(new Color(color, opacity));
    ctx.fillRect(new Rect(0, 0, img.size["width"], img.size["height"]));

    let res = await ctx.getImage();
    return res;
  }

  /**
   * 获取当前插件的设置
   * @param {boolean} json 是否为json格式
   */
  getSettings(json = true) {
    let res = json ? {} : "";
    let cache = "";
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
      typeof this.settings === "object"
        ? JSON.stringify(this.settings)
        : String(this.settings);
    Keychain.set(this.SETTING_KEY, res);
    if (notify) this.notify("设置成功", "桌面组件稍后将自动刷新");
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
    return result;
  }

  /**
   * 设置当前组件的背景图片
   * @param {image} img
   */
  setBackgroundImage(img, notify = true) {
    if (!img) {
      // 移除背景
      if (this.FILE_MGR_LOCAL.fileExists(this.BACKGROUND_KEY)) {
        this.FILE_MGR_LOCAL.remove(this.BACKGROUND_KEY);
      }
      if (notify) this.notify("移除成功", "小组件背景图片已移除，稍后刷新生效");
    } else {
      // 设置背景
      // 全部设置一遍，
      this.FILE_MGR_LOCAL.writeImage(this.BACKGROUND_KEY, img);
      if (notify) this.notify("设置成功", "小组件背景图片已设置！稍后刷新生效");
    }
  }
}

// @base.end
const Runing = async (Widget, default_args = "", isDebug = true) => {
  let M = null;
  // 判断hash是否和当前设备匹配
  if (config.runsInWidget) {
    M = new Widget(args.widgetParameter || "");
    const W = await M.render();
    if (W) {
      Script.setWidget(W);
      Script.complete();
    }
  } else {
    let { act, data, __arg, __size } = args.queryParameters;
    M = new Widget(__arg || default_args || "");
    if (__size) M.init(__size);
    if (!act || !M["_actions"]) {
      // 弹出选择菜单
      const actions = M["_actions"];
      const _actions = [
        ...(isDebug
          ? [
              // 远程开发
              async () => {
                // 1. 获取服务器ip
                const a = new Alert();
                a.title = "服务器 IP";
                a.message = "请输入远程开发服务器（电脑）IP地址";
                let xjj_debug_server = "192.168.1.3";
                if (Keychain.contains("xjj_debug_server")) {
                  xjj_debug_server = Keychain.get("xjj_debug_server");
                }
                a.addTextField("server-ip", xjj_debug_server);
                a.addAction("连接");
                a.addCancelAction("取消");
                const id = await a.presentAlert();
                if (id === -1) return;
                const ip = a.textFieldValue(0);
                // 保存到本地
                Keychain.set("xjj_debug_server", ip);
                const server_api = `http://${ip}:5566`;
                // 2. 发送当前文件到远程服务器
                const SELF_FILE = module.filename.replace(
                  "DmYY",
                  Script.name()
                );
                const req = new Request(`${server_api}/sync`);
                req.method = "POST";
                req.addFileToMultipart(SELF_FILE, "Widget", Script.name());
                try {
                  const res = await req.loadString();
                  if (res !== "ok") {
                    return M.notify("连接失败", res);
                  }
                } catch (e) {
                  return M.notify("连接错误", e.message);
                }
                M.notify("连接成功", "编辑文件后保存即可进行下一步预览操作");
                // 重写console.log方法，把数据传递到nodejs
                const rconsole_log = async (data, t = "log") => {
                  const _req = new Request(`${server_api}/console`);
                  _req.method = "POST";
                  _req.headers = {
                    "Content-Type": "application/json",
                  };
                  _req.body = JSON.stringify({
                    t,
                    data,
                  });
                  return await _req.loadString();
                };
                const lconsole_log = console.log.bind(console);
                const lconsole_warn = console.warn.bind(console);
                const lconsole_error = console.error.bind(console);
                console.log = (d) => {
                  lconsole_log(d);
                  rconsole_log(d, "log");
                };
                console.warn = (d) => {
                  lconsole_warn(d);
                  rconsole_log(d, "warn");
                };
                console.error = (d) => {
                  lconsole_error(d);
                  rconsole_log(d, "error");
                };
                // 3. 同步
                while (1) {
                  let _res = "";
                  try {
                    const _req = new Request(
                      `${server_api}/sync?name=${encodeURIComponent(
                        Script.name()
                      )}`
                    );
                    _res = await _req.loadString();
                  } catch (e) {
                    M.notify("停止调试", "与开发服务器的连接已终止");
                    break;
                  }
                  if (_res === "stop") {
                    console.log("[!] 停止同步");
                    break;
                  } else if (_res === "no") {
                    // console.log("[-] 没有更新内容")
                  } else if (_res.length > 0) {
                    M.notify("同步成功", "新文件已同步，大小：" + _res.length);
                    // 重新加载组件
                    // 1. 读取当前源码
                    const _code = _res
                      .split("// @组件代码开始")[1]
                      .split("// @组件代码结束")[0];
                    // 2. 解析 widget class
                    let NewWidget = null;
                    try {
                      const _func = new Function(
                        `const _Debugger = DmYY => {\n${_code}\nreturn Widget\n}\nreturn _Debugger`
                      );
                      NewWidget = _func()(DmYY);
                    } catch (e) {
                      M.notify("解析失败", e.message);
                    }
                    if (!NewWidget) continue;
                    // 3. 重新执行 widget class
                    delete M;
                    M = new NewWidget(__arg || default_args || "");
                    if (__size) M.init(__size);
                    // 写入文件
                    FileManager.local().writeString(SELF_FILE, _res);
                    // 执行预览
                    let i = await _actions[1](true);
                    if (i === 4 + Object.keys(actions).length) break;
                  }
                }
              },
            ]
          : []),
        // 预览组件
        async (debug = false) => {
          let a = new Alert();
          a.title = "预览组件";
          a.message = "测试桌面组件在各种尺寸下的显示效果";
          a.addAction("小尺寸 Small");
          a.addAction("中尺寸 Medium");
          a.addAction("大尺寸 Large");
          a.addAction("全部 All");
          a.addCancelAction("取消操作");
          const funcs = [];
          if (debug) {
            for (let _ in actions) {
              a.addAction(_);
              funcs.push(actions[_].bind(M));
            }
            a.addDestructiveAction("停止调试");
          }
          let i = await a.presentSheet();
          if (i === -1) return;
          let w;
          switch (i) {
            case 0:
              M.widgetFamily = "small";
              w = await M.render();
              w && (await w.presentSmall());
              break;
            case 1:
              M.widgetFamily = "medium";
              w = await M.render();
              w && (await w.presentMedium());
              break;
            case 2:
              M.widgetFamily = "large";
              w = await M.render();
              w && (await w.presentLarge());
              break;
            case 3:
              M.widgetFamily = "small";
              w = await M.render();
              w && (await w.presentSmall());
              M.widgetFamily = "medium";
              w = await M.render();
              w && (await w.presentMedium());
              M.widgetFamily = "large";
              w = await M.render();
              w && (await w.presentLarge());
              break;
            default:
              const func = funcs[i - 4];
              if (func) await func();
              break;
          }

          return i;
        },
      ];
      const alert = new Alert();
      alert.title = M.name;
      alert.message = M.desc;
      if (isDebug) {
        alert.addAction("远程开发");
      }
      alert.addAction("预览组件");
      for (let _ in actions) {
        alert.addAction(_);
        _actions.push(actions[_]);
      }
      alert.addCancelAction("取消操作");
      const idx = await alert.presentSheet();
      if (_actions[idx]) {
        const func = _actions[idx];
        await func();
      }
      return;
    }
    let _tmp = act
      .split("-")
      .map((_) => _[0].toUpperCase() + _.substr(1))
      .join("");
    let _act = `action${_tmp}`;
    if (M[_act] && typeof M[_act] === "function") {
      const func = M[_act].bind(M);
      await func(data);
    }
  }
};

module.exports = { DmYY, Runing };
