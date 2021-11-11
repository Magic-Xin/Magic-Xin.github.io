// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
// NCUT-WIFI
// ver 1.0.10
// Made by MagicXin

class Im3xWidget {
	/**
	 * 初始化
	 * @param arg 外部传递过来的参数
	 */
	constructor(arg) {
		this.arg = arg;
		this.widgetSize = config.widgetFamily;
		this.FILE_MGR = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();
	}

	//渲染组件
	async render() {
		if (this.widgetSize === 'medium') {
			return await this.renderSmall()
		} else if (this.widgetSize === 'large') {
			return await this.renderLarge()
		} else {
			return await this.renderSmall()
		}
	}

	//渲染小尺寸组件
	async renderSmall() {
		await this.getData();
		const data = this.FILE_MGR.readString(this.FILE_MGR.joinPath(this.FILE_MGR.documentsDirectory(), "NCUT_data")).split(",");
		const widget = new ListWidget();

		let header = widget.addStack();
		let icon;
		if (this.FILE_MGR.fileExists(this.FILE_MGR.joinPath(this.FILE_MGR.documentsDirectory(), "NCUT_image"))) {
			icon = header.addImage(this.FILE_MGR.readImage(this.FILE_MGR.joinPath(this.FILE_MGR.documentsDirectory(), "NCUT_image")));
		} else {
			icon = header.addImage(await this.getImage('https://blog.magicxin.tech/NCUT.jpg'));
		}
		icon.imageSize = new Size(15, 15);
		header.addSpacer(7.5);
		let title = header.addText("NCUT WiFi");
		title.textOpacity = 0.9;
		title.font = Font.systemFont(14);
		title.textColor = new Color("#620062");
		widget.addSpacer(7.5);

		let used_text = widget.addText("已用流量: ");
		used_text.textColor = new Color("#000000");
		used_text.font = Font.boldSystemFont(15);
		used_text.lineLimit = 1;
		widget.addSpacer(5);
		if (data[2] >= 1024.0) {
			data[2] /= 1024;
			let used_data = widget.addText(Number(data[2]).toFixed(2).toString() + " GB");
			used_data.textColor = new Color("#000000");
			used_data.font = Font.systemFont(15);
			used_data.lineLimit = 1;
			used_data.centerAlignText();
		} else {
			let used_data = widget.addText(Number(data[2]).toFixed(2).toString() + " MB");
			used_data.textColor = new Color("#000000");
			used_data.font = Font.systemFont(15);
			used_data.lineLimit = 1;
			used_data.centerAlignText();
		}
		widget.addSpacer(5);

		let left_text = widget.addText("剩余流量: ");
		left_text.textColor = new Color("#000000");
		left_text.font = Font.boldSystemFont(15);
		left_text.lineLimit = 1;
		widget.addSpacer(3);
		if (data[3] >= 1024.0) {
			data[3] /= 1024.0;
			let left_data = widget.addText(Number(data[3]).toFixed(2).toString() + " GB");
			left_data.textColor = new Color("#000000");
			left_data.font = Font.systemFont(15);
			left_data.lineLimit = 1;
			left_data.centerAlignText();
		} else {
			let left_data = widget.addText(Number(data[3]).toFixed(2).toString() + " MB");
			left_data.textColor = new Color("#000000");
			left_data.font = Font.systemFont(15);
			left_data.lineLimit = 1;
			left_data.centerAlignText();
		}
		widget.addSpacer(5);

		let date_data = widget.addText('更新于:' + data[0]);
		date_data.font = Font.systemFont(10);
		date_data.textColor = new Color("#696969");
		date_data.centerAlignText();

		let date_time = widget.addText(data[1]);
		date_time.font = Font.systemFont(10);
		date_time.textColor = new Color("#696969");
		date_time.centerAlignText();

		widget.backgroundColor = new Color("#FFFFFF");

		let nextRefresh = Date.now() + 30 * 60 * 1000;
		widget.refreshAfterDate = new Date(nextRefresh);
		return widget;
	}

	//渲染中尺寸组件
	async renderMedium() {
		let w = new ListWidget()
		w.addText("暂不支持该尺寸组件")
		return w
	}

	//渲染大尺寸组件
	async renderLarge() {
		let w = new ListWidget()
		w.addText("暂不支持该尺寸组件")
		return w
	}

	//加载数据
	async getData() {
		const url = 'http://ip.ncut.edu.cn/cgi-bin/rad_user_info\?callback\=jQuery';
		const request = new Request(url);
		const result = await Promise.any([request.loadString(), wait(1000)]);

		function wait(ms) {
			return new Promise((resolve) => Timer.schedule(ms, false, resolve));
		}

		if (result) {
			let dic = result.match(/\((.+?)\)/g);
    		dic = dic[0];
    		dic = dic.substring(1, dic.length - 1);
    		dic = JSON.parse(dic);
			let data = ['0', '0', dic['sum_bytes']/1024/1024, dic['remain_bytes']/1024/1024];
			await this.nowDate(data);
			this.FILE_MGR.writeString(this.FILE_MGR.joinPath(this.FILE_MGR.documentsDirectory(), "NCUT_data"), data.toString());
		}
		return;
	}

	//加载远程图片
	async getImage(url) {
		const req = new Request(url);
		const img = await req.loadImage();
		await this.FILE_MGR.writeImage(this.FILE_MGR.joinPath(this.FILE_MGR.documentsDirectory(), "NCUT_image"), img);
		return img;
	}

	async nowDate(data) {
		const date = new Date().toLocaleDateString('chinese', {
			hour12: false
		});
		data[0] = date
		const time = new Date().toLocaleTimeString('chinese', {
			hour12: false
		});
		data[1] = time;
		return;
	}


	//编辑测试使用
	async test() {
		if (config.runsInWidget) return
		this.widgetSize = 'small'
		let w1 = await this.render()
		await w1.presentSmall()
		this.widgetSize = 'medium'
		let w2 = await this.render()
		await w2.presentMedium()
		this.widgetSize = 'large'
		let w3 = await this.render()
		await w3.presentLarge()
	}

	//组件单独在桌面运行时调用
	async init() {
		if (!config.runsInWidget) return
		let widget = await this.render()
		Script.setWidget(widget)
		Script.complete()
	}
}

module.exports = Im3xWidget;

// 如果是在编辑器内编辑、运行、测试，则取消注释这行，便于调试：
// await new Im3xWidget().test()

// 如果是组件单独使用（桌面配置选择这个组件使用，则取消注释这一行：
await new Im3xWidget(args.widgetParameter).init()