// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: paper-plane;

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

// @组件代码开始
class Widget extends DmYY {
	constructor(arg) {
		super(arg);
		this.name = "中国移动";
		this.en = "ChinaMobile";
		this.Run();
	}

	getfee = "";
	autologin = "";
	fgCircleColor = new Color('#dddef3');

	textColor1 = new Color("#333");
	textColor2 = new Color("#666");
	textColor3 = new Color("#999");


	circleColor1 = new Color("#ffbb73");
	circleColor2 = new Color("#ff0029");
	circleColor3 = new Color("#00b800");
	circleColor4 = new Color("#8376f9");
	iconColor = new Color("#827af1");


	format = (str) => {
		return parseInt(str) > 10 ? str : `0${str}`;
	};

	date = new Date();
	arrUpdateTime = [
		this.format(this.date.getMonth() + 1),
		this.format(this.date.getDate()),
		this.format(this.date.getHours()),
		this.format(this.date.getMinutes()),
	];

	phoneBill = {
		percent: 180,
		label: "话费剩余",
		count: 226.05,
		unit: "元",
		icon: "yensign.circle",
		circleColor: this.circleColor1,
	};

	flow = {
		percent: 180,
		label: "流量剩余",
		count: 226.05,
		unit: "M",
		icon: "waveform.path.badge.minus",
		circleColor: this.circleColor2,
	};

	voice = {
		percent: 180,
		label: "语音剩余",
		count: 20,
		unit: "分钟",
		icon: "mic",
		circleColor: this.circleColor3,
	};

	updateTime = {
		percent: 180,
		label: "更新时间",
		count: `${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`,
		unit: "",
		icon: "clock",
		circleColor: this.circleColor4,
	};

	canvSize = 282;
	canvWidth = 20; // circle thickness
	canvRadius = 160; // circle radius
	dayRadiusOffset = 60;
	canvTextSize = 40;


	init = async () => {
		try {
		} catch (e) {
			console.log(e);
		}
	};

	makeCanvas() {
		const canvas = new DrawContext();
		canvas.opaque = false;
		canvas.respectScreenScale = true;
		canvas.size = new Size(this.canvSize, this.canvSize);
		return canvas;
	}


	makeCircle(canvas, radiusOffset, degree, color) {
		let ctr = new Point(this.canvSize / 2, this.canvSize / 2);
		// Outer circle
		const bgx = ctr.x - (this.canvRadius - radiusOffset);
		const bgy = ctr.y - (this.canvRadius - radiusOffset);
		const bgd = 2 * (this.canvRadius - radiusOffset);
		const bgr = new Rect(
		 bgx,
		 bgy,
		 bgd,
		 bgd,
		);
		canvas.setStrokeColor(this.fgCircleColor);
		canvas.setLineWidth(this.canvWidth);
		canvas.strokeEllipse(bgr);
		// Inner circle
		canvas.setFillColor(color);
		for (let t = 0; t < degree; t++) {
			const rect_x = ctr.x + (this.canvRadius - radiusOffset) * this.sinDeg(t) - this.canvWidth / 2;
			const rect_y = ctr.y - (this.canvRadius - radiusOffset) * this.cosDeg(t) - this.canvWidth / 2;
			const rect_r = new Rect(
			 rect_x,
			 rect_y,
			 this.canvWidth,
			 this.canvWidth,
			);
			canvas.fillEllipse(rect_r);
		}
	}

	drawText(txt, canvas, txtOffset, fontSize) {
		const txtRect = new Rect(
		 this.canvTextSize / 2 - 20,
		 txtOffset - this.canvTextSize / 2,
		 this.canvSize,
		 this.canvTextSize,
		);
		canvas.setTextColor(this.widgetColor);
		canvas.setFont(Font.boldSystemFont(fontSize));
		canvas.setTextAlignedCenter();
		canvas.drawTextInRect(`${txt}`, txtRect);
	}

	drawPointText(txt, canvas, txtPoint, fontSize) {
		canvas.setTextColor(this.widgetColor);
		canvas.setFont(Font.boldSystemFont(fontSize));
		canvas.drawText(txt, txtPoint);
	}

	sinDeg(deg) {
		return Math.sin((deg * Math.PI) / 180);
	}

	cosDeg(deg) {
		return Math.cos((deg * Math.PI) / 180);
	}

	setCircleText = (stack, data) => {
		const stackCircle = stack.addStack();
		const canvas = this.makeCanvas();
		stackCircle.size = new Size(70, 70);
		this.makeCircle(canvas, this.dayRadiusOffset, 200, data.circleColor);


		this.drawText(data.percent, canvas, 170, 42);
		this.drawPointText(`%`, canvas, new Point(190, 150), 25);
		stackCircle.backgroundImage = canvas.getImage();

		stackCircle.setPadding(20, 0, 0, 0);
		stackCircle.addSpacer();
		const icon = SFSymbol.named(data.icon);
		const imageIcon = stackCircle.addImage(icon.image);
		imageIcon.tintColor = this.iconColor;
		imageIcon.imageSize = new Size(15, 15);
		// canvas.drawImageInRect(icon.image, new Rect(110, 80, 60, 60));
		stackCircle.addSpacer();

		stack.addSpacer(5);
		const stackDesc = stack.addStack();
		stackDesc.layoutVertically();
		stackDesc.addSpacer();
		const textLabel = this.textFormat.defaultText;
		textLabel.size = 12;
		textLabel.color = this.textColor2;
		this.provideText(data.label, stackDesc, textLabel);
		stackDesc.addSpacer(10);
		const stackDescFooter = stackDesc.addStack();
		stackDescFooter.size = new Size(70, 20);
		stackDescFooter.centerAlignContent();
		const textCount = this.textFormat.title;
		textCount.size = 16;
		textCount.color = this.textColor1;
		this.provideText(`${data.count}`, stackDescFooter, textCount);
		stackDescFooter.addSpacer(2);
		this.provideText(data.unit, stackDescFooter, textLabel);
		stackDesc.addSpacer();
	};


	renderSmall = async (w) => {
		w.setPadding(5, 5, 5, 5);
		const stackBody = w.addStack();
		stackBody.layoutVertically();
		const stackTop = stackBody.addStack();
		this.setCircleText(stackTop, this.phoneBill);
		const stackBottom = stackBody.addStack();
		this.setCircleText(stackBottom, this.flow);
		const stackFooter = stackBody.addStack();

		stackFooter.addSpacer();
		const text = this.textFormat.defaultText;
		text.color = new Color("#aaa");
		this.provideText(`更新时间：${this.arrUpdateTime[0]}-${this.arrUpdateTime[1]} ${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`, stackFooter, text);
		return w;
	};

	renderMedium = async (w) => {
		const stackBody = w.addStack();
		stackBody.layoutVertically();
		const stackTop = stackBody.addStack();
		this.setCircleText(stackTop, this.phoneBill);
		this.setCircleText(stackTop, this.flow);
		const stackBottom = stackBody.addStack();
		this.setCircleText(stackBottom, this.voice);
		this.setCircleText(stackBottom, this.updateTime);
		return w;
	};

	renderLarge = async (w) => {
		return await this.renderMedium(w);
	};

	Run() {
		if (config.runsInApp) {
			this.registerAction("账号设置", async () => {
				await this.setAlertInput(`${this.name}账号`, "读取 BoxJS 缓存信息", {
					autologin: "chavy_autologin_cmcc",
					getfee: "chavy_getfee_cmcc",
				});
			});
			this.registerAction("代理缓存", async () => {
				await this.setCacheBoxJSData({
					autologin: "chavy_autologin_cmcc",
					getfee: "chavy_getfee_cmcc",
				});
			});
			this.registerAction("基础设置", this.setWidgetConfig);
		}
		this.autologin = this.settings.autologin;
		if (this.settings.getfee) {
			this.options = JSON.parse(this.settings.getfee);
		}

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
		if (this.widgetFamily === "medium") {
			return await this.renderMedium(widget);
		} else if (this.widgetFamily === "large") {
			return await this.renderLarge(widget);
		} else {
			return await this.renderSmall(widget);
		}
	}
}

// @组件代码结束
// await Runing(Widget, "", false); // 正式环境
await Runing(Widget, args.widgetParameter, false); //远程开发环境
