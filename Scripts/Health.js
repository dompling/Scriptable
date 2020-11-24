// letiables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: user-plus;

/**
 * https://www.icloud.com/shortcuts/2be502d8e9694068ae982cd3a70dea89：快捷指令
 * 组件必须配合快捷指令使用，运行快捷指令时，保存的路径是 Scriptable 下
 */


// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能

if (typeof require === "undefined") require = importModule;
const { DmYY, Runing } = require("./DmYY");

// @组件代码开始
class Widget extends DmYY {
	constructor(arg) {
		super(arg);
		this.name = "健康行走步数";
		this.en = "healthCenter";
		this.Run();
	}

	widgetFamily = "medium";
	maxYearDist = 1500;
	maxMonthDist = 10;
	color1 = Color.orange();
	lineColor = new Color("#48484b");
	useBoxJS = false;

	running = {};
	stepsCount = 0;

	init = async () => {
		try {
			await this.getData();
		} catch (e) {
			console.log(e);
		}
	};

	numberFormat(value) {
		try {
			const param = {};
			let k = 10000;
			const size = ["", '万', "亿", "万亿"];
			let i;
			if (value < k) {
				param.value = value;
				param.unit = "";
			} else {
				i = Math.floor(Math.log(value) / Math.log(k));
				param.value = ((value / Math.pow(k, i))).toFixed(2);
				param.unit = size[i];
			}
			return param;
		} catch (e) {
			console.log(e);
		}
	}


	getData = async () => {
		try {
			const fileICloud = FileManager.iCloud();
			const dir = fileICloud.documentsDirectory();
			const path = fileICloud.joinPath(dir, "health.txt");
			const response = fileICloud.readString(path);
			let data = JSON.parse(response);
			data.forEach((item) => {
				if (item.health_type === "Walking + Running Distance") {
					item.samples.forEach((run, index) => {
						if (item.samples.length - 1 === index) return;
						const date = run.date;
						if (!this.running[date]) this.running[date] = 0;
						this.running[date] += parseFloat(run.value);
					});
				}
				if (item.health_type === "Steps") {
					item.samples.forEach((step) => {
						this.stepsCount += parseInt(step.value);
					});
				}
			});
			Object.keys(this.running).forEach((key) => {
				this.running[key] = Math.floor(this.running[key] * 100) / 100;
			});
		} catch (e) {
			this.notify(
			 this.name,
			 "健康数据读取失败，请点击使用健康数据快捷指令更新步数",
			 "https://www.icloud.com/shortcuts/beb65db5ea0a474abe7ff080410b9ddf",
			);
			return false;
		}
	};

	/*------------------------------------------------------------------------------
50 km Linien
------------------------------------------------------------------------------*/
	createLines(stack) {
		let canvas, path;
		// 50km Linien
		canvas = new DrawContext();
		canvas.size = new Size(292, 82);
		canvas.opaque = false;
		canvas.respectScreenScale = true;
		canvas.setFillColor(this.lineColor);
		path = new Path();
		path.addRect(new Rect(0, 0, 292, 1));
		canvas.addPath(path);
		canvas.fillPath();
		path = new Path();
		path.addRect(new Rect(0, 15, 292, 1));
		canvas.addPath(path);
		canvas.fillPath();
		path = new Path();
		path.addRect(new Rect(0, 30, 292, 1));
		canvas.addPath(path);
		canvas.fillPath();
		path = new Path();
		path.addRect(new Rect(0, 45, 292, 1));
		canvas.addPath(path);
		canvas.fillPath();
		stack.backgroundImage = canvas.getImage();
	}

	async buildWidget(widget) {
		// // Stacks definieren
		let stackYear = widget.addStack();
		widget.addSpacer();
		let stackMonth = widget.addStack();
		// Stacks für Symbol und Jahresauswertung aufbereiten
		let stackYear1 = stackYear.addStack();
		stackYear.addSpacer(10);
		let stackYear2 = stackYear.addStack();
		let sym = SFSymbol.named("figure.walk");
		let img = stackYear1.addImage(sym.image);
		img.tintColor = this.color1;
		img.imageSize = new Size(25, 25);
		stackYear2.layoutVertically();
		let stackYearCurr = stackYear2.addStack();
		stackYear2.addSpacer(10);
		let stackThemItem = stackYear2.addStack();

		let data = 0;
		const runningData = Object.keys(this.running);
		if (runningData.length > 12) runningData.splice(0, runningData.length - 12);
		runningData.forEach((date) => {
			const [_, month, day] = date.split("-");
			const stackDay = stackMonth.addStack();
			const value = this.running[date];
			this.createProgressMonth(stackDay, `${month}.${day}`, value);
			stackMonth.addSpacer(4);
			data += value;
		});
		this.createProgressYear(stackYearCurr, "运动", data, this.color1);
		stackYear2.addSpacer(10);
		this.createProgressSteps(stackThemItem, "步数", this.stepsCount, this.color1);

		// 50km Linie
		this.createLines(stackMonth);
		return widget;
	}

	createProgressYear(stack, year, dist, color) {
		let stackDesc, stackPBar, stackDist, canvas, path, txt, img;

		// Initialisierung
		stack.centerAlignContent();

		// Stacks definieren
		stackDesc = stack.addStack();
		stackPBar = stack.addStack();
		stackDist = stack.addStack();

		// Beschreibung
		stackDesc.size = new Size(30, 0);
		txt = stackDesc.addText(year);
		txt.font = Font.systemFont(7);
		txt.textColor = this.widgetColor;
		stackDesc.addSpacer();

		// Progress-Bar
		canvas = new DrawContext();
		canvas.size = new Size(180, 7);
		canvas.opaque = false;
		canvas.respectScreenScale = true;
		canvas.setFillColor(new Color("#48484b"));
		path = new Path();
		path.addRoundedRect(new Rect(0, 0, 180, 5), 3, 2);
		canvas.addPath(path);
		canvas.fillPath();
		canvas.setFillColor(color);
		path = new Path();
		path.addRoundedRect(new Rect(0, 0, (180 * dist) / 200, 5), 3, 2);
		canvas.addPath(path);
		canvas.fillPath();
		img = stackPBar.addImage(canvas.getImage());
		img.imageSize = new Size(180, 7);

		// Distanz
		stackDist.addSpacer(10);
		txt = stackDist.addText(Math.round(dist).toString() + " km");
		txt.font = Font.systemFont(7);
		txt.textColor = this.widgetColor;
	}

	createProgressSteps(stack, year, dist, color) {
		let stackDesc, stackPBar, stackDist, canvas, path, txt, img;

		// Initialisierung
		stack.centerAlignContent();

		// Stacks definieren
		stackDesc = stack.addStack();
		stackPBar = stack.addStack();
		stackDist = stack.addStack();

		// Beschreibung
		stackDesc.size = new Size(30, 0);
		txt = stackDesc.addText(year);
		txt.font = Font.systemFont(7);
		txt.textColor = this.widgetColor;
		stackDesc.addSpacer();

		// Progress-Bar
		canvas = new DrawContext();
		canvas.size = new Size(180, 7);
		canvas.opaque = false;
		canvas.respectScreenScale = true;
		canvas.setFillColor(new Color("#48484b"));
		path = new Path();
		path.addRoundedRect(new Rect(0, 0, 180, 5), 3, 2);
		canvas.addPath(path);
		canvas.fillPath();
		canvas.setFillColor(color);
		path = new Path();
		path.addRoundedRect(new Rect(0, 0, (18 * dist) / 20000, 5), 3, 2);
		canvas.addPath(path);
		canvas.fillPath();
		img = stackPBar.addImage(canvas.getImage());
		img.imageSize = new Size(180, 7);

		// Distanz
		stackDist.addSpacer(10);
		const numberText = this.numberFormat(dist);
		txt = stackDist.addText(numberText.value + ` ${numberText.unit}步`);
		txt.font = Font.systemFont(7);
		txt.textColor = this.widgetColor;
	}

	createTemplateItem(stack, icon, desc) {
		let sym = SFSymbol.named(icon);
		let img = stack.addImage(sym.image);
		img.tintColor = this.color1;
		img.imageSize = new Size(10, 10);
		stack.addSpacer(5);

		const txt = stack.addText(desc);
		txt.font = Font.systemFont(7);
		txt.textColor = this.widgetColor;
	}

	/*------------------------------------------------------------------------------
Balkenanzeige für Monatsauswertung aufbereiten
------------------------------------------------------------------------------*/
	createProgressMonth(stack, month, dist3) {
		let stackDist, stackPBar, stackDesc, canvas, path, s, img, txt;

		// Stacks definieren
		stack.layoutVertically();
		stackPBar = stack.addStack();
		stack.addSpacer(4);
		stackDesc = stack.addStack();
		stackDist = stack.addStack();

		// Progress-Bar
		canvas = new DrawContext();
		canvas.size = new Size(17, 60);
		canvas.opaque = false;
		canvas.respectScreenScale = true;

		canvas.setFillColor(this.color1);
		path = new Path();
		s = (60 * dist3) / this.maxMonthDist;
		path.addRect(new Rect(6, 60 - s, 8, s));
		canvas.addPath(path);
		canvas.fillPath();
		img = stackPBar.addImage(canvas.getImage());
		img.imageSize = new Size(17, 60);

		// Monat
		stackDesc.size = new Size(20, 10);
		txt = stackDesc.addText(month);
		txt.font = Font.systemFont(7);
		txt.textColor = this.widgetColor;

		// Distanz aktuelle Jahr
		stackDist.size = new Size(17, 8);
		txt = stackDist.addText(Math.round(dist3).toString());
		txt.font = Font.systemFont(6);
		txt.textColor = this.widgetColor;
	}


	/**
	 * 渲染函数，函数名固定
	 * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
	 */
	async render() {
		await this.init();
		const widget = new ListWidget();
		await this.getWidgetBackgroundImage(widget);
		await this.buildWidget(widget);
		await widget.presentMedium();
		return widget;
	}

	Run = () => {
		if (config.runsInApp) {
			this.registerAction("皮肤颜色", this.setWidgetSkin);
			this.registerAction("刻度颜色", this.setWidgetScale);
			this.registerAction("基础设置", this.setWidgetConfig);
		}
		const skinColor = !this.isNight ? this.settings.lightSkinColor : this.settings.darkSkinColor;
		this.color1 = skinColor ? new Color(skinColor) : this.color1;
		const scaleColor = !this.isNight ? this.settings.lightScaleColor : this.settings.darkScaleColor;
		this.lineColor = scaleColor ? new Color(scaleColor) : this.lineColor;
	};

	setWidgetSkin = async () => {
		await this.setLightAndDark("柱状颜色", false, "lightSkinColor", "darkSkinColor");
	};

	setWidgetScale = async () => {
		await this.setLightAndDark("刻度颜色", false, "lightScaleColor", "darkScaleColor");
	};
}

// @组件代码结束
if (config.runsFromHomeScreen || config.runsInApp) {
	Runing(Widget, "", false);
} else {
	let params = args.shortcutParameter;
	if (params) {
		const fileICloud = FileManager.iCloud();
		const path = fileICloud.documentsDirectory();
		fileICloud.writeString(path + "/health.txt", JSON.stringify(params));
	}
	(async () => {
		const M = new Widget();
		await M.render();
		Script.complete();
	})();
}
