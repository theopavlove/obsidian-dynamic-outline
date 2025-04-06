import DynamicOutlinePlugin from "main";
import { HeadingCache } from "obsidian";
import SearchContainer from "./searchContainer";
import Outline from "src/components/Outline";

export default class DynamicLiElement {
	private _plugin: DynamicOutlinePlugin;
	private _outline: Outline;

	constructor(plugin: DynamicOutlinePlugin, outline: Outline) {
		this._plugin = plugin;
		this._outline = outline;
	}

	createLiElement(
		heading: HeadingCache,
		tab_level: number = heading.level
	): HTMLLIElement {
		const liElement: HTMLLIElement = createEl("li", {
			cls: `tab-level-${tab_level} li-heading-level-${heading.level}`,
			attr: {
				"data-heading-line": heading.position.start.line,
			},
		});

		const aElement = createEl("a", {
			cls: `heading-level-${heading.level}`,
			text: heading.heading,
		});
		liElement.append(aElement);

		this._setupEventListener(liElement, heading);

		return liElement;
	}

	updateLiElementLine(liElement: HTMLLIElement, heading: HeadingCache): void {
		liElement.setAttribute(
			"data-heading-line",
			heading.position.start.line.toString()
		);
		this._setupEventListener(liElement, heading);
	}

	// TODO: the highlighted index should be on the top (scrollBlock="start")
	private _setupEventListener(
		liElement: HTMLLIElement,
		heading: HeadingCache
	) {
		liElement.onclick = () => this._handleClick(heading);

		liElement.addEventListener("mouseenter", () => {
			liElement.classList.add("hovered");
		});

		liElement.addEventListener("mouseleave", () => {
			liElement.classList.remove("hovered");
		});
	}

	private _handleClick(heading: HeadingCache): void {
		if (!this._outline.view.file) return;

		this._navigateToHeading(heading);
		this._resetSearchField();

		// Focus the editor after navigation
		this._plugin.runCommand("editor:focus");
	}

	private _navigateToHeading(heading: HeadingCache): void {
		const file = this._outline.view.file;
		if (!file) return;

		// Open the file at the heading's line
		this._outline.view.leaf.openFile(file, {
			eState: { line: heading.position.start.line },
		});

		// Apply scroll after a small delay to ensure the view is ready
		setTimeout(() => {
			this._outline.view.currentMode.applyScroll(
				heading.position.start.line
			);
		}, 0);

		if (this._plugin.settings.hideOutlineOnJump) {
			this._outline.outlineWindow.hide();
		}
	}

	private _resetSearchField(): void {
		if (this._plugin.settings.disableSearchClearOnJump) return;

		const window = this._outline.outlineWindow;
		const searchContainerHTML: HTMLDivElement | null = window
			.getContainerElement()
			.querySelector(
				".dynamic-outline-search-container"
			) as HTMLDivElement | null;

		if (!searchContainerHTML) return;

		const searchContainer: SearchContainer = new SearchContainer(
			this._plugin,
			searchContainerHTML
		);

		searchContainer.clearInput(false);
		window.removeHovered();
	}
}
