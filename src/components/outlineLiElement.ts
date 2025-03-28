import DynamicOutlinePlugin from "main";
import { HeadingCache, MarkdownView } from "obsidian";
import OutlineManager from "./OutlineManager";
import SearchContainer from "./searchContainer";
import Outline from "src/components/Outline";

export default class DynamicLiElement {
	private _plugin: DynamicOutlinePlugin;
	private _outline: Outline;

	constructor(plugin: DynamicOutlinePlugin, outline: Outline) {
		this._plugin = plugin;
		this._outline = outline;
	}

	public createLiElement(
		heading: HeadingCache,
		tab_level: number = heading.level
	): HTMLLIElement {
		const tab_size: number =
			this._plugin.getCssVariableAsNumber("--dynamic-outline-tab-size") ??
			24;

		const liElement: HTMLLIElement = createEl("li", {
			attr: {
				"data-heading-line": heading.position.start.line,
				style: `padding-left: ${
					(tab_level - 1) * tab_size
				}px !important`,
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
		liElement.onclick = () => {
			if (!this._outline.view.file) return;

			this._outline.view.leaf.openFile(this._outline.view.file, {
				eState: { line: heading.position.start.line },
			});

			setTimeout(() => {
				this._outline.view.currentMode.applyScroll(
					heading.position.start.line
				);
			}, 0);

			if (this._plugin.settings.resetSearchFieldOnHeadingClick) {
				const window = this._outline.outlineWindow;
				const searchContainerHTML: HTMLDivElement | null = window
					._getContainerElement()
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

			// Probably, should be a better option.
			this._plugin.runCommand("editor:focus");
		};

		liElement.addEventListener("mouseenter", () => {
			liElement.classList.add("hovered");
		});

		liElement.addEventListener("mouseleave", () => {
			liElement.classList.remove("hovered");
		});
	}
}
