// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: mobile-alt;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule;
const { DmYY, Runing } = require('./DmYY');

// @组件代码开始
class Widget extends DmYY {
  constructor(arg) {
    super(arg);
    this.name = '桌面联系人';
    this.en = 'ContactTable';
    this.userName = arg || 'Ya';
    this.Run();
  }

  today = '';
  useBoxJS = false;
  dataSource = {};
  phoneNumber = {};
  size1 = new Size(15, 15);
  size2 = new Size(30, 30);

  init = async () => {
    try {
      const cardAll = await ContactsContainer.all();
      const data = await Contact.all(cardAll);
      if (!this.userName) {
        this.dataSource = data[0];
      } else {
        this.dataSource = data.find((item) => {
          return (
            item.familyName === this.userName ||
            item.givenName === this.userName ||
            item.nickname === this.userName ||
            `${item.familyName}${item.givenName}` === this.userName
          );
        });
      }
      if (!this.dataSource)
        return this.notify(this.name, '未找到通讯录相关联系人，请重新设置');
      this.userName = `${this.dataSource.familyName}${this.dataSource.givenName}`;
      const phoneNumbers = this.dataSource.phoneNumbers;
      if (phoneNumbers.length) {
        this.phoneNumber = phoneNumbers[0];
        this.phoneNumber.value = this.phoneNumber.value.replaceAll(' ', '');
      }
    } catch (e) {
      console.log(e);
    }
  };

  setAvatar = (w) => {
    const stackBody = w.addStack();
    const stackLeft = stackBody.addStack();
    stackLeft.setPadding(10, 10, 10, 0);
    stackLeft.layoutVertically();
    stackLeft.addSpacer();
    const stackAvatar = stackLeft.addStack();
    stackAvatar.centerAlignContent();
    stackAvatar.size = new Size(80, 80);
    stackAvatar.borderWidth = 7;
    stackAvatar.borderColor = new Color('#222', 0.7);
    stackAvatar.cornerRadius = 40;
    if (this.dataSource.image) {
      const imgAvatar = stackAvatar.addImage(this.dataSource.image);
      imgAvatar.imageSize = new Size(80, 80);
    } else {
      let textFormat = this.textFormat.title;
      textFormat.color = this.widgetColor;
      textFormat.size = 42;
      this.provideText(
        this.userName.substr(0, 1) || '',
        stackAvatar,
        textFormat
      );
    }
    stackLeft.addSpacer();
    stackBody.addSpacer(5);
    return stackBody;
  };

  setContentCenter = (stackBody) => {
    const stackCenter = stackBody.addStack();
    stackCenter.setPadding(10, 0, 10, 10);
    stackCenter.layoutVertically();
    stackCenter.addSpacer();
    const stackUsername = stackCenter.addStack();
    stackUsername.centerAlignContent();
    stackCenter.addSpacer(15);
    const stackPhoneNumber = stackCenter.addStack();
    stackPhoneNumber.centerAlignContent();
    stackCenter.addSpacer(15);
    const stackNote = stackCenter.addStack();
    stackNote.centerAlignContent();
    stackCenter.addSpacer();

    let textFormat = this.textFormat.defaultText;
    textFormat.color = this.widgetColor;
    textFormat.size = 18;
    const phoneNumber = this.phoneNumber.value || '';

    const iconPerson = SFSymbol.named('person');
    const imgPerson = stackUsername.addImage(iconPerson.image);
    imgPerson.tintColor = this.widgetColor;
    imgPerson.imageSize = this.size1;
    stackUsername.addSpacer(5);

    const iconPhone = SFSymbol.named('iphone');
    const imgIphone = stackPhoneNumber.addImage(iconPhone.image);
    imgIphone.tintColor = this.widgetColor;
    imgIphone.imageSize = this.size1;
    stackPhoneNumber.addSpacer(5);

    const iconNote = SFSymbol.named('envelope');
    const imgNote = stackNote.addImage(iconNote.image);
    imgNote.tintColor = this.widgetColor;
    imgNote.imageSize = this.size1;
    stackNote.addSpacer(5);

    const data = this.dataSource.emailAddresses;
    const email = data.length ? data[0] : {};
    this.provideText(this.userName || '', stackUsername, textFormat);
    this.provideText(phoneNumber || '', stackPhoneNumber, textFormat);
    const mailTextItem = this.provideText(
      email.value || '',
      stackNote,
      textFormat
    );
    mailTextItem.lineLimit = 1;

    stackBody.addSpacer();
    return stackBody;
  };

  stepActionRight = (stackBody) => {
    const stackRight = stackBody.addStack();
    stackRight.setPadding(10, 20, 10, 20);
    stackRight.layoutVertically();
    stackRight.backgroundColor = this.widgetOpacityColor;

    stackRight.addSpacer();
    const stackCallPhone = stackRight.addStack();
    stackRight.addSpacer();
    const stackSendMessage = stackRight.addStack();
    stackRight.addSpacer();
    const stackDetail = stackRight.addStack();
    stackRight.addSpacer();

    const phone = this.phoneNumber.value || '';
    const data = this.dataSource.emailAddresses;
    const email = data.length ? data[0] : {};

    stackCallPhone.url = `tel:${phone}`;
    stackSendMessage.url = `sms:${phone}`;
    stackDetail.url = `mailto:${email.value || ''}`;

    const iconVideo = SFSymbol.named('video');
    const imgVideo = stackCallPhone.addImage(iconVideo.image);
    imgVideo.tintColor = this.backGroundColor;
    imgVideo.imageSize = this.size2;

    const iconMessage = SFSymbol.named('message');
    const imgMessage = stackSendMessage.addImage(iconMessage.image);
    imgMessage.tintColor = this.backGroundColor;
    imgMessage.imageSize = this.size2;

    const iconEnvelope = SFSymbol.named('envelope.open');
    const imgEnvelope = stackDetail.addImage(iconEnvelope.image);
    imgEnvelope.tintColor = this.backGroundColor;
    imgEnvelope.imageSize = this.size2;

    return stackBody;
  };

  renderSmall = (w) => {
    this.setContentCenter(stackBody);
    this.stepActionRight(stackBody);
    return w;
  };

  renderLarge = (w) => {
    const stackBody = this.setAvatar(w);
    this.setContentCenter(stackBody);
    this.stepActionRight(stackBody);
    return w;
  };

  renderMedium = (w) => {
    const stackBody = this.setAvatar(w);
    this.setContentCenter(stackBody);
    this.stepActionRight(stackBody);
    return w;
  };

  Run() {
    if (config.runsInApp) {
      this.registerAction({
        icon: { name: 'phone', color: '#722ed1' },
        type: 'input',
        title: '右侧透明',
        desc: '若不需要右侧背景设置透明度 0 即可',
        placeholder: '透明度 0~1',
        val: 'rightOpacity',
      });

      this.registerAction('基础设置', this.setWidgetConfig);
    }
    const light = new Color(
      this.settings.lightColor,
      parseInt(this.settings.rightOpacity || 1)
    );
    const dark = new Color(
      this.settings.darkColor,
      parseInt(this.settings.rightOpacity || 1)
    );
    this.widgetOpacityColor = Color.dynamic(light, dark);
  }

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    await this.init();
    const widget = new ListWidget();
    widget.setPadding(0, 0, 0, 0);
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
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, args.widgetParameter, false); //远程开发环境
