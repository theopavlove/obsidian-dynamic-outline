import DynamicOutlinePlugin, { WINDOW_ID } from "main";
import { HeadingCache } from "obsidian";
import OutlineLiElement from "./outlineLiElement";
import SearchContainer from "./searchContainer";
import * as fuzzysort from "fuzzysort";
import Outline from "src/components/Outline";

export default class OutlineWindow {
	public static hideTimeout: NodeJS.Timeout | null = null;

	private _plugin: DynamicOutlinePlugin;
	private _outline: Outline;
	private _containerEl: HTMLDivElement;
	private _latestHeadings: HeadingCache[] = [];
	private _pinned = false;

	constructor(plugin: DynamicOutlinePlugin, outline: Outline) {
		this._plugin = plugin;
		this._outline = outline;
		this._containerEl = this._createElement();
		this._setupEventListeners();
	}

	get visible(): boolean {
		const isInDOM: boolean = this._containerEl.isConnected;
		const isHidden: boolean =
			this._containerEl.classList.contains("hidden");
		return isInDOM && !isHidden;
	}

	set visible(value: boolean) {
		const isInDOM: boolean = this._containerEl.isConnected;
		if (!isInDOM) {
			this._connectToDOM(this._containerEl);
		}
		this._containerEl.classList.toggle("hidden", !value);
	}

	get pinned(): boolean {
		return this._pinned;
	}

	set pinned(value: boolean) {
		this._pinned = value;

		this._outline.buttonPinned = value;

		if (this._plugin.settings.toggleOnHover && !value) {
			this.hide();
		}
	}

	toggle(): void {
		this.visible ? this.hide() : this.show();
	}

	show(options?: { scrollBlock?: ScrollLogicalPosition }): void {
		if (this.visible) return;

		this._checkForLocation();
		// this.visible = true;
		this._setVisibilityBasedOnEditingToolbar();

		this.update();

		this._outline.buttonActive = true;

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

		this.visible = false;
		this.removeHovered();
		this._outline.buttonActive = false;
		this._plugin.runCommand("editor:focus");

		if (this._plugin.settings.toggleOnHover) {
			this.pinned = false;
		}
	}

	destroy(): void {
		this._clearHideTimeout();
		this._containerEl.remove();
	}

	update(): void {
		if (!this.visible) return;

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

		const dynamicLi: OutlineLiElement = new OutlineLiElement(
			this._plugin,
			this._outline
		);

		const headings: HeadingCache[] = this._outline.outlineHeadings.headings;

		// Check if the headings are the same as before and, if so,
		// update only the positions of the li elements.
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

		const fragment: DocumentFragment = document.createDocumentFragment();
		if (this._plugin.settings.dynamicHeadingIndentation) {
			let stack: Array<number> = [];
			headings?.forEach((heading) => {
				while (
					stack.length > 0 &&
					heading.level <= stack[stack.length - 1]
				) {
					stack.pop();
				}
				stack.push(heading.level);

				fragment.append(
					dynamicLi.createLiElement(heading, stack.length)
				);
			});
		} else {
			headings?.forEach((heading) => {
				fragment.append(dynamicLi.createLiElement(heading));
			});
		}
		ulElement.appendChild(fragment);

		const shouldHideSearchBar: boolean =
			this._plugin.settings.autoHideSearchBar &&
			headings.length < this._plugin.settings.minHeadingsToHideSearchBar;

		const searchFieldElement: HTMLDivElement | null =
			this._containerEl.querySelector(
				".dynamic-outline-search-container"
			);
		searchFieldElement?.classList.toggle("hidden", shouldHideSearchBar);

		if (this._plugin.settings.highlightCurrentHeading) {
			this.highlightCurrentHeading();
		}
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
			this._outline.view.currentMode.getScroll();

		// TODO: Should cache it and not call every time. (?)
		const headings: HeadingCache[] = this._outline.outlineHeadings.headings;

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

	removeHovered(): void {
		const itemList = this.getVisibleLiItems();
		itemList.forEach((liElement) => {
			liElement.classList.remove("hovered");
		});
	}

	private _setupEventListeners() {
		this._plugin.registerDomEvent(
			this._containerEl.querySelector("input") as HTMLInputElement,
			"input",
			() => {
				this._filterItems();
			}
		);

		this._plugin.registerDomEvent(
			this._containerEl.querySelector("input") as HTMLInputElement,
			"keydown",
			(event: KeyboardEvent) => {
				this._handleKeyDown(event);
			}
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

	private _handleKeyDown(event: KeyboardEvent): void {
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

	private _filterItems(): void {
		// TODO: should be a better way to target the input field
		// considering we already have a dedicated class
		const inputField: HTMLInputElement = this._containerEl.querySelector(
			"input"
		) as HTMLInputElement;
		const value: string = inputField.value.toLowerCase();
		const outlineItems: NodeListOf<HTMLLIElement> =
			this._containerEl.querySelectorAll("li");

		let filteredItems: HTMLLIElement[];
		if (value === "") {
			filteredItems = Array.from(outlineItems);
		} else {
			filteredItems = fuzzysort
				.go(value, Array.from(outlineItems), {
					key: "textContent",
				})
				.map((result) => result.obj);
		}

		outlineItems.forEach((item: HTMLLIElement) => {
			item.classList.toggle(
				"outline-item-hidden",
				!filteredItems.includes(item)
			);
		});

		// Set the current index to the first visible item
		const itemList: Array<HTMLElement> = this.getVisibleLiItems();
		this.setHovered(itemList, 0);
	}

	private _handleMouseEnter(): void {
		this._clearHideTimeout();

		const itemList: Array<HTMLElement> = this.getVisibleLiItems();
		itemList.forEach((item) => {
			item.classList.remove("hovered");
		});
	}

	private _handleMouseLeave(): void {
		if (this._plugin.settings.toggleOnHover && !this.pinned) {
			OutlineWindow.hideTimeout = setTimeout(() => {
				this.hide();
			}, 100);
		}
	}

	public _getContainerElement(): HTMLDivElement {
		return this._containerEl;
	}

	public _clearHideTimeout(): void {
		if (OutlineWindow.hideTimeout) {
			clearTimeout(OutlineWindow.hideTimeout);
			OutlineWindow.hideTimeout = null;
		}
	}

	private _createElement(): HTMLDivElement {
		const mainElement: HTMLDivElement = createEl("div", {
			cls: "hidden",
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

	private _setVisibilityBasedOnEditingToolbar(): void {
		const editingToolbar: HTMLElement | null = document.getElementById(
			"editingToolbarModalBar"
		);
		if (!editingToolbar) {
			this.visible = true;
			return;
		}

		// Check for Editing Toolbar at the top of the screen
		const isTop: boolean = editingToolbar.classList.contains("top");
		this._containerEl.classList.toggle("obstruction-top", isTop);

		// An awful hack to make sure the Outline does not shift the entire viewport upwards.
		// It is needed because the EditingToolbar populates DOM with invisible pixels.
		if (!isTop) {
			const displayValue: string = editingToolbar.style.display;

			editingToolbar.style.setProperty("display", "none", "important");

			this.visible = true;

			setTimeout(() => {
				editingToolbar.style.display = displayValue;
			}, 0);
			return;
		}

		this.visible = true;
	}

	private _checkForLocation(): void {
		this._containerEl.classList.toggle(
			"location-left",
			this._plugin.settings.windowLocation === "left"
		);
	}

	private _connectToDOM(container: HTMLDivElement): void {
		this._outline.view.contentEl.append(container);
	}
}
