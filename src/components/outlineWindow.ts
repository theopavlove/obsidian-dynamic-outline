import DynamicOutlinePlugin from "main";
import { HeadingCache, MarkdownView } from "obsidian";
import OutlineButton from "./outlineButton";
import OutlineHeadings from "./outlineHeadings";
import DynamicLiElement from "./outlineLiElement";
import OutlineStateManager from "./outlineStateManager";
import SearchContainer from "./searchContainer";

export default class OutlineWindow {
	public static hideTimeout: NodeJS.Timeout | null = null;
	public visible: boolean;

	private _pinned = false;
	private _containerEl: HTMLDivElement;
	private _dynamicHeadings: OutlineHeadings;

	private _stateManager: OutlineStateManager;
	private _plugin: DynamicOutlinePlugin;
	private _view: MarkdownView;

	constructor(plugin: DynamicOutlinePlugin, view: MarkdownView) {
		this._plugin = plugin;
		this._view = view;
		this._stateManager = OutlineStateManager.getInstance();

		this.visible = false;
		this._containerEl = this.createElement();
		this.setupEventListeners();

		this._dynamicHeadings = new OutlineHeadings(this._plugin, this._view);
	}

	get pinned(): boolean {
		return this._pinned;
	}

	set pinned(value: boolean) {
		this._pinned = value;
		if (this._plugin.settings.toggleOnHover && !value) {
			this.hide();
		}
	}

	private setupEventListeners() {
		this._plugin.registerDomEvent(
			this._containerEl.querySelector("input") as HTMLInputElement,
			"input",
			() => {
				this.filterItems();
			}
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

	private filterItems(): void {
		// TODO: should be a better way to target the input field
		// considering we already have a dedicated class
		const inputField: HTMLInputElement = this._containerEl.querySelector(
			"input"
		) as HTMLInputElement;
		const value: string = inputField.value.toLowerCase();
		const outlineItems: NodeListOf<HTMLLIElement> =
			this._containerEl.querySelectorAll("li");

		outlineItems?.forEach((item: HTMLLIElement) => {
			if (item.textContent?.toLowerCase().includes(value)) {
				item.classList.remove("outline-item-hidden");
			} else {
				item.classList.add("outline-item-hidden");
			}
		});
	}

	private handleMouseEnter(): void {
		this.clearHideTimeout();
	}

	private handleMouseLeave(): void {
		if (this._plugin.settings.toggleOnHover && !this.pinned) {
			OutlineWindow.hideTimeout = setTimeout(() => {
				this.hide();
			}, 100);
		}
	}

	public getContainerElement(): HTMLDivElement {
		return this._containerEl;
	}

	public clearHideTimeout(): void {
		if (OutlineWindow.hideTimeout) {
			clearTimeout(OutlineWindow.hideTimeout);
			OutlineWindow.hideTimeout = null;
		}
	}

	private createElement(): HTMLDivElement {
		const mainElement: HTMLDivElement = createEl("div", {
			attr: {
				id: "dynamic-outline",
			},
		});

		const searchContainer: SearchContainer = new SearchContainer(
			this._plugin
		);
		mainElement.appendChild(searchContainer.element);

		const contentElement: HTMLDivElement = createEl("div", {
			cls: "dynamic-outline-content-container",
		});
		contentElement.createEl("ul", {});
		mainElement.appendChild(contentElement);

		return mainElement;
	}

	private checkForObstructions(): void {
		// Check for Editing Toolbar at the top of the screen
		const editingToolbar = document.getElementById("cMenuToolbarModalBar");
		if (editingToolbar?.classList.contains("top")) {
			this._containerEl.classList.add("obstruction-top");
		}
	}

	highlightCurrentHeading(scrollBlock: ScrollLogicalPosition = "nearest") {
		const currentScrollPosition: number =
			this._view.currentMode.getScroll();
		const headings: HeadingCache[] = this.getHeadings();
		
		const closestIndex: number = headings.reduce(
			(
				prevIndex: number,
				current: HeadingCache,
				currentIndex: number
			) => {
				if (
					currentScrollPosition !== undefined &&
					current.position.start.line <= currentScrollPosition + 1 &&
					current.position.start.line >
						headings[prevIndex].position.start.line
				) {
					return currentIndex;
				}
				return prevIndex;
			},
			0
		);

		const allHeadingElements = this._containerEl.querySelectorAll("li");
		allHeadingElements.forEach((element, index) =>
			element.classList.toggle("highlight", index === closestIndex)
		);

		// Check if there is a highlighted heading, and scroll to it
		const element: HTMLElement | null =
			this._containerEl.querySelector("li.highlight");
		element?.scrollIntoView({
			behavior: "instant" as ScrollBehavior,
			block: scrollBlock,
		});
	}

	getHeadings(): HeadingCache[] {
		return this._dynamicHeadings.headings;
	}

	update(): void {
		// It should always be present as the .containerEl is always created (or is it?).
		const ulElement: HTMLUListElement | null =
			this._containerEl.querySelector("ul");
		if (!ulElement) return;

		ulElement.empty();

		const dynamicLi: DynamicLiElement = new DynamicLiElement(
			this._plugin,
			this._view
		);

		const headings: HeadingCache[] = this.getHeadings();
		headings?.forEach((heading) => {
			const liElement: HTMLLIElement = dynamicLi.createLiElement(heading);
			ulElement.append(liElement);
		});

		if (this._plugin.settings.highlightCurrentHeading) {
			this.highlightCurrentHeading();
		}
	}

	show(options?: { scrollBlock?: ScrollLogicalPosition }): void {
		if (this.visible) {
			return;
		}

		this.checkForObstructions();
		this.update();
		this._view.contentEl.append(this._containerEl);
		this.visible = true;

		const button: OutlineButton = this._stateManager.getButton(this._view);
		button.active = true;

		if (this._plugin.settings.autofocusSearchOnOpen) {
			const inputField: HTMLInputElement | null =
				this._containerEl.querySelector(
					"input"
				) as HTMLInputElement | null;
			inputField?.focus();
		}

		if (this._plugin.settings.highlightCurrentHeading) {
			this.highlightCurrentHeading(options?.scrollBlock);
		}
	}

	hide(): void {
		if (!this.visible) return;

		this.visible = false;
		this._containerEl.remove();

		const button: OutlineButton = this._stateManager.getButton(this._view);
		button.active = false;

		if (this._plugin.settings.toggleOnHover) {
			this.pinned = false;
		}
	}

	toggle(): void {
		this.visible ? this.hide() : this.show();
	}
}
