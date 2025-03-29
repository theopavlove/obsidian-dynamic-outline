import DynamicOutlinePlugin from "main";
import { MarkdownView } from "obsidian";
import Outline from "src/components/Outline";

export default class OutlineManager {
	private static instance: OutlineManager;
	private _plugin: DynamicOutlinePlugin;
	private _outlines: Map<string, Outline> = new Map();

	private constructor(plugin: DynamicOutlinePlugin) {
		this._plugin = plugin;
		this._setupEventListeners();
	}

	static initialize(plugin: DynamicOutlinePlugin): OutlineManager {
		if (!OutlineManager.instance) {
			OutlineManager.instance = new OutlineManager(plugin);
		}
		return OutlineManager.instance;
	}

	static getInstance(): OutlineManager {
		if (!OutlineManager.instance) {
			throw new Error("OutlineStateManager not initialized");
		}
		return OutlineManager.instance;
	}

	getActiveMDView(): MarkdownView | null {
		const view: MarkdownView | null =
			this._plugin.app.workspace.getActiveViewOfType(MarkdownView);
		return view;
	}

	getVisibleMDViews(): MarkdownView[] {
		const views: MarkdownView[] = this._plugin.app.workspace
			.getLeavesOfType("markdown")
			.map((leaf) => leaf.view as MarkdownView)
			.filter((view) => view.contentEl);
		return views;
	}

	getOutlineInView(view: MarkdownView): Outline {
		const viewId: string = this._getViewId(view);
		if (!this._outlines.has(viewId)) {
			this._outlines.set(viewId, new Outline(this._plugin, view));
		}

		return this._outlines.get(viewId)!;
	}

	updateViewForOutline(view: MarkdownView): void {
		const outline: Outline = this.getOutlineInView(view);
		outline.view = view;
	}

	handleActiveLeafChange(view: MarkdownView): void {
		this._updateOutlineVisibility(view);
	}

	handleMetadataChanged(): void {
		const view = this.getActiveMDView();
		if (!view) return;

		this._updateOutlineVisibility(view, true);
	}

	createButtonsInOpenViews(): void {
		const views: MarkdownView[] = this.getVisibleMDViews();
		if (views.length === 0) return;

		views.map((view) => this._createButtonInView(view));
	}

	removeAll(): void {
		this._outlines.forEach((outline) => {
			outline.window.destroy();
			outline.button.destroy();
		});
		this._outlines.clear();
	}

	private _setupEventListeners(): void {
		this._plugin.registerEvent(
			this._plugin.app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf?.view instanceof MarkdownView) {
					const view: MarkdownView = leaf.view as MarkdownView;
					const outline: Outline = this.getOutlineInView(view);
					outline.view = view;
				}
			})
		);
	}

	private _getViewId(view: MarkdownView): string {
		// @ts-ignore:2239
		return view.leaf.id;
	}

	private _createButtonInView(view: MarkdownView): void {
		const outline: Outline = this.getOutlineInView(view);
		if (
			!outline.isButtonVisible &&
			outline.headings &&
			outline.headings.length > 1
		) {
			outline.showButton();
		}
	}

	private _updateOutlineVisibility(
		view: MarkdownView,
		isMetadataChange = false
	): void {
		const outline: Outline = this.getOutlineInView(view);

		const hasHeadings: boolean =
			outline.headings && outline.headings.length > 1;
		const hasMinimumHeadings: boolean =
			hasHeadings &&
			outline.headings.length >= this._plugin.settings.minimumHeadings;

		// Update button visibility
		outline.toggleButton(hasHeadings);

		// Determine window visibility
		const shouldHideWindow: boolean =
			!hasHeadings ||
			(!isMetadataChange &&
				this._plugin.settings.toggleAutomatically &&
				!hasMinimumHeadings);

		const shouldShowWindow: boolean =
			!isMetadataChange &&
			!outline.toggledAutomaticallyOnce &&
			this._plugin.settings.toggleAutomatically &&
			hasMinimumHeadings &&
			this._isEnoughWindowWidth(view);

		// Update window state
		if (shouldHideWindow) {
			outline.hideWindow();
			outline.windowPinned = false;
		} else if (shouldShowWindow) {
			outline.showWindow();
			outline.windowPinned = true;
		}

		// Update window if visible
		if (outline.windowVisible) {
			outline.toggledAutomaticallyOnce = true;
			outline.updateWindow();
		}
	}

	private _isEnoughWindowWidth(view: MarkdownView): boolean {
		if (this._plugin.settings.contentOverlap === "allow") {
			return true;
		}

		const viewWidth: number = view.contentEl.innerWidth;
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
