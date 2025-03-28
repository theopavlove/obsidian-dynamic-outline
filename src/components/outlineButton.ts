import DynamicOutlinePlugin, { BUTTON_CLASS, LUCID_ICON_NAME } from "main";
import { MarkdownView, setIcon } from "obsidian";
import OutlineManager from "./OutlineManager";
import OutlineWindow from "./outlineWindow";
import Outline from "src/components/Outline";

export default class OutlineButton {
	private _plugin: DynamicOutlinePlugin;
	private _outline: Outline;
	private _containerEl: HTMLButtonElement;

	constructor(plugin: DynamicOutlinePlugin, outline: Outline) {
		this._plugin = plugin;
		this._outline = outline;
		this._containerEl = this.createElement();

		this.setupEventListeners();
	}

	get visible(): boolean {
		const buttonInView = this._outline.view.containerEl.querySelector(
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

	set pinned(value: boolean) {
		this._containerEl.classList.toggle("pinned", value);
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
		if (!this._outline.isWindowVisible) {
			this._outline.showWindow({
				scrollBlock: "start",
			});
		}

		if (this._plugin.settings.toggleOnHover) {
			this._outline.clearWindowHideTimeout();
		}
	}

	private handleMouseLeave(): void {
		if (this._outline.isWindowVisible && !this._outline.isWindowPinned) {
			this._outline.hideWindow(100);
		}
	}

	private getViewActionButtons(): HTMLElement | null {
		return this._outline.view.containerEl.querySelector(".view-actions");
	}

	private getViewHeaderLeft(): HTMLElement | null {
		return this._outline.view.containerEl.querySelector(
			".view-header-left .view-header-nav-buttons"
		);
	}

	handleClick(): void {
		if (this._outline.isWindowVisible) {
			if (this._plugin.settings.toggleOnHover) {
				if (!this._outline.isWindowPinned) {
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
