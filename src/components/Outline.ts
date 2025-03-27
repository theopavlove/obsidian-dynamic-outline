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

	constructor(plugin: DynamicOutlinePlugin, view: MarkdownView) {
		this._plugin = plugin;
		this._view = view;
		this.outlineWindow = new OutlineWindow(this._plugin, this);
		this.outlineButton = new OutlineButton(this._plugin, this);
		this.outlineHeadings = new OutlineHeadings(this._plugin, this);
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

	get shouldShowButton(): boolean {
		return this.headings && this.headings.length > 1;
	}

	get isWindowVisible(): boolean {
		return this.outlineWindow.visible;
	}

	get isWindowPinned(): boolean {
		return this.outlineWindow.pinned;
	}

	set windowPinned(value: boolean) {
		this.outlineWindow.pinned = value;
	}

	get shouldShowWindow(): boolean {
		return (
			this.headings &&
			this._isEnoughWindowWidth() &&
			this.headings.length >= this._plugin.settings.minimumHeadings
		);
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
		if (!this.isWindowVisible) {
			this.outlineWindow.show(options);
		}
	}

	hideWindow(timeout?: number) {
		if (this.isWindowVisible) {
			if (timeout) {
				OutlineWindow.hideTimeout = setTimeout(() => {
					this.outlineWindow.hide();
				}, timeout);
			} else {
				this.outlineWindow.hide();
			}
		}
	}

	hideWindowIfEmpty() {
		if (this.isWindowVisible && this.headings.length === 0) {
			this.outlineWindow.hide();
		}
	}

	updateWindow() {
		this.outlineWindow.update();
	}

	clearWindowHideTimeout() {
		this.outlineWindow._clearHideTimeout();
	}

	private _isEnoughWindowWidth(): boolean {
		if (this._plugin.settings.contentOverlap === "allow") {
			return true;
		}

		const viewWidth: number = this._view.contentEl.innerWidth;
		const windowWidth: number =
			this._plugin.getCssVariableAsNumber(
				"--dynamic-outline-window-width"
			) ?? 256;

		switch (this._plugin.settings.contentOverlap) {
			case "partial":
				return viewWidth - 700 >= windowWidth;
			case "prevent":
				return (viewWidth - 700) / 2 >= windowWidth;
			default:
				return true;
		}
	}
}
