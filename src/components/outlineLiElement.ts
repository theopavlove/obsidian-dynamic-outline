import DynamicOutlinePlugin from "main";
import { HeadingCache, MarkdownView } from "obsidian";
import OutlineStateManager from "./outlineStateManager";
import SearchContainer from "./searchContainer";

export default class DynamicLiElement {
	private _plugin: DynamicOutlinePlugin;
	private _view: MarkdownView;
	private _stateManager: OutlineStateManager;

	constructor(plugin: DynamicOutlinePlugin, view: MarkdownView) {
		this._plugin = plugin;
		this._view = view;
		this._stateManager = OutlineStateManager.getInstance();
	}

	public createLiElement(heading: HeadingCache): HTMLLIElement {
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

		this._setupEventListener(liElement, heading);

		return liElement;
	}

	public updateLiElementLine(
		liElement: HTMLLIElement,
		heading: HeadingCache
	): void {
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
			if (!this._view.file) return;

			this._view.leaf.openFile(this._view.file, {
				eState: { line: heading.position.start.line },
			});

			setTimeout(() => {
				this._view.currentMode.applyScroll(heading.position.start.line);
			}, 0);

			if (this._plugin.settings.resetSearchFieldOnHeadingClick) {
				const window = this._stateManager.getWindowInView(this._view);
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

				searchContainer.clearInput();
				window.removeHovered();
			}
		};
		liElement.addEventListener("mouseenter", () => {
			liElement.classList.add("hovered");
		});

		liElement.addEventListener("mouseleave", () => {
			liElement.classList.remove("hovered");
		});
	}
}
