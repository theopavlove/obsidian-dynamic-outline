import DynamicOutlinePlugin, { BUTTON_CLASS, LUCID_ICON_NAME } from "main";
import { MarkdownView, setIcon } from "obsidian";
import OutlineStateManager from "./outlineStateManager";
import OutlineWindow from "./outlineWindow";

export default class OutlineButton {
	private _stateManager: OutlineStateManager;
	private _plugin: DynamicOutlinePlugin;
	private _view: MarkdownView;
	private _containerEl: HTMLButtonElement;

	constructor(plugin: DynamicOutlinePlugin) {
		this._plugin = plugin;
		this._stateManager = OutlineStateManager.getInstance();
		this._containerEl = this.createElement();

		this.setupEventListeners();
	}

	get visible(): boolean {
		const buttonInView = this._view.containerEl.querySelector(
			`button.${BUTTON_CLASS}`
		);
		return !!buttonInView;
	}

	get active(): boolean {
		return this._containerEl.classList.contains("button-active");
	}

	set active(value: boolean) {
		this._containerEl.classList.toggle("button-active", value);
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
		const window = this._stateManager.getWindowInView(this._view);

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
		const window = this._stateManager.getWindowInView(this._view);

		if (window.visible && !window.pinned) {
			OutlineWindow.hideTimeout = setTimeout(() => {
				window.hide();
			}, 100);
		}
	}

	private getViewActionButtons(): HTMLElement | null {
		return this._view.containerEl.querySelector(".view-actions");
	}

	private getViewHeaderLeft(): HTMLElement | null {
		return this._view.containerEl.querySelector(
			".view-header-left .view-header-nav-buttons"
		);
	}

	updateView(view: MarkdownView) {
		this._view = view;
	}

	handleClick(): void {
		const window = this._stateManager.getWindowInView(this._view);

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
		// Workaround because we have no view.onClose event to deactivate buttons properly.
		this.active = this.visible;

		if (this._plugin.settings.windowLocation === "right") {
			const viewActions: HTMLElement | null = this.getViewActionButtons();

			if (viewActions) {
				viewActions.insertBefore(
					this._containerEl,
					viewActions?.firstChild
				);
			}
		} else if (this._plugin.settings.windowLocation === "left") {
			const viewHeaderLeft: HTMLElement | null = this.getViewHeaderLeft();

			if (viewHeaderLeft) {
				viewHeaderLeft.appendChild(this._containerEl);
			}
		} else {
			console.error("Invalid window location");
		}
	}

	hide(): void {
		if (!this.visible) return;

		this._containerEl.remove();
	}
}
