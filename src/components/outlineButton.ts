import DynamicOutlinePlugin, { BUTTON_CLASS, LUCID_ICON_NAME } from "main";
import { MarkdownView, setIcon } from "obsidian";
import OutlineStateManager from "./outlineStateManager";
import OutlineWindow from "./outlineWindow";

export default class OutlineButton {
	public visible: boolean;

	private _active: boolean;
	private _containerEl: HTMLButtonElement;

	private _stateManager: OutlineStateManager;
	private _plugin: DynamicOutlinePlugin;
	private _view: MarkdownView;

	constructor(plugin: DynamicOutlinePlugin, view: MarkdownView) {
		this._plugin = plugin;
		this._view = view;
		this._stateManager = OutlineStateManager.getInstance();

		this.visible = false;
		this._active = false;
		this._containerEl = this.createElement();
		this.setupEventListeners();
	}

	get active(): boolean {
		return this._active;
	}

	set active(value: boolean) {
		this._active = value;
		this._containerEl.classList.toggle("button-active", this._active);
	}

	private setupEventListeners() {
		this._plugin.registerDomEvent(this._containerEl, "click", () =>
			this.handleClick()
		);

		if (this._plugin.settings.toggleOnHover) {
			this._plugin.registerDomEvent(this._containerEl, "mouseenter", () =>
				this.handleMouseEnter()
			);
			this._plugin.registerDomEvent(this._containerEl, "mouseleave", () =>
				this.handleMouseLeave()
			);
		}
	}

	private createElement(): HTMLButtonElement {
		const button: HTMLButtonElement = createEl("button", {
			cls: `clickable-icon view-action ${BUTTON_CLASS}`,
			attr: {
				"aria-label": "Toggle Dynamic Outline",
			},
		});
		setIcon(button, LUCID_ICON_NAME);
		return button;
	}

	private handleMouseEnter(): void {
		const window = this._stateManager.getWindow(this._view);

		if (!window.visible) {
			window.show({
				scrollBlock: "start",
			});
		}

		if (this._plugin.settings.toggleOnHover) {
			window.clearHideTimeout();
		}
	}

	private handleMouseLeave(): void {
		const window = this._stateManager.getWindow(this._view);

		if (window.visible && !window.pinned) {
			OutlineWindow.hideTimeout = setTimeout(() => {
				window.hide();
			}, 100);
		}
	}

	private getViewActionButtons(): HTMLElement | null {
		return this._view.containerEl.querySelector(".view-actions");
	}

	handleClick(): void {
		const window = this._stateManager.getWindow(this._view);

		if (window.visible) {
			if (this._plugin.settings.toggleOnHover) {
				if (!window.pinned) {
					window.pinned = true;
					return;
				} else {
					window.pinned = false;
					window.clearHideTimeout();
				}
			}
			window.hide();
		} else {
			window.show({
				scrollBlock: "start",
			});
			window.pinned = true;
		}
	}

	show(): void {
		const viewActions: HTMLElement | null = this.getViewActionButtons();

		if (viewActions) {
			viewActions.insertBefore(
				this._containerEl,
				viewActions?.firstChild
			);
			this.visible = true;
		}
	}

	hide(): void {
		this._containerEl.remove();
		this.visible = false;
	}
}
