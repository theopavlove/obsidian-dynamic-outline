import DynamicOutlinePlugin from "main";
import { App, PluginSettingTab, sanitizeHTMLToDom, Setting } from "obsidian";
import AutofocusSearchOnOpenSetting from "./options/autofocusSearchOnOpenSetting";

import HighlightOnScrollSetting from "./options/highlightOnScrollSetting";
import ResetSearchSetting from "./options/resetSearchSetting";
import ToggleAutomaticallySetting from "./options/toggleAutomaticallySetting";
import ToggleOnHoverSetting from "./options/toggleOnHoverSetting";
import WindowLocationSetting from "./options/windowLocationSetting";
import DynamicHeadingIndentationSetting from "./options/dynamicHeadingIndentationSetting";

export { DEFAULT_SETTINGS, DynamicOutlineSettingTab };
export type { DynamicOutlinePluginSettings };

interface DynamicOutlinePluginSettings {
	autofocusSearchOnOpen: boolean;
	dynamicHeadingIndentation: boolean;
	highlightCurrentHeading: boolean;
	minimumHeadings: number;
	resetSearchFieldOnHeadingClick: boolean;
	toggleAutomatically: boolean;
	toggleOnHover: boolean;
	windowLocation: string;
}

const DEFAULT_SETTINGS: DynamicOutlinePluginSettings = {
	autofocusSearchOnOpen: true,
	dynamicHeadingIndentation: true,
	highlightCurrentHeading: true,
	minimumHeadings: 1,
	resetSearchFieldOnHeadingClick: true,
	toggleAutomatically: false,
	toggleOnHover: false,
	windowLocation: "right",
};

export function htmlDescription(text: string): DocumentFragment {
	const desc: DocumentFragment = sanitizeHTMLToDom(text);
	return desc;
}

class DynamicOutlineSettingTab extends PluginSettingTab {
	plugin: DynamicOutlinePlugin;

	constructor(app: App, plugin: DynamicOutlinePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(htmlDescription("Window behavior"))
			.setHeading()
			.setDesc(
				"Customize the visibility and behavior of the outline window."
			);
		new ToggleOnHoverSetting(this.plugin, containerEl).display();
		new ToggleAutomaticallySetting(this.plugin, containerEl).display();

		// new Setting(containerEl)
		// 	.setName("TODO: Hide (don't show?) when not enough space")
		// 	.setDesc(
		// 		'Also will not trigger the "Toggle Automatically" setting if the window is too narrow.'
		// 	)
		// 	.addToggle(() => {});
		// new Setting(containerEl)
		// 	.setName("TODO: Hide on jump")
		// 	.setDesc("Close the window when you jump to a heading.")
		// 	.addToggle(() => {});
		// new Setting(containerEl)
		// 	.setName("TODO: Hide automatically in view")
		// 	.setDesc(
		// 		"Choose when the outline window should appear in different views."
		// 	)
		// 	.addDropdown((dropdown) => {
		// 		dropdown
		// 			.addOption("never", "Never")
		// 			.addOption("editing", "Editing view")
		// 			.addOption("reading", "Reading view");
		// 	});

		new Setting(containerEl)
			.setName(htmlDescription("Navigation and search"))
			.setHeading()
			.setDesc("Configure how you move through and search your outline.");
		new HighlightOnScrollSetting(this.plugin, containerEl).display();
		new AutofocusSearchOnOpenSetting(this.plugin, containerEl).display();
		new ResetSearchSetting(this.plugin, containerEl).display();

		new Setting(containerEl)
			.setName(htmlDescription("Layout"))
			.setHeading()
			.setDesc(
				htmlDescription(
					`To customize the appearance of the Dynamic Outline, please use the <a href="https://obsidian.md/plugins?id=obsidian-style-settings">Style Settings</a> plugin.`
				)
			);
		new DynamicHeadingIndentationSetting(
			this.plugin,
			containerEl
		).display();
		new WindowLocationSetting(this.plugin, containerEl).display();
	}
}
