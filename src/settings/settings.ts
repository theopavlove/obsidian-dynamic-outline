import DynamicOutlinePlugin from "main";
import { App, PluginSettingTab, sanitizeHTMLToDom, Setting } from "obsidian";
import AutofocusSearchOnOpenSetting from "./options/autofocusSearchOnOpenSetting";

import HighlightOnScrollSetting from "./options/highlightOnScrollSetting";
import ResetSearchSetting from "./options/resetSearchSetting";
import ToggleAutomaticallySetting from "./options/toggleAutomaticallySetting";
import ToggleOnHoverSetting from "./options/toggleOnHoverSetting";
import WindowLocationSetting from "./options/windowLocationSetting";
import DynamicHeadingIndentationSetting from "./options/dynamicHeadingIndentationSetting";
import AutoHideSearchBarSetting from "./options/autoHideSearchBarSetting";
import HideOutlineOnHeadingJump from "./options/hideOutlineOnHeadingJump";
import ToggleWhenNotEnoughWidthSetting from "./options/ToggleWhenNotEnoughWidth";

export { DEFAULT_SETTINGS, DynamicOutlineSettingTab };
export type { DynamicOutlinePluginSettings };

interface DynamicOutlinePluginSettings {
	autofocusSearchOnOpen: boolean;
	autoHideSearchBar: boolean;
	contentOverlap: string;
	dynamicHeadingIndentation: boolean;
	hideOutlineOnHeadingJump: boolean;
	toggleWhenNotEnoughWidth: boolean;
	highlightCurrentHeading: boolean;
	minHeadingsToHideSearchBar: number;
	minimumHeadings: number;
	resetSearchFieldOnHeadingClick: boolean;
	toggleAutomatically: boolean;
	toggleOnHover: boolean;
	windowLocation: string;
}

const DEFAULT_SETTINGS: DynamicOutlinePluginSettings = {
	autofocusSearchOnOpen: true,
	autoHideSearchBar: true,
	contentOverlap: "allow",
	dynamicHeadingIndentation: true,
	hideOutlineOnHeadingJump: false,
	toggleWhenNotEnoughWidth: false,
	highlightCurrentHeading: true,
	minHeadingsToHideSearchBar: 5,
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
		new ToggleWhenNotEnoughWidthSetting(this.plugin, containerEl).display();
		new HideOutlineOnHeadingJump(this.plugin, containerEl).display();

		new Setting(containerEl)
			.setName(htmlDescription("Navigation and search"))
			.setHeading()
			.setDesc("Configure how you move through and search your outline.");
		new HighlightOnScrollSetting(this.plugin, containerEl).display();
		new AutoHideSearchBarSetting(this.plugin, containerEl).display();
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
