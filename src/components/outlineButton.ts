import DynamicOutlinePlugin, { BUTTON_CLASS, LUCID_ICON_NAME } from "main";
import { setIcon } from "obsidian";
import Outline from "src/components/Outline";

export default class OutlineButton {
	private _plugin: DynamicOutlinePlugin;
	private _outline: Outline;
	private _containerEl: HTMLButtonElement;

	constructor(plugin: DynamicOutlinePlugin, outline: Outline) {
		this._plugin = plugin;
		this._outline = outline;
		this._containerEl = this._createElement();
		this._setupEventListeners();
	}

	get visible(): boolean {
		const isHidden: boolean =
			this._containerEl.classList.contains("hidden");
		return !isHidden;
	}

	set visible(value: boolean) {
		this._containerEl.classList.toggle("hidden", !value);
	}

	get active(): boolean {
		return this._containerEl.classList.contains("button-active");
	}

	set active(value: boolean) {
		this._containerEl.classList.toggle("button-active", value);
	}

	set pinned(value: boolean) {
		this._containerEl.classList.toggle("pinned", value);
	}

	private _setupEventListeners() {
		this._plugin.registerDomEvent(this._containerEl, "click", () =>
			this.handleClick()
		);

		if (this._plugin.settings.toggleOnHover) {
			this._plugin.registerDomEvent(this._containerEl, "mouseenter", () =>
				this._handleMouseEnter()
			);
			this._plugin.registerDomEvent(this._containerEl, "mouseleave", () =>
				this._handleMouseLeave()
			);
		}
	}

	private _createElement(): HTMLButtonElement {
		const button: HTMLButtonElement = createEl("button", {
			cls: `clickable-icon view-action ${BUTTON_CLASS} hidden`,
			attr: {
				"aria-label": "Toggle Dynamic Outline",
			},
		});
		setIcon(button, LUCID_ICON_NAME);

		if (this._plugin.settings.windowLocation === "right") {
			const viewActions: HTMLElement | null =
				this._outline.view.containerEl.querySelector(".view-actions");
			viewActions?.insertBefore(button, viewActions?.firstChild);
		} else if (this._plugin.settings.windowLocation === "left") {
			const viewHeaderLeft: HTMLElement | null =
				this._outline.view.containerEl.querySelector(
					".view-header-left .view-header-nav-buttons"
				);
			viewHeaderLeft?.appendChild(button);
		} else {
			console.error(
				"Invalid window location: ",
				this._plugin.settings.windowLocation
			);
		}

		return button;
	}

	private _handleMouseEnter(): void {
		if (!this._outline.windowVisible) {
			this._outline.showWindow({
				scrollBlock: "start",
			});
		}

		if (this._plugin.settings.toggleOnHover) {
			this._outline.clearWindowHideTimeout();
		}
	}

	private _handleMouseLeave(): void {
		if (this._outline.windowVisible && !this._outline.windowPinned) {
			this._outline.hideWindow(100);
		}
	}

	handleClick(): void {
		if (this._outline.windowVisible) {
			if (this._plugin.settings.toggleOnHover) {
				if (!this._outline.windowPinned) {
					this._outline.windowPinned = true;
					return;
				} else {
					this._outline.windowPinned = false;
					this._outline.clearWindowHideTimeout();
				}
			}
			this._outline.hideWindow();
		} else {
			this._outline.showWindow({
				scrollBlock: "start",
			});
			if (this._plugin.settings.toggleOnHover) {
				this._outline.windowPinned = true;
			}
		}
	}

	show(): void {
		if (this.visible) return;
		// Workaround because we have no view.onClose event to deactivate buttons properly.
		this.active = this.visible;
		this.visible = true;
	}

	hide(): void {
		if (!this.visible) return;
		this.visible = false;
	}

	destroy(): void {
		this._containerEl.remove();
	}
}
