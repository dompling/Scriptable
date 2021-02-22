// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: birthday-cake;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");
const { Calendar } = require("./Calendar");
const $ = new Calendar();

class Widget extends DmYY {
	constructor(arg) {
		super(arg);
		this.name = "破壳日";
		this.en = "birthday";
		this.logo =
		 "https://raw.githubusercontent.com/Orz-3/mini/master/Color/birthday.png";
		this.LEFT_IMG_KEY = this.FILE_MGR_LOCAL.joinPath(
		 this.FILE_MGR_LOCAL.documentsDirectory(),
		 `left_image_${this.SETTING_KEY}.jpg`,
		);
		this.defaultData = { ...this.defaultData, ...this.settings[this.en] };
		if (config.runsInApp) {
			this.registerAction("基础设置", this.setWidgetConfig);
			this.registerAction("生日配置", this.setWidgetInitConfig);
			this.registerAction("头像设置", this.setLeftWidgetImage);
			this.registerAction("代理缓存", this.setWidgetBoxJSConfig);
		}
	}

	defaultData = {
		username: "", // 姓名
		time: "", // 生日日期
		nongli: "", // 农历生日
		eday: "", //相识
		isLeapMonth: false, //如果是农历闰月第四个参数赋值true即可
	};

	contentText = {};

	init = async () => {
		try {
			this.getCalendarData();
		} catch (e) {
			console.log(e);
		}
	};

	getEdayNumber = (date) => {
		var initDay = date.split("-");
		var obj = {
			cYear: parseInt(initDay[0]),
			cMonth: parseInt(initDay[1]),
			cDay: parseInt(initDay[2]),
		};
		return Math.abs(this.$.daysBetween(obj));
	};

	getCalendarData = () => {
		const { time, nongli, isLeapMonth, eday } = this.defaultData;
		const _data = time.split("-");
		const opt = {
			year: parseInt(_data[0]),
			month: parseInt(_data[1]),
			day: parseInt(_data[2]),
			nongli,
			isLeapMonth,
		};

		const response = {};
		response.birthdayText = this.$.birthday(opt);
		response.nextBirthday = response.birthdayText[0];

		const solarData =
		 nongli === "true"
			? this.$.lunar2solar(opt.year, opt.month, opt.day, isLeapMonth)
			: this.$.solar2lunar(opt.year, opt.month, opt.day);
		response.gregorian = solarData;
		response.animal = `${this.$.getAnimalZodiacToEmoji(solarData.Animal)}-${
		 solarData.Animal
		}`;
		response.astro = `${this.$.getAstroToEmoji(solarData.astro)}-${solarData.astro}`;
		if (this.$.verifyTime(eday)) {
			response.meetDay = this.getEdayNumber(eday);
		}
		this.contentText = response;
	};

	setRightCell = (text, rowCell) => {
		const subContent = rowCell.addText(text);
		subContent.font = Font.boldSystemFont(14);
		subContent.textColor = this.widgetColor;
		subContent.lineLimit = 1;
		rowCell.addSpacer(5);
	};

	setLeftView = (w) => {
		const leftImg = this.getLeftImage();
		const left = w.addStack();
		left.size = new Size(110, 110);
		left.cornerRadius = 5;
		left.borderWidth = 2;
		left.borderColor = this.widgetColor;
		if (leftImg) {
			const widgetImg = left.addImage(leftImg);
			widgetImg.imageSize = new Size(110, 110);
			widgetImg.applyFillingContentMode();
			widgetImg.cornerRadius = 5;
		}
		return w;
	};

	setRightView = (right) => {
		const {
			animal,
			astro,
			gregorian,
			nextBirthday,
			meetDay,
			birthdayText,
		} = this.contentText;
		const { IMonthCn, IDayCn } = gregorian;
		right.layoutVertically();
		this.setRightCell(`🐽相:${animal}`, right); // 属相
		this.setRightCell(`🌠座:${astro}`, right); // 属相
		if (meetDay) {
			this.setRightCell(`💖遇:${meetDay} 天`, right);
		}
		const _birth = `🎂生:${nextBirthday.cYear}-${nextBirthday.cMonth}-${nextBirthday.cDay} (${birthdayText[1]}天)`;
		this.setRightCell(_birth, right);
		this.setRightCell(`📆农:${IMonthCn}${IDayCn}`, right);
		return right;
	};

	fetch = async () => {
		const response = await this.$request.get(
		 "https://api.uomg.com/api/rand.qinghua?format=json",
		);
		return response.content;
	};

	renderSmall = async (w) => {
		this.setRightView(w.addStack());
		return w;
	};

	renderLarge = async (w) => {
		w.addSpacer(20);
		const body = w.addStack();
		const left = body.addStack();
		this.setLeftView(left);
		body.addSpacer(20);
		const right = body.addStack();
		this.setRightView(right);

		w.addSpacer(20);
		const footer = w.addStack();
		const text = await this.fetch();
		const subContent = footer.addText(text);
		subContent.font = Font.boldSystemFont(16);
		subContent.textColor = this.widgetColor;
		w.addSpacer();
		return w;
	};

	renderMedium = async (w) => {
		const body = w.addStack();
		const left = body.addStack();
		this.setLeftView(left);
		body.addSpacer();
		const right = body.addStack();
		this.setRightView(right);
		body.addSpacer();
		w.addSpacer();
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
		const header = widget.addStack();
		if (this.widgetFamily !== "small") {
			await this.renderMoreHeader(header);
		} else {
			await this.renderHeader(header, this.logo, this.name, this.widgetColor);
		}
		widget.addSpacer(10);
		if (this.widgetFamily === "medium") {
			await this.renderMedium(widget);
		} else if (this.widgetFamily === "large") {
			await this.renderLarge(widget);
		} else {
			await this.renderSmall(widget);
		}
		return widget;
	}

	renderMoreHeader = async (header) => {
		header.centerAlignContent();
		await this.renderHeader(header, this.logo, this.name, this.widgetColor);
		header.addSpacer();
		const headerMore = header.addStack();
		headerMore.setPadding(1, 10, 1, 10);
		headerMore.cornerRadius = 10;
		headerMore.backgroundColor = new Color("#fff", 0.5);
		const textItem = headerMore.addText(this.defaultData.username);
		textItem.font = Font.boldSystemFont(12);
		textItem.textColor = this.widgetColor;
		textItem.lineLimit = 1;
		textItem.rightAlignText();
		return header;
	};

	/**
	 * 获取当前插件是否有自定义背景图片
	 * @reutrn img | false
	 */
	getLeftImage() {
		let result = null;
		if (this.FILE_MGR_LOCAL.fileExists(this.LEFT_IMG_KEY)) {
			result = Image.fromFile(this.LEFT_IMG_KEY);
		}
		return result;
	}

	/**
	 * 设置当前组件的背景图片
	 * @param {image} img
	 */
	setLeftImage(img, notify = true) {
		if (!img) {
			// 移除背景
			if (this.FILE_MGR_LOCAL.fileExists(this.LEFT_IMG_KEY)) {
				this.FILE_MGR_LOCAL.remove(this.LEFT_IMG_KEY);
			}
			if (notify) this.notify("移除成功", "小组件图片已移除，稍后刷新生效");
		} else {
			// 设置背景
			// 全部设置一遍，
			this.FILE_MGR_LOCAL.writeImage(this.LEFT_IMG_KEY, img);
			if (notify) this.notify("设置成功", "小组件图片已设置！稍后刷新生效");
		}
	}

	setLeftWidgetImage = async () => {
		const alert = new Alert();
		alert.title = "设置左侧图";
		alert.message = "显示左侧图片";
		alert.addAction("设置新图");
		alert.addAction("清空图片");
		alert.addCancelAction("取消");
		const actions = [
			async () => {
				const backImage = await this.chooseImg();
				if (!await this.verifyImage(backImage)) return;
				await this.setLeftImage(backImage, true);
			},
			() => {
				this.setLeftImage(false, true);
			},
		];
		const id = await alert.presentAlert();
		if (id === -1) return;
		actions[id] && actions[id].call(this);
	};

	setWidgetInitConfig = async () => {
		const a = new Alert();
		a.title = "🐣破壳日配置";
		a.message = "配置破壳日的基础信息";
		a.addTextField("昵称", this.defaultData.username);
		a.addTextField("生日/ 年-月-日", this.defaultData.time);
		a.addTextField("农历/ true | false", `${this.defaultData.nongli || ""}`);
		a.addTextField("相识/ 年-月-日", this.defaultData.eday);
		a.addAction("确定");
		a.addCancelAction("取消");
		const id = await a.presentAlert();
		if (id === -1) return;
		this.defaultData.username = a.textFieldValue(0);
		this.defaultData.time = a.textFieldValue(1);
		this.defaultData.nongli = a.textFieldValue(2) === "true";
		this.defaultData.eday = a.textFieldValue(3);
		// 保存到本地
		this.settings[this.en] = this.defaultData;
		this.saveSettings();
	};

	setWidgetBoxJSConfig = async () => {
		try {
			const datas = await this.getCache();
			Object.keys(this.defaultData).forEach((key) => {
				this.defaultData[key] = datas[`@${this.en}.${key}`];
			});
			this.settings[this.en] = this.defaultData;
			this.saveSettings();
		} catch (e) {
			this.notify(this.name, "", "BoxJS 数据读取失败，请点击通知查看教程", "https://chavyleung.gitbook.io/boxjs/awesome/videos");
		}
	};
}

Runing(Widget, "", false, { $ });
