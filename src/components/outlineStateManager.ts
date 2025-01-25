import DynamicOutlinePlugin from "main";
import { MarkdownView } from "obsidian";
import OutlineButton from "./outlineButton";
import OutlineWindow from "./outlineWindow";

export default class OutlineStateManager {
	private static instance: OutlineStateManager;
	private _windows: Map<string, OutlineWindow> = new Map();
	private _buttons: Map<string, OutlineButton> = new Map();
	private _plugin: DynamicOutlinePlugin;

	private constructor(plugin: DynamicOutlinePlugin) {
		this._plugin = plugin;
	}

	static initialize(plugin: DynamicOutlinePlugin): OutlineStateManager {
		if (!OutlineStateManager.instance) {
			OutlineStateManager.instance = new OutlineStateManager(plugin);
		}
		return OutlineStateManager.instance;
	}

	static getInstance(): OutlineStateManager {
		if (!OutlineStateManager.instance) {
			throw new Error("OutlineStateManager not initialized");
		}
		return OutlineStateManager.instance;
	}

	private getKey(view: MarkdownView): string {
		// @ts-ignore:2239
		// The `id` property actually exists in leaves.
		return view.leaf.id;
	}

	getButton(view: MarkdownView): OutlineButton {
		const key = this.getKey(view);
		if (!this._buttons.has(key)) {
			this._buttons.set(key, new OutlineButton(this._plugin, view));
		}
		return this._buttons.get(key)!;
	}

	getWindow(view: MarkdownView): OutlineWindow {
		const key = this.getKey(view);
		if (!this._windows.has(key)) {
			this._windows.set(key, new OutlineWindow(this._plugin, view));
		}
		return this._windows.get(key)!;
	}

	handleFileOpen(): void {
		const mdView = this._plugin.getActiveMarkdownView();
		if (!mdView) return;

		const window = this.getWindow(mdView);
		const headings = window.getHeadings();
		const shouldShow =
			headings &&
			headings.length >= this._plugin.settings.minimumHeadings;

		if (window.visible && !shouldShow) {
			if (this._plugin.settings.toggleOnHover) window.pinned = false;
            window.hide();
		} else if (!window.visible && shouldShow) {
			setTimeout(() => window.show(), 50);
			if (this._plugin.settings.toggleOnHover) window.pinned = true;
		}
	}

	handleMetadataChanged(): void {
		const mdView = this._plugin.getActiveMarkdownView();
		if (mdView) this.getWindow(mdView).update();
	}

	createButtonsInActiveViews(): void {
		this._plugin.getActiveMarkdownViews().forEach((view) => {
			const button = this.getButton(view);
			if (!button.visible) button.show();
		});
	}

	removeAll(): void {
		this._windows.forEach((window) => window.visible && window.hide());
		this._buttons.forEach((button) => button.visible && button.hide());
		this._windows.clear();
		this._buttons.clear();
	}
}
