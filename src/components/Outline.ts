import DynamicOutlinePlugin from "main";
import { HeadingCache, MarkdownView } from "obsidian";
import OutlineButton from "./outlineButton";
import OutlineWindow from "./outlineWindow";
import OutlineHeadings from "./outlineHeadings";

export default class Outline {
	private _plugin: DynamicOutlinePlugin;
	private _view: MarkdownView;
	public outlineWindow: OutlineWindow;
	public outlineButton: OutlineButton;
	public outlineHeadings: OutlineHeadings;
	public toggledAutomaticallyOnce: boolean;

	constructor(plugin: DynamicOutlinePlugin, view: MarkdownView) {
		this._plugin = plugin;
		this._view = view;
		this.outlineWindow = new OutlineWindow(this._plugin, this);
		this.outlineButton = new OutlineButton(this._plugin, this);
		this.outlineHeadings = new OutlineHeadings(this._plugin, this);
		this.toggledAutomaticallyOnce = false;
	}

	get view(): MarkdownView {
		return this._view;
	}

	set view(value: MarkdownView) {
		this._view = value;
	}

	get window(): OutlineWindow {
		return this.outlineWindow;
	}

	get button(): OutlineButton {
		return this.outlineButton;
	}

	get headings(): HeadingCache[] {
		return this.outlineHeadings.headings;
	}

	get isButtonVisible(): boolean {
		return this.outlineButton.visible;
	}

	set buttonActive(value: boolean) {
		this.outlineButton.active = value;
	}

	set buttonPinned(value: boolean) {
		this.outlineButton.pinned = value;
	}

	get windowVisible(): boolean {
		return this.outlineWindow.visible;
	}

	get windowPinned(): boolean {
		return this.outlineWindow.pinned;
	}

	set windowPinned(value: boolean) {
		this.outlineWindow.pinned = value;
	}

	toggleButton(value: boolean) {
		value ? this.showButton() : this.hideButton();
	}

	showButton() {
		if (!this.isButtonVisible) {
			this.outlineButton.show();
		}
	}

	hideButton() {
		if (this.isButtonVisible) {
			this.outlineButton.hide();
		}
	}

	toggleWindow(value: boolean) {
		value ? this.showWindow() : this.hideWindow();
	}

	showWindow(options?: { scrollBlock?: ScrollLogicalPosition }) {
		if (!this.windowVisible) {
			this.outlineWindow.show(options);
		}
	}

	hideWindow(timeout?: number) {
		if (this.windowVisible) {
			if (timeout) {
				OutlineWindow.hideTimeout = setTimeout(() => {
					this.outlineWindow.hide();
				}, timeout);
			} else {
				this.outlineWindow.hide();
			}
		}
	}

	updateWindow() {
		this.outlineWindow.update();
	}

	clearWindowHideTimeout() {
		this.outlineWindow._clearHideTimeout();
	}
}
