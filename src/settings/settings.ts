import DynamicOutlinePlugin from "main";
import { App, PluginSettingTab, sanitizeHTMLToDom, Setting } from "obsidian";
import DisableSearchFieldAutofocusSetting from "./options/DisableSearchFieldAutoFocusSetting";

import DisableActiveHeadingHighlightingSetting from "./options/DisableActiveHeadingHighlightingSetting";
import DisableSearchClearOnJumpSetting from "./options/DisableSearchClearOnJumpSetting";
import RevealAutomaticallyOnFileOpenSetting from "./options/RevealAutomaticallyOnFileOpenSetting";
import RevealOnHoverSetting from "./options/RevealOnHoverSetting";
import OutlinePositionSetting from "./options/OutlinePositionSetting";
import DisableDynamicHeadingIndentationSetting from "./options/DisableDynamicHeadingIndentationSetting";
import DisableSearchAutoHideSetting from "./options/DisableSearchAutoHideSetting";
import HideOutlineOnJumpSetting from "./options/HideOutlineOnJumpSetting";
import AvoidContentOverlapSetting from "./options/AvoidContentOverlapSetting";

export { DEFAULT_SETTINGS, DynamicOutlineSettingTab };
export type { DynamicOutlinePluginSettings };

interface DynamicOutlinePluginSettings {
	handleContentOverlap: string;
	disableActiveHeadingHighlighting: boolean;
	disableDynamicHeadingIndentation: boolean;
	disableSearchBarAutoHide: boolean;
	disableSearchClearOnJump: boolean;
	disableSearchFieldAutofocus: boolean;
	hideOutlineOnJump: boolean;
	minHeadingsToHideSearchBar: number;
	minimumHeadingsToRevealAutomatically: number;
	revealAutomaticallyOnFileOpen: boolean;
	revealOnHover: boolean;
	avoidContentOverlap: boolean;
	outlinePosition: string;
}

const DEFAULT_SETTINGS: DynamicOutlinePluginSettings = {
	handleContentOverlap: "allow",
	disableActiveHeadingHighlighting: false,
	disableDynamicHeadingIndentation: false,
	disableSearchBarAutoHide: false,
	disableSearchClearOnJump: false,
	disableSearchFieldAutofocus: false,
	hideOutlineOnJump: false,
	minHeadingsToHideSearchBar: 5,
	minimumHeadingsToRevealAutomatically: 2,
	revealAutomaticallyOnFileOpen: false,
	revealOnHover: false,
	avoidContentOverlap: false,
	outlinePosition: "right",
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
		new OutlinePositionSetting(this.plugin, containerEl).display();
		new RevealOnHoverSetting(this.plugin, containerEl).display();
		new RevealAutomaticallyOnFileOpenSetting(this.plugin, containerEl).display();
		new AvoidContentOverlapSetting(this.plugin, containerEl).display();
		new HideOutlineOnJumpSetting(this.plugin, containerEl).display();

		new Setting(containerEl)
			.setName(htmlDescription("Search bar"))
			.setHeading()
			.setDesc("Customize the search bar behavior.");
		new DisableSearchAutoHideSetting(this.plugin, containerEl).display();
		new DisableSearchFieldAutofocusSetting(
			this.plugin,
			containerEl
		).display();
		new DisableSearchClearOnJumpSetting(this.plugin, containerEl).display();

		new Setting(containerEl)
			.setName(htmlDescription("Outline content"))
			.setHeading()
			.setDesc(
				htmlDescription(
					`To customize the appearance of the Dynamic Outline, please use the <a href="https://obsidian.md/plugins?id=obsidian-style-settings">Style Settings</a> plugin.`
				)
			);
		new DisableActiveHeadingHighlightingSetting(
			this.plugin,
			containerEl
		).display();
		new DisableDynamicHeadingIndentationSetting(
			this.plugin,
			containerEl
		).display();
	}
}
