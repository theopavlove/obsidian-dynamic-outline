import DynamicOutlinePlugin, { WINDOW_ID } from "main";
import { HeadingCache, MarkdownView } from "obsidian";
import OutlineButton from "./outlineButton";
import OutlineHeadings from "./outlineHeadings";
import DynamicLiElement from "./outlineLiElement";
import OutlineStateManager from "./outlineStateManager";
import SearchContainer from "./searchContainer";

export default class OutlineWindow {
	public static hideTimeout: NodeJS.Timeout | null = null;

	private _stateManager: OutlineStateManager;
	private _plugin: DynamicOutlinePlugin;
	private _view: MarkdownView;
	private _containerEl: HTMLDivElement;
	private _dynamicHeadings: OutlineHeadings;
	private _latestHeadings: HeadingCache[] = [];
	private _pinned = false;

	constructor(plugin: DynamicOutlinePlugin, view: MarkdownView) {
		this._plugin = plugin;
		this._view = view;
		this._stateManager = OutlineStateManager.getInstance();
		this._containerEl = this.createElement();
		this._dynamicHeadings = new OutlineHeadings(this._plugin, this._view);

		this.setupEventListeners();
	}

	get visible(): boolean {
		const windowInView: HTMLElement | null =
			this._view.containerEl.querySelector(`#${WINDOW_ID}`);
		return !!windowInView;
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
		this._plugin.registerDomEvent(
			this._containerEl.querySelector("input") as HTMLInputElement,
			"keydown",
			(event: KeyboardEvent) => {
				this.handleKeyDown(event);
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

	private getVisibleLiItems(): Array<HTMLElement> {
		return Array.from(
			this._containerEl.querySelectorAll("li:not(.outline-item-hidden")
		);
	}

	private setHovered(itemList: Array<HTMLElement>, newIndex: number): void {
		itemList.forEach((item, index) => {
			item.classList.toggle("hovered", index === newIndex);
		});
	}

	private handleKeyDown(event: KeyboardEvent): void {
		/**
		 * Retrieves the current index of the item in the list.
		 *
		 * The current index is determined by the item that is either hovered or highlighted.
		 * If no item is hovered, the method looks for the highlighted item.
		 * If neither an hovered nor a highlighted item is found, the method returns 0.
		 *
		 * @returns {number} The index of the current item in the list.
		 */
		const getCurrentIndex = () => {
			const hoveredIndex = itemList.findIndex((item) =>
				item.classList.contains("hovered")
			);
			return hoveredIndex !== -1
				? hoveredIndex
				: itemList.findIndex((item) =>
						item.classList.contains("highlight")
				  ) || 0;
		};

		const itemList: Array<HTMLElement> = this.getVisibleLiItems();
		const itemListLength: number = itemList.length;

		let currentIndex: number = getCurrentIndex();
		let newIndex = currentIndex;

		switch (event.key) {
			case "ArrowDown":
			case "Tab":
				event.preventDefault();
				newIndex = event.shiftKey
					? (currentIndex + itemListLength - 1) % itemListLength
					: (currentIndex + 1) % itemListLength;
				break;
			case "ArrowUp":
				event.preventDefault();
				newIndex = (currentIndex + itemListLength - 1) % itemListLength;
				break;
			case "Enter":
				event.preventDefault();
				if (currentIndex >= 0) {
					const selectedOutlineItem: HTMLLIElement = itemList[
						currentIndex
					] as HTMLLIElement;
					selectedOutlineItem.click();
				}
				break;
			case "Escape":
				event.preventDefault();
				this.hide();
				// this.removeHovered();
				break;
		}

		if (newIndex !== currentIndex) {
			this.setHovered(itemList, newIndex);
			itemList[newIndex].scrollIntoView({
				block: "nearest",
			});
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
			const itemIncludesValue: boolean = !!item.textContent
				?.toLowerCase()
				.includes(value);
			item.classList.toggle("outline-item-hidden", !itemIncludesValue);
		});

		// Set the current index to the first visible item
		const itemList: Array<HTMLElement> = this.getVisibleLiItems();
		this.setHovered(itemList, 0);
	}

	private handleMouseEnter(): void {
		this.clearHideTimeout();

		const itemList: Array<HTMLElement> = this.getVisibleLiItems();
		itemList.forEach((item) => {
			item.classList.remove("hovered");
		});
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
		const editingToolbar: HTMLElement | null = document.getElementById(
			"cMenuToolbarModalBar"
		);
		const isTop: boolean =
			editingToolbar !== null && editingToolbar.classList.contains("top");

		this._containerEl.classList.toggle("obstruction-top", isTop);
	}

	private checkForLocation(): void {
		this._containerEl.classList.toggle(
			"location-left",
			this._plugin.settings.windowLocation === "left"
		);
	}

	removeHovered(): void {
		const itemList = this.getVisibleLiItems();
		itemList.forEach((liElement) => {
			liElement.classList.remove("hovered");
		});
	}

	updateView(view: MarkdownView) {
		this._view = view;
		this._dynamicHeadings.updateView(view);
	}

	highlightCurrentHeading(scrollBlock: ScrollLogicalPosition = "nearest") {
		const binarySearchClosestHeading = (
			headings: HeadingCache[],
			targetLine: number
		): number => {
			let closestIndex = 0;
			let low = 0;
			let high = headings.length - 1;
			while (low <= high) {
				const mid = Math.floor((low + high) / 2);
				const midLine = headings[mid].position.start.line;
				if (midLine <= targetLine) {
					closestIndex = mid;
					low = mid + 1;
				} else {
					high = mid - 1;
				}
			}
			return closestIndex;
		};

		const currentScrollPosition: number =
			this._view.currentMode.getScroll();

		// TODO: Should cache it and not call every time. (?)
		const headings: HeadingCache[] = this.getHeadings();

		if (headings.length == 0) {
			return;
		}

		const closestIndex: number = binarySearchClosestHeading(
			headings,
			currentScrollPosition + 1
		);

		// TODO: Should cache this thing and not call it every time. (?)
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
		const arraysAreEqual = (
			a: HeadingCache[],
			b: HeadingCache[]
		): boolean => {
			return (
				a.length === b.length &&
				a.every(
					(item, index) =>
						item.heading === b[index].heading &&
						item.level === b[index].level
				)
			);
		};

		// It should always be present as the .containerEl is always created (is it?).
		const ulElement: HTMLUListElement | null =
			this._containerEl.querySelector("ul");
		if (!ulElement) return;

		const dynamicLi: DynamicLiElement = new DynamicLiElement(
			this._plugin,
			this._view
		);

		const headings: HeadingCache[] = this.getHeadings();
		if (
			headings.length > 0 &&
			arraysAreEqual(headings, this._latestHeadings)
		) {
			const currentLi = ulElement.querySelectorAll("li");
			currentLi.forEach((liElement, index) => {
				dynamicLi.updateLiElementLine(liElement, headings[index]);
			});
			return;
		}

		this._latestHeadings = headings;
		ulElement.empty();

		headings?.forEach((heading) => {
			const liElement: HTMLLIElement = dynamicLi.createLiElement(heading);
			ulElement.append(liElement);
		});

		if (this._plugin.settings.highlightCurrentHeading) {
			this.highlightCurrentHeading();
		}
	}

	show(options?: { scrollBlock?: ScrollLogicalPosition }): void {
		if (this.visible) return;

		this.checkForObstructions();
		this.checkForLocation();
		this.update();
		this._view.contentEl.append(this._containerEl);

		const button: OutlineButton = this._stateManager.getButtonInView(
			this._view
		);
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

	// TODO: should trigger clearInput() for the search field
	hide(): void {
		if (!this.visible) return;

		// Remove the container.
		this._containerEl.remove();

		// Remove the "hovered" effect on each heading.
		this.removeHovered();

		// Turn off the button.
		const button: OutlineButton = this._stateManager.getButtonInView(
			this._view
		);
		button.active = false;

		// Remove optional pinning.
		if (this._plugin.settings.toggleOnHover) {
			this.pinned = false;
		}
	}

	toggle(): void {
		this.visible ? this.hide() : this.show();
	}
}
