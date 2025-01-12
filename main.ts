import { HeadingCache, MarkdownView, Plugin, WorkspaceLeaf } from "obsidian";
import { ButtonManager } from "src/components/buttonManager";
import { WindowManager } from "src/components/floatingWindow/windowManager";
import { HeadingsManager } from "src/components/headingsManager";
import {
	DEFAULT_SETTINGS,
	DynamicOutlinePluginSettings,
	DynamicOutlineSettingTab,
} from "src/settings/settings";

export default class DynamicOutlinePlugin extends Plugin {
	headingsManager: HeadingsManager = new HeadingsManager();
	buttonManager: ButtonManager = new ButtonManager();
	windowManager: WindowManager = new WindowManager();
	settings: DynamicOutlinePluginSettings;

	getAllMarkdownLeaves = (): WorkspaceLeaf[] => {
		return this.app.workspace.getLeavesOfType("markdown");
	};

	getActiveMarkdownView = (): MarkdownView | null => {
		return this.app.workspace.getActiveViewOfType(MarkdownView);
	};

	handleMetadataChanged = (): void => {
		const markdownView: MarkdownView | null = this.getActiveMarkdownView();
		const windowContainer: HTMLElement | null | undefined =
			this.windowManager.getWindowFromView(markdownView);

		if (!windowContainer) {
			return;
		}

		const headings: HeadingCache[] =
			this.headingsManager.getHeadingsForView(markdownView, this);

		this.windowManager.updateWindowWithHeadings(
			windowContainer,
			headings,
			markdownView,
			this
		);
	};

	highlightCurrentHeading = (): void => {
		const markdownView: MarkdownView | null = this.getActiveMarkdownView();
		const windowContainer: HTMLElement | null | undefined =
			this.windowManager.getWindowFromView(markdownView);
		if (!windowContainer) return;

		const headings: HeadingCache[] =
			this.headingsManager.getHeadingsForView(markdownView, this);

		const currentScrollPosition: number | undefined =
			markdownView?.currentMode.getScroll();

		// headings.forEach((heading) => {
		// 	heading.

		// Find a heading with position <= currentScrollPosition and add a highlight class to it
		const closestHeading: HeadingCache | null = headings.reduce(
			(prev, current) => {
				if (
					currentScrollPosition !== undefined &&
					current.position.start.line <= currentScrollPosition + 1 &&
					(!prev ||
						prev.position.start.line < current.position.start.line)
				) {
					return current;
				}
				return prev;
			},
			null as HeadingCache | null
		);

		if (closestHeading) {
			const closestHeadingElement: HTMLElement | null =
				windowContainer.querySelector(
					`li[data-heading-line="${closestHeading.position.start.line}"]`
				);

			if (closestHeadingElement) {
				const allHeadingElements =
					windowContainer.querySelectorAll("li");
				allHeadingElements.forEach((element) =>
					element.classList.remove("highlight")
				);
				closestHeadingElement.classList.add("highlight");
			}
		} else {
			// Add to the first heading
			const firstHeadingElement: HTMLElement | null =
				windowContainer.querySelector("li");
			if (firstHeadingElement) {
				firstHeadingElement.classList.add("highlight");
			}
		}
	};

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new DynamicOutlineSettingTab(this.app, this));

		// Provide support for the Style Settings plugin:
		// https://github.com/mgmeyers/obsidian-style-settings
		this.app.workspace.trigger("parse-style-settings");

		// Main trigger for the outline display
		this.buttonManager.addButtonToLeaves(this);
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				this.buttonManager.addButtonToLeaves(this);
			})
		);

		if (this.settings.toggleAutomatically) {
			this.registerEvent(
				this.app.workspace.on("file-open", () => {
					this.windowManager.handleFileOpen(this);
				})
			);
		}

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.handleMetadataChanged();
			})
		);
		this.registerEvent(
			this.app.metadataCache.on("changed", () => {
				this.handleMetadataChanged();
			})
		);

		// TODO: better code
		if (this.settings.highlightCurrentHeading) {
			activeWindow.document.addEventListener(
				"scroll",
				() => {
					this.highlightCurrentHeading();
				},
				true
			);
		}

		this.addCommand({
			id: "toggle-dynamic-outline",
			name: "Toggle for current file",
			checkCallback: (checking: boolean) => {
				const markdownView: MarkdownView | null =
					this.getActiveMarkdownView();

				if (markdownView) {
					if (!checking) {
						const windowContainer: HTMLElement | null | undefined =
							this.windowManager.getWindowFromView(markdownView);
						if (windowContainer) {
							this.windowManager.hideWindowFromView(markdownView);
						} else {
							this.windowManager.createWindowInView(
								markdownView,
								this.headingsManager.getHeadingsForView(
									markdownView,
									this
								),
								this
							);
						}
					}
					return true;
				}
				return false;
			},
		});
	}

	onunload() {
		this.buttonManager.removeButtonFromLeaves(this);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
