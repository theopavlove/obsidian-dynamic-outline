import DynamicOutlinePlugin from "main";
import { HeadingCache, MarkdownView, Workspace } from "obsidian";
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

	getActiveMDView(): MarkdownView | null {
		const workspace: Workspace = this._plugin.app.workspace;
		return workspace.getActiveViewOfType(MarkdownView);
	}

	getOpenMDViews(): MarkdownView[] {
		const workspace: Workspace = this._plugin.app.workspace;
		return workspace
			.getLeavesOfType("markdown")
			.map((leaf) => leaf.view as MarkdownView);
	}

	getButtonInView(view: MarkdownView): OutlineButton {
		const key = this.getKey(view);
		if (!this._buttons.has(key)) {
			this._buttons.set(key, new OutlineButton(this._plugin));
		}

		const button: OutlineButton = this._buttons.get(key)!;
		button.updateView(view);

		return button;
	}

	getWindowInView(view: MarkdownView): OutlineWindow {
		const key = this.getKey(view);
		if (!this._windows.has(key)) {
			this._windows.set(key, new OutlineWindow(this._plugin, view));
		}

		const window: OutlineWindow = this._windows.get(key)!;
		window.updateView(view);

		return window;
	}

	handleFileOpen(): void {
		const mdView: MarkdownView | null = this.getActiveMDView();
		if (!mdView) return;

		const window: OutlineWindow = this.getWindowInView(mdView);
		const headings: HeadingCache[] = window.getHeadings();

		let shouldShow: boolean =
			headings &&
			headings.length >= this._plugin.settings.minimumHeadings;

		if (this._plugin.settings.preventContentOverlap) {
			shouldShow = shouldShow && this.isEnoughWidth(mdView);
		}

		if (window.visible && !shouldShow) {
			if (this._plugin.settings.toggleOnHover) window.pinned = false;
			window.hide();
		} else if (!window.visible && shouldShow) {
			setTimeout(() => window.show(), 50);
			if (this._plugin.settings.toggleOnHover) window.pinned = true;
		}
	}

	handleMetadataChanged(): void {
		const mdView = this.getActiveMDView();
		if (!mdView) return;

		const window: OutlineWindow = this.getWindowInView(mdView);
		window.update();
	}

	createButtonsInOpenViews(): void {
		this.getOpenMDViews().forEach((view) => {
			// When the Obsidian is initially loaded, some active leaves do not have
			// any HTML content yet. But when we initialize the button, we pass
			// the current view as it is (and it is not updated in the future).
			// So, we should check that our view is fully loaded (so that we could
			// later get the View Action Buttons) in order to avoid
			// false button initialization.

			// @ts-ignore:2339
			if (view.leaf.width === 0) return;

			const button = this.getButtonInView(view);
			if (!button.visible) button.show();
		});
	}

	removeAll(): void {
		this._windows.forEach((window) => window.hide());
		this._buttons.forEach((button) => button.hide());
		this._windows.clear();
		this._buttons.clear();
	}

	// Considering the fact that the views that are passed to the button
	// and window constructors are not passed by reference, should we bother
	// to keep a mapping of all the buttons?
	private getKey(view: MarkdownView): string {
		// @ts-ignore:2239
		// The `id` property actually exists in leaves.
		return view.leaf.id;
	}

	private isEnoughWidth(mdView: MarkdownView): boolean {
		const mdViewWidth: number = mdView.contentEl.innerWidth;
		const windowWidth: number =
			this._plugin.getCssVariableAsNumber(
				"--dynamic-outline-window-width"
			) ?? 256;

		const enoughWidth: boolean = (mdViewWidth - 700) / 1.75 >= windowWidth;
		return enoughWidth;
	}
}
