import DynamicOutlinePlugin from "main";

export { SearchField as InputWithClear };

class SearchField {
	private searchContainer: HTMLDivElement;
	private inputField: HTMLInputElement;
	private clearButton: HTMLDivElement;
	private plugin: DynamicOutlinePlugin;

	constructor(searchContainer: HTMLDivElement, plugin: DynamicOutlinePlugin) {
		this.plugin = plugin;
		this.searchContainer = searchContainer;

		this.inputField = this.searchContainer.createEl("input", {
			attr: {
				placeholder: "Search headings...",
				type: "search",
			},
		});

		this.clearButton = this.searchContainer.createEl("div", {
			cls: "search-input-clear-button dynamic-outline-search-clear-button",
			attr: {
				"aria-label": "Clear search",
			},
		});

		this.setupEventListeners();
	}
	private setupEventListeners(): void {
		this.plugin.registerDomEvent(this.searchContainer, "input", () => {
			this.toggleClearButton();
		});

		this.plugin.registerDomEvent(this.clearButton, "click", () => {
			this.clearInput();
		});

        
	}

	private toggleClearButton(): void {
		if (this.inputField.value.length > 0) {
			this.clearButton.classList.add("visible");
            this.inputField.classList.add("has-content");
		} else {
            this.clearButton.classList.remove("visible");
            this.inputField.classList.remove("has-content");
		}
	}

	private clearInput(): void {
		this.inputField.value = "";
		const inputEvent = new Event("input", {
			bubbles: true,
			cancelable: true,
		});
		this.inputField.dispatchEvent(inputEvent);
		this.inputField.focus();
	}
}
