import DynamicOutlinePlugin from "main";
import { MarkdownView, setIcon, WorkspaceLeaf } from "obsidian";

const LUCID_ICON_NAME = "list";
export const BUTTON_CLASS = "dynamic-outline-button";

export default class ButtonManager {
	private _plugin: DynamicOutlinePlugin;
	private _hideTimeout: NodeJS.Timeout | null = null;

	constructor(plugin: DynamicOutlinePlugin) {
		this._plugin = plugin;
	}

	private _createButtonHTML(): HTMLButtonElement {
		const button: HTMLButtonElement = createEl("button", {
			cls: `clickable-icon view-action ${BUTTON_CLASS}`,
			attr: {
				"aria-label": "Toggle Dynamic Outline",
			},
		});
		setIcon(button, LUCID_ICON_NAME);
		return button;
	}

	private _handleButtonClick() {
		const markdownView: MarkdownView | null =
			this._plugin.getActiveMarkdownView();

		if (!markdownView) return;

		const windowContainer: HTMLElement | null | undefined =
			this._plugin.windowManager.getWindowFromView(markdownView);

		if (windowContainer) {
			if (this._plugin.settings.toggleOnHover) {
				const isPinned: boolean =
					windowContainer.hasAttribute("pinned");
				if (!isPinned) {
					windowContainer.setAttribute("pinned", "");
					return;
				} else {
					this.clearHideTimeout();
				}
				windowContainer.removeAttribute("pinned");
			}
			this._plugin.windowManager.hideWindowFromView(markdownView);
		} else {
			const newWindow: HTMLElement =
				this._plugin.windowManager.createWindowForView(
					markdownView,
					this._plugin.headingsManager.getHeadingsForView(
						markdownView
					)
				);
			if (this._plugin.settings.toggleOnHover) {
				this._plugin.registerDomEvent(newWindow, "mouseenter", () =>
					this.clearHideTimeout()
				);
				newWindow.setAttribute("pinned", "");
			}
		}
	}

	private _handleMouseEnter(): void {
		const markdownView: MarkdownView | null =
			this._plugin.getActiveMarkdownView();
		if (!markdownView) return;

		const windowContainer: HTMLElement | null | undefined =
			this._plugin.windowManager.getWindowFromView(markdownView);

		if (!windowContainer) {
			const newWindow = this._plugin.windowManager.createWindowForView(
				markdownView,
				this._plugin.headingsManager.getHeadingsForView(markdownView)
			);
			if (this._plugin.settings.toggleOnHover) {
				this._plugin.registerDomEvent(newWindow, "mouseenter", () =>
					this.clearHideTimeout()
				);
				this._plugin.registerDomEvent(newWindow, "mouseleave", () =>
					this._handleMouseLeave()
				);
			}
		}

		if (this._plugin.settings.toggleOnHover) {
			this.clearHideTimeout();
		}
	}

	private _handleMouseLeave(): void {
		const markdownView: MarkdownView | null =
			this._plugin.getActiveMarkdownView();
		if (!markdownView) return;

		const windowContainer: HTMLElement | null | undefined =
			this._plugin.windowManager.getWindowFromView(markdownView);

		if (windowContainer) {
			const isPinned: boolean = windowContainer.hasAttribute("pinned");

			if (!isPinned) {
				this._hideTimeout = setTimeout(() => {
					this._plugin.windowManager.hideWindowFromView(markdownView);
				}, 100);
			}
		}
	}

	private clearHideTimeout(): void {
		if (this._hideTimeout) {
			clearTimeout(this._hideTimeout);
			this._hideTimeout = null;
		}
	}

	// Do I need the leaf? Maybe the view right away?
	addButtonToLeaf(leaf: WorkspaceLeaf) {
		if (this.getButtonFromLeaf(leaf)) return;

		const markdownActionButtons: HTMLElement | null =
			leaf.view.containerEl.querySelector("div.view-actions");
		if (!markdownActionButtons) return;

		const newButton: HTMLButtonElement = this._createButtonHTML();
		markdownActionButtons.insertBefore(
			newButton,
			markdownActionButtons.firstChild
		);

		// Probably move to main.ts (?)
		this._plugin.registerDomEvent(newButton, "click", (event) =>
			this._handleButtonClick()
		);

		if (this._plugin.settings.toggleOnHover) {
			this._plugin.registerDomEvent(newButton, "mouseenter", () =>
				this._handleMouseEnter()
			);
			this._plugin.registerDomEvent(newButton, "mouseleave", () =>
				this._handleMouseLeave()
			);
		}

		return newButton;
	}

	addButtonToLeaves() {
		this._plugin.app.workspace.onLayoutReady(() => {
			const markdownLeaves: WorkspaceLeaf[] =
				this._plugin.getAllMarkdownLeaves();
			markdownLeaves.forEach((leaf) => {
				this.addButtonToLeaf(leaf);
			});
		});
	}

	getButtonFromLeaf(leaf: WorkspaceLeaf): HTMLButtonElement | null {
		return leaf.view.containerEl.querySelector(`button.${BUTTON_CLASS}`);
	}

	removeButtonFromLeaf(leaf: WorkspaceLeaf) {
		this.getButtonFromLeaf(leaf)?.remove();
	}

	removeButtonFromLeaves() {
		const markdowns = this._plugin.getAllMarkdownLeaves();
		markdowns.forEach((md) => {
			this.removeButtonFromLeaf(md);
		});
	}
}
