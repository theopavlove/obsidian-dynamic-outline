import DynamicOutlinePlugin from "main";
import { HeadingCache, MarkdownView } from "obsidian";
import { BUTTON_CLASS } from "../buttonManager";
import SearchField from "./inputField";

export default class WindowManager {
	private plugin: DynamicOutlinePlugin;

	constructor(plugin: DynamicOutlinePlugin) {
		this.plugin = plugin;
	}

	handleFileOpen(): void {
		const view: MarkdownView | null =
			this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const windowContainer: HTMLElement | null | undefined =
			this.getWindowFromView(view);
		const headings: HeadingCache[] | null =
			this.plugin.headingsManager.getHeadingsForView(view);

		if (
			!headings ||
			headings.length < this.plugin.settings.minimumHeadings
		) {
			if (windowContainer) {
				if (this.plugin.settings.toggleOnHover) {
					windowContainer.removeAttribute("pinned");
				}
				this.hideWindowFromView(view);
			}
		} else {
			if (!windowContainer) {
				setTimeout(() => {
					const newWindow: HTMLElement = this.createWindowForView(
						view,
						headings
					);
					if (this.plugin.settings.toggleOnHover) {
						newWindow.setAttribute("pinned", "");
					}
				}, 50);
			}
		}
	}

	private _createWindowHTML(): HTMLDivElement {
		const mainElement: HTMLDivElement = createEl("div", {
			attr: {
				id: "dynamic-outline",
			},
		});

		const searchContainer: HTMLDivElement = mainElement.createEl("div", {
			cls: "dynamic-outline-search-container",
		});
		new SearchField(searchContainer, this.plugin);

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

	createWindowForView(
		view: MarkdownView,
		headings: HeadingCache[]
	): HTMLElement {
		const windowContainer: HTMLDivElement = this._createWindowHTML();
		this.updateWindowWithHeadings(windowContainer, headings, view);

		// Should probably move it to the `_createWindowHTML`
		const inputField: HTMLInputElement | null =
			windowContainer.querySelector("input");
		if (inputField) {
			this.plugin.registerDomEvent(inputField, "input", () => {
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

		if (this.plugin.settings.autofocusSearchOnOpen) {
			inputField?.focus();
		}

		if (this.plugin.settings.highlightCurrentHeading) {
			this.plugin.highlightCurrentHeading("start");
		}

		const button: HTMLButtonElement | null =
			this.plugin.buttonManager.getButtonFromLeaf(view.leaf);
		button?.classList.add("button-active");

		// Make necessary paddings for the window
		this.checkForAbstructions(windowContainer);

		return windowContainer;
	}

	private checkForAbstructions(windowContainer: HTMLElement): void {
		// Check for Editing Toolbar at the top of the screen
		const editingToolbar = document.getElementById("cMenuToolbarModalBar");
		if (editingToolbar?.classList.contains("top")) {
			windowContainer.classList.add("obstruction-top");
		}
	}

	updateWindowWithHeadings(
		windowContainer: HTMLElement,
		headings: HeadingCache[],
		view: MarkdownView | null
	) {
		const ulElement: HTMLUListElement | null =
			windowContainer.querySelector("ul");
		if (!ulElement) return;

		ulElement.empty();

		headings?.forEach((heading) => {
			const liElement = this._createWindowListElement(heading);
			ulElement.append(liElement);

			liElement.onclick = () => {
				// @ts-ignore: TS2345
				view.leaf.openFile(view.file, {
					eState: { line: heading.position.start.line },
				});
				setTimeout(() => {
					view?.currentMode.applyScroll(heading.position.start.line);
				}, 0);

				if (this.plugin.settings.resetSearchFieldOnHeadingClick) {
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

	getWindowFromView(
		view: MarkdownView | null
	): HTMLElement | null | undefined {
		const container: HTMLElement | null | undefined =
			view?.contentEl.querySelector("#dynamic-outline");
		return container;
	}

	hideWindowFromView(view: MarkdownView | null): void {
		const container: HTMLElement | null | undefined =
			this.getWindowFromView(view);
		const button: HTMLButtonElement | null | undefined =
			view?.containerEl.querySelector(`button.${BUTTON_CLASS}`);

		this._hideWindow(container, button);
	}

	private _hideWindow(
		container: HTMLElement | null | undefined,
		button?: HTMLButtonElement | null
	): void {
		if (this.plugin.settings.toggleOnHover) {
			if (container) {
				const isPinned: boolean = container.hasAttribute("pinned");
				if (isPinned) {
					return;
				}
			}
		}
		container?.remove();
		button?.classList.remove("button-active");
	}
}
