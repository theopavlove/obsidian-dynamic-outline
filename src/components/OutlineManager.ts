import DynamicOutlinePlugin from "main";
import { MarkdownView, Workspace, WorkspaceLeaf } from "obsidian";
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
			// this._outlines.get(viewId)!.outlineButton.show();
		}

		return this._outlines.get(viewId)!;
	}

	handleActiveLeafChange(view: MarkdownView): void {
		this._updateOutlineState(view, { allowWindowToggle: true });
	}

	handleMetadataChanged(): void {
		const view: MarkdownView | null = this.getActiveMDView();
		if (!view) return;

		this._updateOutlineState(view);
	}

	createButtonsInOpenViews(): void {
		const views: MarkdownView[] = this.getVisibleMDViews();
		if (views.length === 0) return;

		views.forEach((view) => {
			// When the Obsidian is initially loaded, some active leaves do not have
			// any HTML content yet. But when we initialize the button, we pass
			// the current view as it is (and it is not updated in the future).
			// So, we should check that our view is fully loaded (so that we could
			// later get the View Action Buttons) in order to avoid
			// false button initialization.

			// @ts-ignore:2339
			if (view.leaf.width === 0) return;

			this._createButtonInView(view);
		});
	}

	removeAll(): void {
		this._outlines.forEach((outline) => {
			outline.window.hide();
			outline.button.hide();
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
		if (!outline.isButtonVisible && outline.shouldShowButton) {
			outline.showButton();
		}
	}

	private _updateOutlineState(
		view: MarkdownView,
		options?: { allowWindowToggle: boolean }
	): void {
		const outline: Outline = this.getOutlineInView(view);

		outline.toggleButton(outline.shouldShowButton);

		if (options?.allowWindowToggle) {
			outline.toggleWindow(outline.shouldShowWindow);
			outline.windowPinned = outline.shouldShowWindow;
		}

		// Fallback to hide the window if there are no more headings
		outline.hideWindowIfEmpty();

		// If the window was toggled on the previous step, this would do the same work, because .show() also contains .update()
		if (outline.isWindowVisible) {
			outline.updateWindow();
		}
	}
}
