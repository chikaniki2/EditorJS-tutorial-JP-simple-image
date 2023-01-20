class OriginalImage {
	///////////////////////////////////////
	// ツールの基本情報設定
	///////////////////////////////////////

	// ツールバーに表示する情報
	static get toolbox() {
		return {
			title: 'OriginalImage',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm88 200H296c13.3 0 24 10.7 24 24s-10.7 24-24 24H152c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/></svg>'
		};
	}

	///////////////////////////////////////
	// ツールのコンストラクト, ロード値代入
	///////////////////////////////////////
	constructor({
		data,
		api,
		config
	}) {
		this.api = api;
		this.data = {
			url: data.url || '',
			caption: data.caption || '',
			withBorder: data.withBorder !== undefined ? data.withBorder : false,
			withBackground: data.withBackground !== undefined ? data.withBackground : false,
			stretched: data.stretched !== undefined ? data.stretched : false,
		};
		this.config = config || {};
		this.wrapper = undefined;
		this.settings = [{
				name: 'withBorder',
				icon: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.28h2.25v.237h1.15-1.15zM1.9 8.455v-3.42c0-1.154.985-2.09 2.2-2.09h4.2v2.137H4.15v3.373H1.9zm0 2.137h2.25v3.325H8.3v2.138H4.1c-1.215 0-2.2-.936-2.2-2.09v-3.373zm15.05-2.137H14.7V5.082h-4.15V2.945h4.2c1.215 0 2.2.936 2.2 2.09v3.42z"/></svg>`
			},
			{
				name: 'stretched',
				icon: `<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.475 1.788L13.514 9.16a1.125 1.125 0 0 1-1.59-1.591l1.644-1.644z"/></svg>`
			},
			{
				name: 'withBackground',
				icon: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.043 8.265l3.183-3.183h-2.924L4.75 10.636v2.923l4.15-4.15v2.351l-2.158 2.159H8.9v2.137H4.7c-1.215 0-2.2-.936-2.2-2.09v-8.93c0-1.154.985-2.09 2.2-2.09h10.663l.033-.033.034.034c1.178.04 2.12.96 2.12 2.089v3.23H15.3V5.359l-2.906 2.906h-2.35zM7.951 5.082H4.75v3.201l3.201-3.2zm5.099 7.078v3.04h4.15v-3.04h-4.15zm-1.1-2.137h6.35c.635 0 1.15.489 1.15 1.092v5.13c0 .603-.515 1.092-1.15 1.092h-6.35c-.635 0-1.15-.489-1.15-1.092v-5.13c0-.603.515-1.092 1.15-1.092z"/></svg>`
			}
		];
	}

	///////////////////////////////////////
	// UIと機能の設定
	///////////////////////////////////////

	// ツール選択時に生成するelement
	render() {
		// wrapperにelement情報を格納
		this.wrapper = document.createElement('div');
		const input = document.createElement('input');

		this.wrapper.classList.add('original-image');
		this.wrapper.appendChild(input);

		// 保存されたデータがあるなら、変換メソッド叩く
		if (this.data && this.data.url) {
			this._createImage(this.data.url, this.data.caption);
			return this.wrapper;
		}

		// this.config. でconfigから読み込める。
		// this.api.i18n.t() でラップすると、i18nの翻訳対象になる。
		input.placeholder = this.api.i18n.t(this.config.placeholder || 'Paste an image URL...');
		input.value = this.data && this.data.url ? this.data.url : '';

		// eventの定義
		// ペーストイベント
		input.addEventListener('paste', (event) => {
			this._createImage(event.clipboardData.getData('text'));
		});

		return this.wrapper;
	}

	// チューンオプションメニューの設定
	renderSettings() {
		// ボタンを格納するdiv作成（ object.wrapperとは別。単純なelement )
		const wrapper = document.createElement('div');

		// settingsを元にオプションボタン生成
		this.settings.forEach(tune => {
			let button = document.createElement('div');
			// 他プラグインとの互換性を高めるため、EditorJSが共通cssを用意している。
			// StyleAPI [https://editorjs.io/styles] からメソッドで取得。
			// (例) this.api.styles.settingsButton => 'cdx-settings-button'
			//
			// もちろんクラス名直打ちでもOK。こっちの方がたぶん軽い。
			// (例)button.classList.add('cdx-settings-button');
			button.classList.add(this.api.styles.settingsButton);
			button.classList.toggle(this.api.styles.settingsButtonActive, this.data[tune.name]);
			button.innerHTML = tune.icon;
			wrapper.appendChild(button);

			// ボタンのイベント設定
			button.addEventListener('click', () => {
				this._toggleTune(tune.name);
				button.classList.toggle(this.api.styles.settingsButtonActive);
			});
		});

		return wrapper;
	}

	///////////////////////////////////////
	// 独自メソッド定義
	///////////////////////////////////////

	// * urlを元にimgタグに変換する
	_createImage(url, captionText) {
		const image = document.createElement('img');
		const caption = document.createElement('input');

		image.src = url;
		// caption.contentEditable = true; //インライン編集許可フラグ
		caption.placeholder = 'Caption...';
		caption.value = captionText || '';

		// wrapperを元にelementを生成
		this.wrapper.innerHTML = '';
		this.wrapper.appendChild(image);
		this.wrapper.appendChild(caption);

		// 選択されているオプションがあるなら、オプションメソッド実行
		this._acceptTuneView();
	}

	// * ボタンクリックで選択オプションを切り替える
	_toggleTune(tune) {
		this.data[tune] = !this.data[tune];
		this._acceptTuneView();
	}
	// * 選択オプションに応じてclass変更
	_acceptTuneView() {
		this.settings.forEach(tune => {
			this.wrapper.classList.toggle(tune.name, !!this.data[tune.name]);

			// stretchedはCSSだけで実現できないので、JS制御が必要。
			// blocksAPIのstretchBlockメソッドを利用する。
			if (tune.name === 'stretched') {
				this.api.blocks.stretchBlock(this.api.blocks.getCurrentBlockIndex(), !!this.data.stretched);
			}
		});
	}

	///////////////////////////////////////
	// 保存処理の設定
	///////////////////////////////////////

	// saveメソッド実行時に生成するobject
	save(blockContent) {
		const image = blockContent.querySelector('img');
		const caption = blockContent.querySelector('input');
		// const caption = blockContent.querySelector('[contenteditable]'); //インライン編集許可するならこっち
		// サニタイズの設定（許可するインラインタグ）
		const sanitizerConfig = {
			b: true,
			a: {
				href: true
			},
			i: true
		};

		return Object.assign(this.data, {
			url: image.src,
			caption: caption.value,
			// caption: this.api.sanitizer.clean(caption.innerHTML || '', sanitizerConfig) //インライン編集許可するならこっち(サニタイズする)
		});
	}

	// 保存するobjectをバリデート
	validate(savedData) {
		// 空欄なら保存しない
		if (!savedData.url.trim()) {
			return false;
		}
		return true;
	}

	///////////////////////////////////////
	// ツールの拡張設定
	///////////////////////////////////////
	// 他ブロックでのペーストイベントを検知し、ツール用のデータに変換する
	// 対象とするオブジェクトの指定 [https://editorjs.io/tools-api#pasteconfig]
	static get pasteConfig() {
		return {
			tags: ['IMG'],
			patterns: {
				image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png)$/i
			}
		}
	}
	// ペーストされたオブジェクトを変換
	onPaste(event) {
		switch (event.type) {
			// タグだった場合
			case 'tag':
				const imgTag = event.detail.data;

				this._createImage(imgTag.src);
				break;
				// URLだった場合
			case 'pattern':
				const src = event.detail.data;

				this._createImage(src);
				break;
		}
	}
}
