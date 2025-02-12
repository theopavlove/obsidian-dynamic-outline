import { debounce, MarkdownView, Notice, Plugin, Workspace } from "obsidian";
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

	private debounceHandler = debounce((event: Event) => {
		const target = event.target as HTMLElement;
		if (!target?.classList.contains("dynamic-outline-content-container")) {
			const mdView = this.stateManager.getActiveMDView();
			if (mdView) {
				const window: OutlineWindow =
					this.stateManager.getWindowInView(mdView);
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

		this.stateManager.createButtonsInOpenViews();
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.stateManager.createButtonsInOpenViews();
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
					const mdView = this.stateManager.getActiveMDView();
					if (mdView) {
						this.stateManager
							.getWindowInView(mdView)
							.highlightCurrentHeading();
					}
				})
			);
		}

		this.addCommand({
			id: "toggle-dynamic-outline",
			name: "Toggle for current file",
			checkCallback: (checking: boolean) => {
				const mdView = this.stateManager.getActiveMDView();
				if (mdView) {
					if (!checking) {
						const button: OutlineButton =
							this.stateManager.getButtonInView(mdView);
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
		//@ts-ignore:2239
		const setting = this.app.setting;

		// Don't reload disabled plugins
		if (!plugins.enabledPlugins.has(WINDOW_ID)) return;

		await plugins.disablePlugin(WINDOW_ID);
		await plugins.enablePlugin(WINDOW_ID);
		await setting.openTabById(WINDOW_ID);
		new Notice(`Dynamic Outline has been reloaded`);
	}

	// Set default element to be `document.body`, as it is the place
	// where the Style Settings plugin applies its' `css-settings-manager` class.
	// The value is dynamically changed, so we need to pick it from this class directly.
	getCssVariableAsNumber(
		variableName: string,
		element: HTMLElement = document.body
	): number | null {
		const rawValue = getComputedStyle(element)
			.getPropertyValue(variableName)
			.trim();
		const numericValue = parseFloat(rawValue);
		return isNaN(numericValue) ? null : numericValue;
	}
}
