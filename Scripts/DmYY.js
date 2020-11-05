// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: map-pin;
if (typeof require === "undefined") require = importModule;
const { Base } = require("./「小件件」开发环境");
/*
 * Author: 2Ya
 * Github: https://github.com/dompling
 */

class DmYY extends Base {
  constructor(arg) {
    super(arg);
  }

  name = "";
  en = "";
  JDCookie = {
    cookie: "",
    userName: "",
  };
  prefix = "boxjs.net";
  CookiesData = [];
  defaultCacheData = {};
  isNight = Device.isUsingDarkAppearance();
  forceImageUpdate = false;
  imageBackground = true;

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
    get: async (url = "", options, type = "JSON") => {
      const params = { url, ...options, method: "GET" };
      let _type = type;
      if (typeof options === "string") _type = options;
      return await this.http(params, _type);
    },
    post: async (url = "", options, type = "JSON") => {
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
      let data;
      const cacheKeys = Object.keys(this.defaultCacheData);
      if (cacheKeys.length) {
        data = {};
        cacheKeys.forEach((params) => {
          const datasKey = `${key}.${params}`;
          const dataValue = boxdata.datas[datasKey];
          if (dataValue) {
            data[params] = dataValue;
          }
        });
      } else {
        const cacheValue = boxdata.datas[key];
        if (cacheValue) {
          data = this.transforJSON(cacheValue);
        }
      }
      return data;
    } catch (e) {
      this.notify("2丫消息", "请检查代理是否开启，并接入了 BoxJs");
      console.log(e);
      return [];
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
  chooseImgAndCache = async () => {
    const photoLibrary = await Photos.fromLibrary();
    return photoLibrary;
  };

  // 设置 widget 背景图片
  setWidgetBackgroundImage = async (widget) => {
    if (this.imageBackground) {
      const isExistImage = this.getBackgroundImage();
      const backImage =
        !isExistImage && !this.forceImageUpdate
          ? await this.chooseImgAndCache()
          : isExistImage;
      await this.setBackgroundImage(backImage, false);
      widget.backgroundImage = await this.shadowImage(
        backImage,
        "#000",
        this.isNight ? 0.7 : 0.4
      );
    }
    return widget;
  };

  JDRun = (filename, args) => {
    this.JDindex = parseInt(args.widgetParameter) || undefined;
    this.logo = "https://raw.githubusercontent.com/Orz-3/task/master/jd.png";
    this.JDCookie = this.settings[this.en] || {
      cookie: "",
      userName: "",
    };
    if (this.JDindex !== undefined) {
      this.JDCookie = this.settings.JDAccount[this.JDindex];
    }
    let _md5 = this.md5(filename + this.en + this.JDCookie.cookie);
    this.CACHE_KEY = `cache_${_md5}`;
    // 注册操作菜单
    this.registerAction("输入京东 CK", this.inputJDck);
    this.registerAction("选择京东 CK", this.actionSettings);
  };

  renderJDHeader = async (header) => {
    header.centerAlignContent();
    const headerLogo = header.addStack();
    await this.renderHeader(
      headerLogo,
      this.logo,
      this.name,
      new Color("#fff")
    );
    header.addSpacer(155);
    const headerMore = header.addStack();
    headerMore.url = "https://home.m.jd.com/myJd/home.action";
    headerMore.setPadding(1, 10, 1, 10);
    headerMore.cornerRadius = 10;
    headerMore.backgroundColor = new Color("#fff", 0.5);
    const textItem = headerMore.addText(this.JDCookie.userName);
    textItem.font = Font.boldSystemFont(12);
    textItem.textColor = new Color("#fff");
    textItem.lineLimit = 1;
    return header;
  };

  // 加载京东 Ck 节点列表
  _loadJDCk = async () => {
    try {
      this.CookiesData = await this.getCache("CookiesJD");
      return this.CookiesData;
    } catch (e) {
      console.log(e);
    }
  };

  async inputJDck() {
    const a = new Alert();
    a.title = "京东账号 Ck";
    a.message = "手动输入京东 Ck";
    a.addTextField("昵称", this.JDCookie.userName);
    a.addTextField("Cookie", this.JDCookie.cookie);
    a.addAction("确定");
    a.addCancelAction("取消");
    const id = await a.presentAlert();
    if (id === -1) return;
    this.JDCookie.userName = a.textFieldValue(0);
    this.JDCookie.cookie = a.textFieldValue(1);
    // 保存到本地
    this.settings[this.en] = this.JDCookie;
    this.saveSettings();
  }

  async actionSettings() {
    const table = new UITable();
    // 如果是节点，则先远程获取
    if (this.CookiesData.length === 0) {
      this.settings.JDAccount = await this._loadJDCk();
    }
    this.CookiesData.map((t) => {
      const r = new UITableRow();
      r.addText(t.userName);
      r.onSelect = (n) => {
        this.settings[this.en] = t;
        this.saveSettings();
      };
      table.addRow(r);
    });
    let body = "京东 Ck 缓存成功，根据下标选择相应的 Ck";
    if (this.settings[this.en]) {
      body += "，或者使用当前选中Ck：" + this.settings[this.en].userName;
    }
    this.notify(this.name, body);
    table.present(false);
  }
}

// @base.end
const Runing = async (Widget, default_args = "", isDebug = true) => {
  let M = null;
  // 判断hash是否和当前设备匹配
  if (config.runsInWidget) {
    M = new Widget(args.widgetParameter || "");
    const W = await M.render();
    Script.setWidget(W);
    Script.complete();
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
              await w.presentSmall();
              break;
            case 1:
              M.widgetFamily = "medium";
              w = await M.render();
              await w.presentMedium();
              break;
            case 2:
              M.widgetFamily = "large";
              w = await M.render();
              await w.presentLarge();
              break;
            case 3:
              M.widgetFamily = "small";
              w = await M.render();
              await w.presentSmall();
              M.widgetFamily = "medium";
              w = await M.render();
              await w.presentMedium();
              M.widgetFamily = "large";
              w = await M.render();
              await w.presentLarge();
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
