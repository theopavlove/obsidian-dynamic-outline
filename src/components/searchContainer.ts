import DynamicOutlinePlugin from "main";

export default class SearchContainer {
	public element: HTMLDivElement;
	public inputField: HTMLInputElement;
	public clearButton: HTMLDivElement;
	private _plugin: DynamicOutlinePlugin;

	constructor(plugin: DynamicOutlinePlugin, element?: HTMLDivElement) {
		this._plugin = plugin;

		if (element) {
			this.element = element;
			this.inputField = this.element.querySelector(
				"input"
			) as HTMLInputElement;
			this.clearButton = this.element.querySelector(
				".dynamic-outline-search-clear-button"
			) as HTMLDivElement;
		} else {
			this.element = createEl("div", {
				cls: "dynamic-outline-search-container",
			});

			this.inputField = createEl("input", {
				attr: {
					placeholder: "Search headings…",
					type: "search",
				},
			});
			this.element.appendChild(this.inputField);

			this.clearButton = createEl("div", {
				cls: "search-input-clear-button dynamic-outline-search-clear-button",
				attr: {
					"aria-label": "Clear search",
				},
			});
			this.element.appendChild(this.clearButton);

			this.setupEventListeners();
		}
	}

	private setupEventListeners(): void {
		// this._plugin.registerDomEvent(this.element, "input", () => {
		// 	this._toggleClearButton();
		// });
		this._plugin.registerDomEvent(this.inputField, "input", () => {
			this.handleInput();
		});
		this._plugin.registerDomEvent(this.clearButton, "click", () => {
			this.clearInput();
		});
	}

	public clearInput(focusInputField: boolean = true): void {
		this.inputField.value = "";

		const inputEvent = new Event("input", {
			bubbles: true,
			cancelable: true,
		});
		this.inputField.dispatchEvent(inputEvent);

		if (focusInputField) {
			this.inputField.focus();
		}
	}

	private handleInput(): void {
		if (this.inputField.value.length > 0) {
			// Show the clear button and add a class to indicate content
			this.clearButton.classList.add("visible");
			this.inputField.classList.add("has-content");
		} else {
			// Hide the clear button and remove a class to indicate no content
			this.clearButton.classList.remove("visible");
			this.inputField.classList.remove("has-content");
		}
	}
}
