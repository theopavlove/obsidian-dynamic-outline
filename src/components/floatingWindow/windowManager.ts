import DynamicOutlinePlugin from "main";
import { HeadingCache, MarkdownView } from "obsidian";
import { BUTTON_CLASS } from "../buttonManager";
import { InputWithClear } from "./inputField";

export { WindowManager };

class WindowManager {
	private _createWindowHTML(plugin: DynamicOutlinePlugin): HTMLDivElement {
		const mainElement: HTMLDivElement = createEl("div", {
			attr: {
				id: "dynamic-outline",
			},
		});

		const searchContainer: HTMLDivElement = mainElement.createEl("div", {
			cls: "dynamic-outline-search-container",
		});
		new InputWithClear(searchContainer, plugin);

		const contentElement: HTMLDivElement = mainElement.createEl("div", {
			cls: "dynamic-outline-content-container",
		});
		contentElement.createEl("ul", {});

		return mainElement;
	}

	private _createWindowListElement(heading: HeadingCache): HTMLLIElement {
		const liElement: HTMLLIElement = createEl("li", {
			attr: {
				"data-heading-line": heading.position.start.line,
			},
		});
		const aElement = createEl("a", {
			cls: `heading-level-${heading.level}`,
			text: heading.heading,
		});
		liElement.append(aElement);

		return liElement;
	}

	createWindowInView(
		view: MarkdownView,
		headings: HeadingCache[],
		plugin: DynamicOutlinePlugin
	): HTMLElement {
		const windowContainer: HTMLDivElement = this._createWindowHTML(plugin);
		this.updateWindowWithHeadings(windowContainer, headings, view, plugin);

		// Should probably move it to the `_createWindowHTML`
		const inputField: HTMLInputElement | null =
			windowContainer.querySelector("input");
		if (inputField) {
			plugin.registerDomEvent(inputField, "input", () => {
				const value: string = inputField.value.toLowerCase();
				const outlineItems = windowContainer.querySelectorAll("li");
				outlineItems?.forEach((item: HTMLLIElement) => {
					if (item.textContent?.toLowerCase().includes(value)) {
						item.classList.remove("outline-item-hidden");
					} else {
						item.classList.add("outline-item-hidden");
					}
				});
			});
		}
		view.contentEl.append(windowContainer);

		if (plugin.settings.autofocusSearchOnOpen) {
			inputField?.focus();
		}

		if (plugin.settings.highlightCurrentHeading) {
			plugin.highlightCurrentHeading("start");
		}

		const button: HTMLButtonElement | null =
			plugin.buttonManager.getButtonFromLeaf(view.leaf);
		button?.classList.add("button-active");

		return windowContainer;
	}

	updateWindowWithHeadings(
		windowContainer: HTMLElement,
		headings: HeadingCache[],
		view: MarkdownView | null,
		plugin: DynamicOutlinePlugin
	) {
		const ulElement: HTMLUListElement | null =
			windowContainer.querySelector("ul");
		if (!ulElement) return;

		ulElement.empty();

		headings?.forEach((heading) => {
			const liElement = this._createWindowListElement(heading);
			ulElement.append(liElement);

			liElement.onclick = function () {
				// @ts-ignore: TS2345
				view.leaf.openFile(view.file, {
					eState: { line: heading.position.start.line },
				});
				setTimeout(() => {
					view?.currentMode.applyScroll(heading.position.start.line);
				}, 0);

				if (plugin.settings.resetSearchFieldOnHeadingClick) {
					const inputField: HTMLInputElement | null =
						windowContainer.querySelector("input");
					if (inputField) {
						// repeats the same code from inputField.ts
						inputField.value = "";
						const inputEvent = new Event("input", {
							bubbles: true,
							cancelable: true,
						});
						inputField.dispatchEvent(inputEvent);
						inputField.focus();
					}
				}
			};
		});
	}

	handleFileOpen(plugin: DynamicOutlinePlugin): void {
		const view: MarkdownView | null =
			plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const windowContainer: HTMLElement | null | undefined =
			this.getWindowFromView(view);
		const headings: HeadingCache[] | null =
			plugin.headingsManager.getHeadingsForView(view, plugin);
		if (!headings || headings.length < plugin.settings.minimumHeadings) {
			if (windowContainer) {
				this.hideWindowFromView(view);
			}
		} else {
			if (!windowContainer) {
				this.createWindowInView(view, headings, plugin);
			}
		}

		// this.updateWindowWithHeadings(windowContainer, headings, view, plugin);
	}

	// updateWindowInView(
	// 	view: MarkdownView | null,
	// 	headings: HeadingCache[],
	// 	plugin: DynamicOutlinePlugin
	// ) {
	// 	this.hideWindowFromView(view);
	// 	this.displayWindowInView(view, headings, plugin);
	// }

	getWindowFromView(
		view: MarkdownView | null
	): HTMLElement | null | undefined {
		const container: HTMLElement | null | undefined =
			view?.contentEl.querySelector("#dynamic-outline");
		return container;
	}

	// I don't like that I have to pass all 3 arguments just to close the window
	// When the window is closed, the button should be unpressed
	hideWindow(
		container: HTMLElement | null,
		button?: HTMLButtonElement | null
	): void {
		container?.remove();
		button?.classList.remove("button-active");
	}

	hideWindowFromView(view: MarkdownView | null): void {
		const container: HTMLElement | null | undefined =
			this.getWindowFromView(view);
		const button: HTMLButtonElement | null | undefined =
			view?.containerEl.querySelector(`button.${BUTTON_CLASS}`);

		container?.remove();
		button?.classList.remove("button-active");
	}
}
