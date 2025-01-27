import { debounce, MarkdownView, Notice, Plugin } from "obsidian";
import OutlineButton from "src/components/outlineButton";
import OutlineStateManager from "src/components/outlineStateManager";
import OutlineWindow from "src/components/outlineWindow";
import {
	DEFAULT_SETTINGS,
	DynamicOutlinePluginSettings,
	DynamicOutlineSettingTab,
} from "src/settings/settings";

export const WINDOW_ID = "dynamic-outline";
export const BUTTON_CLASS = "dynamic-outline-button";
export const LUCID_ICON_NAME = "list";

export default class DynamicOutlinePlugin extends Plugin {
	private stateManager: OutlineStateManager;
	settings: DynamicOutlinePluginSettings;

	getActiveMarkdownView = (): MarkdownView | null => {
		return this.app.workspace.getActiveViewOfType(MarkdownView);
	};

	getActiveMarkdownViews = (): MarkdownView[] => {
		return this.app.workspace
			.getLeavesOfType("markdown")
			.map((leaf) => leaf.view as MarkdownView);
	};

	private debounceHandler = debounce((event: Event) => {
		const target = event.target as HTMLElement;
		if (!target?.classList.contains("dynamic-outline-content-container")) {
			const mdView = this.getActiveMarkdownView();
			if (mdView) {
				const window: OutlineWindow =
					this.stateManager.getWindow(mdView);
				window.highlightCurrentHeading();
			}
		}
	}, 0);

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new DynamicOutlineSettingTab(this.app, this));

		// Provide support for the Style Settings plugin:
		// https://github.com/mgmeyers/obsidian-style-settings
		this.app.workspace.trigger("parse-style-settings");

		this.stateManager = OutlineStateManager.initialize(this);

		this.stateManager.createButtonsInActiveViews();
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.stateManager.createButtonsInActiveViews();
			})
		);

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.stateManager.handleMetadataChanged();
			})
		);

		this.registerEvent(
			this.app.metadataCache.on("changed", () => {
				this.stateManager.handleMetadataChanged();
			})
		);

		if (this.settings.toggleAutomatically) {
			this.registerEvent(
				// BUG: probably should pick another event.
				// E.g., if there are two tabs and the setting is toggled
				// then the inactive tab will not have an effect.
				this.app.workspace.on("file-open", () => {
					this.stateManager.handleFileOpen();
				})
			);
		}

		if (this.settings.highlightCurrentHeading) {
			activeWindow.document.addEventListener(
				"scroll",
				this.debounceHandler,
				true
			);

			this.registerEvent(
				this.app.metadataCache.on("changed", () => {
					const mdView = this.getActiveMarkdownView();
					if (mdView) {
						this.stateManager
							.getWindow(mdView)
							.highlightCurrentHeading();
					}
				})
			);
		}

		this.addCommand({
			id: "toggle-dynamic-outline",
			name: "Toggle for current file",
			checkCallback: (checking: boolean) => {
				const mdView = this.getActiveMarkdownView();
				if (mdView) {
					if (!checking) {
						const button: OutlineButton =
							this.stateManager.getButton(mdView);
						button.handleClick();
					}
					return true;
				}
				return false;
			},
		});
	}

	onunload() {
		this.stateManager.removeAll();
		activeWindow.document.removeEventListener(
			"scroll",
			this.debounceHandler,
			true
		);
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

	async reloadPlugin() {
		//@ts-ignore:2239
		const plugins = this.app.plugins;

		// Don't reload disabled plugins
		if (!plugins.enabledPlugins.has(WINDOW_ID)) return;

		await plugins.disablePlugin(WINDOW_ID);
		await plugins.enablePlugin(WINDOW_ID);
		new Notice(`Dynamic Outline has been reloaded`);
	}
}
