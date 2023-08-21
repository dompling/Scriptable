// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: dollar;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

const logo = `https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico`;
const fontFamily = "AmericanTypewriter-Bold";

const api = {
  me: `https://api.spotify.com/v1/me`,
  accounts: `https://accounts.spotify.com/api/token`,
  currentlyPlayingTrack: `https://api.spotify.com/v1/me/player/currently-playing`,
  getTrack: `https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl`,
  palyState: `https://api.spotify.com/v1/me/player`,
  playlists: `https://api.spotify.com/v1/me/playlists`,
  following: `https://api.spotify.com/v1/me/following?type=artist`,
};

const scope = [
  "ugc-image-upload",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "playlist-read-private",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-top-read",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-private",
  "user-read-email",
  "user-library-modify",
  "user-library-read",
  "user-follow-modify",
  "user-follow-read",
  "streaming",
  "app-remote-control",
];

const webUri = `https://accounts.spotify.com/zh-CN/login?continue=${encodeURIComponent(
  "https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile"
)}`;

function generateRandomString(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function convertMillisecondsToHMS(milliseconds) {
  // 计算总共有多少秒
  let totalSeconds = Math.floor(milliseconds / 1000);

  // 计算分钟数
  let minutes = Math.floor(totalSeconds / 60);

  // 剩余的秒数
  let seconds = totalSeconds - minutes * 60;

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  // 组合时分秒
  return minutes + ":" + seconds;
}

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.en = "Spotify";
    this.name = "声田音乐";
    this.SETTING_KEY = this.md5(this.en);
    this._init();
    this.auth2 = args.queryParameters.code
      ? args.queryParameters
      : this.settings.auth2;

    this.settings.auth2 = this.auth2;
    this.saveSettings(false);

    if (config.runsInApp) {
      this.registerAction({
        icon: {
          name: "airplayaudio.circle.fill",
          color: "#65D46E",
        },
        title: "登录",
        val: "login",
        name: "login",
        dismissOnSelect: true,
        onClick: () => {
          return this.getWebToken();
        },
      });

      this.registerAction({
        icon: {
          name: "music.note",
          color: "#65D46E",
        },
        title: "客户端 ID",
        val: "clientId",
        name: "clientId",
        type: "input",
        dismissOnSelect: true,
      });

      this.registerAction("基础设置", this.setWidgetConfig);
    }
  }

  baseUri = "";
  accessToken = "";
  dataSource = {
    currentlyPlayingTrack: {},
    playlists: {},
    me: {},
    following: {},
  };

  init = async () => {
    await this.getAccessToken();
    if (!this.settings.accessToken) return this.notify(this.name, "请登录！！");
    this.accessToken = `${this.settings.accessToken.token_type} ${this.settings.accessToken.access_token}`;
    this.dataSource.playlists = await this.getApiRes(api.playlists);
    this.dataSource.following = await this.getApiRes(api.following);
    this.dataSource.me = await this.getApiRes(api.me);
    this.dataSource.currentlyPlayingTrack = await this.getApiRes(
      api.currentlyPlayingTrack
    );
  };

  getAccessToken = async () => {
    const { accessToken } = this.settings;
    if (accessToken) {
      const diffTime = (new Date().getTime() - accessToken.time) / 1000;
      if (diffTime > accessToken.expires_in) {
        return this.refreshToken();
      }
    } else if (this.auth2) {
      if (!this.auth2.code)
        return this.notify(
          this.name,
          "请登录！！！",
          "https://developer.spotify.com"
        );
      const { clientId, codeVerifier } = this.settings;

      const options = {
        code: this.auth2.code,
        client_id: clientId,
        code_verifier: codeVerifier,
        grant_type: "authorization_code",
        redirect_uri: "scriptable:///run/Spotify?openEditor=true",
      };

      const body = Object.entries(options)
        .map((item) => `${item[0]}=${item[1]}`)
        .join("&");

      const response = await this.$request.post(api.accounts, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
      });

      console.log(response);

      if (!response.error) {
        this.auth2 = null;
        this.settings.auth2 = null;
        this.settings.accessToken = {
          ...this.settings.accessToken,
          ...response,
          time: new Date().getTime(),
        };
        console.log(
          `获取 Token 成功，有效期 ${response.expires_in / (60 * 10)} 分钟`
        );
        this.saveSettings();
      }
    }
  };

  refreshToken = async () => {
    const { accessToken, clientId } = this.settings;

    const options = {
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: accessToken.refresh_token,
    };

    const body = Object.entries(options)
      .map((item) => `${item[0]}=${item[1]}`)
      .join("&");
    const response = await this.$request.post(api.accounts, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: this.accessToken,
      },
      body: body,
    });
    console.log("token 过期，更新");
    console.log(response);
    if (!response.error) {
      this.auth2 = null;
      this.settings.auth2 = null;
      this.settings.accessToken = {
        ...this.settings.accessToken,
        ...response,
        time: new Date().getTime(),
      };
      console.log(
        `刷新 Token 成功，有效期 ${response.expires_in / (60 * 10)} 分钟`
      );
      this.saveSettings(false);
    }
  };

  getWebToken = async () => {
    const clientId = this.settings.clientId;
    if (!clientId)
      this.notify(
        this.name,
        "请到 Spotify 官网申请开发者账号创建 APP",
        "https://developer.spotify.com"
      );

    this.settings.codeVerifier = generateRandomString(128);
    this.saveSettings(false);

    return WebView.loadURL(
      `https://dompling.github.io/Spotify?clientId=${clientId}&codeVerifier=${
        this.settings.codeVerifier
      }&scope=${encodeURIComponent(scope.join(" "))}`
    );
  };

  getApiRes = async (uri) => {
    try {
      const response = await this.$request.get(uri, {
        headers: { Authorization: this.accessToken },
      });
      if (!response || response.error)
        throw new Error(JSON.stringify(response));
      return response;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  renderLarge = async (widget) => {
    const { currentlyPlayingTrack, playlists, me, following } = this.dataSource;
    if (currentlyPlayingTrack.is_playing) {
    } else {
      const containerStack = widget.addStack();
      containerStack.layoutVertically();
      const logoStack = containerStack.addStack();

      logoStack.centerAlignContent();
      logoStack.addSpacer();
      const logoImage = await this.$request.get(logo, "IMG");
      const logoImageWidget = logoStack.addImage(logoImage);
      logoImageWidget.imageSize = new Size(20, 20);
      logoImageWidget.centerAlignImage();

      const meStack = containerStack.addStack();
      meStack.centerAlignContent();

      const avatarImage = await this.$request.get(
        me.images[1]?.url || me.images[0]?.url,
        "IMG"
      );

      const avatarStack = meStack.addImage(avatarImage);
      avatarStack.imageSize = new Size(64, 64);
      avatarStack.cornerRadius = avatarStack.imageSize.height / 2;

      meStack.addSpacer(20);

      const infoStack = meStack.addStack();
      infoStack.layoutVertically();
      this.provideText(me.display_name, infoStack, {
        size: 16,
        font: fontFamily,
      });
      infoStack.addSpacer(20);

      this.provideText(me.email, infoStack, {
        size: 12,
        font: fontFamily,
      });

      containerStack.addSpacer(20);

      const followStack = containerStack.addStack();
      followStack.centerAlignContent();
      this.provideText(`Following`, followStack, {
        size: 16,
        font: fontFamily,
      });

      followStack.addSpacer();

      this.provideText(`${following.artists.total || 0}`, followStack, {
        size: 16,
        font: fontFamily,
      });

      containerStack.addSpacer(10);

      const followingItemStack = containerStack.addStack();
      followingItemStack.addSpacer();
      const itemSize = new Size(48, 48);
      for (let index = 0; index < following.artists.items.length; index++) {
        if (index === 4) break;

        const item = following.artists.items[index];
        const itemImage = await this.$request.get(item.images[0].url, "IMG");
        const itemImgStack = followingItemStack.addImage(itemImage);
        itemImgStack.imageSize = itemSize;
        itemImgStack.cornerRadius = itemSize.height / 2;
        followingItemStack.addSpacer();
      }

      containerStack.addSpacer();

      const playListStack = containerStack.addStack();

      const listItems = playlists.items.reverse();
      const bottomItems = [
        listItems[0],
        listItems[1],
        listItems[2],
        listItems[3],
      ].filter((item) => !!item);

      playListStack.addSpacer();

      for (const index in bottomItems) {
        const item = bottomItems[index];
        const itemImage = await this.$request.get(item.images[0].url, "IMG");
        const itemImageStack = playListStack.addImage(itemImage);
        itemImageStack.cornerRadius = 6;
        itemImageStack.imageSize = new Size(68, 68);
        playListStack.addSpacer();
      }

      containerStack.addSpacer();
    }
    return widget;
  };

  renderMedium = async (widget) => {
    const { currentlyPlayingTrack, playlists } = this.dataSource;
    if (currentlyPlayingTrack.is_playing) {
      const containerStack = widget.addStack();
      const leftStack = containerStack.addStack();
      leftStack.centerAlignContent();

      const thumbImage = await this.$request.get(
        currentlyPlayingTrack.item.album.images[0].url,
        "IMG"
      );
      leftStack.addSpacer();
      leftStack.size = new Size(140, 140);
      const thumbImgStack = leftStack.addImage(thumbImage);
      thumbImgStack.imageSize = leftStack.size;
      thumbImgStack.cornerRadius = 12;
      leftStack.addSpacer();

      containerStack.addSpacer(20);

      const rightStack = containerStack.addStack();
      rightStack.layoutVertically();
      rightStack.addSpacer();

      const logoStack = rightStack.addStack();

      logoStack.centerAlignContent();
      logoStack.addSpacer();
      const logoImage = await this.$request.get(logo, "IMG");
      const logoImageWidget = logoStack.addImage(logoImage);
      logoImageWidget.imageSize = new Size(20, 20);
      logoImageWidget.centerAlignImage();

      rightStack.addSpacer();

      const nameStack = this.provideText(
        currentlyPlayingTrack.item.name,
        rightStack,
        { size: 16, font: fontFamily }
      );

      nameStack.lineLimit = 1;
      nameStack.minimumScaleFactor = 0.5;

      rightStack.addSpacer();

      const athorStack = this.provideText(
        currentlyPlayingTrack.item.artists[0].name,
        rightStack,
        { size: 12, font: fontFamily }
      );

      athorStack.lineLimit = 1;
      athorStack.minimumScaleFactor = 0.5;

      rightStack.addSpacer();

      const actionsStack = rightStack.addStack();

      const preImage = SFSymbol.named("backward.end.fill").image;
      const playImage = SFSymbol.named("pause.fill").image;
      const nextImage = SFSymbol.named("forward.end.fill").image;

      const iconSize = new Size(20, 20);
      const preStack = actionsStack.addImage(preImage);
      preStack.tintColor = this.widgetColor;
      preStack.imageSize = iconSize;

      actionsStack.addSpacer();

      const playStack = actionsStack.addImage(playImage);
      playStack.tintColor = this.widgetColor;
      playStack.imageSize = iconSize;

      actionsStack.addSpacer();

      const nextStack = actionsStack.addImage(nextImage);
      nextStack.tintColor = this.widgetColor;
      nextStack.imageSize = iconSize;

      rightStack.addSpacer();

      containerStack.addSpacer();
    } else {
      const listItems = playlists.items.reverse();
      const topItem = listItems[0];
      const containerStack = widget.addStack();
      containerStack.layoutVertically();
      const topStack = containerStack.addStack();
      topStack.centerAlignContent();

      const topImg = await this.$request.get(topItem.images[0].url, "IMG");
      const topImageStack = topStack.addImage(topImg);
      topImageStack.cornerRadius = 6;
      topImageStack.imageSize = new Size(50, 50);

      topStack.addSpacer(20);

      this.provideText(topItem.name, topStack, { font: fontFamily, size: 16 });

      topStack.addSpacer();

      const logoImage = await this.$request.get(logo, "IMG");
      const logoImageWidget = topStack.addImage(logoImage);
      logoImageWidget.imageSize = new Size(20, 20);

      containerStack.addSpacer();

      const bottomStack = containerStack.addStack();

      const bottomItems = [
        listItems[1],
        listItems[2],
        listItems[3],
        listItems[4],
      ].filter((item) => !!item);
      for (const index in bottomItems) {
        const item = bottomItems[index];
        const itemImage = await this.$request.get(item.images[0].url, "IMG");
        const itemImageStack = bottomStack.addImage(itemImage);
        itemImageStack.cornerRadius = 6;
        itemImageStack.imageSize = new Size(65, 65);
        if (index !== bottomItems.length - 1) bottomStack.addSpacer();
      }
    }

    return widget;
  };

  renderSmall = async (widget) => {
    widget.setPadding(0, 0, 0, 0);
    const { currentlyPlayingTrack, playlists } = this.dataSource;

    if (currentlyPlayingTrack.is_playing) {
      const iconSize = new Size(20, 20);

      const containerStack = widget.addStack();
      containerStack.setPadding(12, 12, 12, 12);
      containerStack.layoutVertically();

      const thumbImage = await this.$request.get(
        currentlyPlayingTrack.item.album.images[0].url,
        "IMG"
      );
      const opacityImg = await this.shadowImage(thumbImage, "#000", 0.3);
      containerStack.backgroundImage = opacityImg;

      const topStack = containerStack.addStack();
      topStack.centerAlignContent();

      const music = SFSymbol.named("timer.circle.fill").image;
      const musicStack = topStack.addImage(music);
      musicStack.tintColor = Color.white();
      musicStack.imageSize = new Size(14, 14);

      topStack.addSpacer(10);

      this.provideText(
        convertMillisecondsToHMS(currentlyPlayingTrack.item.duration_ms),
        topStack,
        { size: 12, font: fontFamily, color: Color.white() }
      );

      topStack.addSpacer();
      const logoStack = topStack.addStack();
      logoStack.centerAlignContent();

      logoStack.addSpacer();
      const logoImage = await this.$request.get(logo, "IMG");
      const logoImageWidget = logoStack.addImage(logoImage);
      logoImageWidget.imageSize = new Size(20, 20);
      logoImageWidget.centerAlignImage();

      containerStack.addSpacer();

      const nameStack = this.provideText(
        currentlyPlayingTrack.item.name,
        containerStack,
        { size: 16, font: fontFamily, color: Color.white() }
      );

      nameStack.lineLimit = 2;
      containerStack.addSpacer();

      const athorStack = this.provideText(
        currentlyPlayingTrack.item.artists[0].name,
        containerStack,
        { size: 12, font: fontFamily, color: Color.white() }
      );

      athorStack.lineLimit = 1;
      athorStack.minimumScaleFactor = 0.5;

      containerStack.addSpacer();

      const actionsStack = containerStack.addStack();

      const preImage = SFSymbol.named("backward.end.fill").image;
      const playImage = SFSymbol.named("pause.fill").image;
      const nextImage = SFSymbol.named("forward.end.fill").image;

      const preStack = actionsStack.addImage(preImage);
      preStack.tintColor = Color.white();
      preStack.imageSize = iconSize;

      actionsStack.addSpacer();

      const playStack = actionsStack.addImage(playImage);
      playStack.tintColor = Color.white();
      playStack.imageSize = iconSize;

      actionsStack.addSpacer();

      const nextStack = actionsStack.addImage(nextImage);
      nextStack.tintColor = Color.white();
      nextStack.imageSize = iconSize;
    } else {
      const listItems = playlists.items.reverse();
      const topItem = listItems[0];

      const containerStack = widget.addStack();
      containerStack.setPadding(12, 12, 12, 12);
      containerStack.layoutVertically();

      const thumbImage = await this.$request.get(topItem.images[0].url, "IMG");
      const opacityImg = await this.shadowImage(thumbImage, "#000", 0.3);
      containerStack.backgroundImage = opacityImg;

      const topStack = containerStack.addStack();
      topStack.addSpacer();
      const logoImage = await this.$request.get(logo, "IMG");
      const logoImageWidget = topStack.addImage(logoImage);
      logoImageWidget.imageSize = new Size(20, 20);

      containerStack.addSpacer();

      this.provideText(topItem.name, containerStack, {
        font: fontFamily,
        size: 16,
        color: Color.white(),
      });

      containerStack.addSpacer();

      const descStack = this.provideText(topItem.description, containerStack, {
        font: fontFamily,
        size: 12,
        color: Color.white(),
      });

      descStack.lineLimit = 2;
      descStack.minimumScaleFactor = 0.5;

      containerStack.addSpacer();

      const actionsStack = containerStack.addStack();
      actionsStack.addSpacer();
      actionsStack.centerAlignContent();

      const heartImage = SFSymbol.named("heart.circle.fill").image;
      const heartStack = actionsStack.addImage(heartImage);
      heartStack.tintColor = Color.white();
      heartStack.imageSize = new Size(20, 20);

      actionsStack.addSpacer(5);

      this.provideText(`${topItem.tracks.total}`, actionsStack, {
        size: 14,
        font: fontFamily,
        color: Color.white(),
      });
    }

    return widget;
  };

  renderAccessoryInline = async (widget) => {
    return widget;
  };

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    widget.useDefaultPadding();

    await this.getWidgetBackgroundImage(widget);
    if (this.widgetFamily === "small") await this.renderSmall(widget);
    if (this.widgetFamily === "medium") await this.renderMedium(widget);
    if (this.widgetFamily === "large") await this.renderLarge(widget);
    if (this.widgetFamily == "accessoryInline")
      await this.renderAccessoryInline(widget);

    return widget;
  }
}

// @组件代码结束
await Runing(Widget, "", false); //远程开发环境
