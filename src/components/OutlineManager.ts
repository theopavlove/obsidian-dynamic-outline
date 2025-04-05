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

	mobileOutsideClickHandler = (event: MouseEvent) => {
		// @ts-ignore
		if (!this._plugin.app.isMobile) return;

		const mdView = this.getActiveMDView();
		if (!mdView) return;

		const outline = this.getOutlineInView(mdView);
		if (!outline.windowVisible) return;

		const outlineEl = outline.window.getContainerElement();
		const buttonEl = outline.button.getContainerElement();

		const target = event.target as HTMLElement;
		if (!outlineEl.contains(target) && !buttonEl.contains(target)) {
			outline.hideWindow();
		}
	};

	handleResize(): void {
		if (!this._plugin.settings.avoidContentOverlap) return;

		const views: MarkdownView[] = this.getVisibleMDViews();
		if (views.length === 0) return;

		views.forEach((view) => {
			const outline: Outline = this.getOutlineInView(view);

			const isWindowVisible: boolean = outline.windowVisible;
			const isEnoughWidth: boolean = this._plugin.settings
				.revealAutomaticallyOnFileOpen
				? this._isEnoughWidthForAutomaticToggle(view)
				: this._isEnoughWidthForHideOnResize(view);

			if (isWindowVisible) {
				if (!isEnoughWidth) {
					outline.hideWindow({ hiddenOnResize: true });
				}
			} else {
				if (outline.window.hiddenOnResize) {
					if (isEnoughWidth) {
						outline.showWindow({ hiddenOnResize: false });
						outline.windowPinned = true;
					}
				}
			}
		});
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
			outline.headings.length >=
				this._plugin.settings.minimumHeadingsToRevealAutomatically;

		// Update button visibility
		outline.toggleButton(hasHeadings);

		// Determine window visibility
		const shouldHideWindow: boolean =
			!hasHeadings ||
			(!isMetadataChange &&
				this._plugin.settings.revealAutomaticallyOnFileOpen &&
				!hasMinimumHeadings);

		const shouldShowWindow: boolean =
			!isMetadataChange &&
			!outline.toggledAutomaticallyOnce &&
			this._plugin.settings.revealAutomaticallyOnFileOpen &&
			hasMinimumHeadings &&
			this._isEnoughWidthForAutomaticToggle(view);

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

	private _isEnoughWidthForAutomaticToggle(view: MarkdownView): boolean {
		if (this._plugin.settings.handleContentOverlap === "allow") {
			return true;
		}

		const divisionFactor =
			this._plugin.settings.handleContentOverlap === "partial" ? 1 : 2;
		return this._calculateAvailableWidth(view, divisionFactor) >= 0;
	}

	private _isEnoughWidthForHideOnResize(view: MarkdownView): boolean {
		return this._calculateAvailableWidth(view, 2) >= 0;
	}

	private _calculateAvailableWidth(
		view: MarkdownView,
		divisionFactor: number = 1
	): number {
		const viewWidth: number = view.contentEl.innerWidth;
		const windowWidth: number =
			this._plugin.getCssVariableAsNumber(
				"--dynamic-outline-window-width"
			) ?? 256;

		return (viewWidth - 700) / divisionFactor - windowWidth;
	}
}
