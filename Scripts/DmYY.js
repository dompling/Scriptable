// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: map-pin;
if (typeof require === "undefined") require = importModule;
const { Base } = require("./「小件件」开发环境");
/*
 * Author: 2Ya
 * Github: https://github.com/dompling
 */

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
                        `const _Debugger = Base => {\n${_code}\nreturn Widget\n}\nreturn _Debugger`
                      );
                      NewWidget = _func()(Base);
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

module.exports = { Runing };
