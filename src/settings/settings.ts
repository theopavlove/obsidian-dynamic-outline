import DynamicOutlinePlugin from "main";
import { App, PluginSettingTab } from "obsidian";
import AutofocusSearchOnOpenSetting from "./options/autofocusSearchOnOpenSetting";

import HighlightOnScrollSetting from "./options/highlightOnScrollSetting";
import OutlineOpacitySetting from "./options/outlineOpacitySetting";
import ResetSearchSetting from "./options/resetSearchSetting";
import ToggleAutomaticallySetting from "./options/toggleAutomaticallySetting";

export { DEFAULT_SETTINGS, DynamicOutlineSettingTab };
export type { DynamicOutlinePluginSettings };

const DEFAULT_SETTINGS: DynamicOutlinePluginSettings = {
	autofocusSearchOnOpen: true,
	resetSearchFieldOnHeadingClick: true,
	highlightCurrentHeading: true,
	toggleAutomatically: false,
	minimumHeadings: 1,
	outlineOpacity: 1.0,
};

interface DynamicOutlinePluginSettings {
	autofocusSearchOnOpen: boolean;
	resetSearchFieldOnHeadingClick: boolean;
	highlightCurrentHeading: boolean;
	toggleAutomatically: boolean;
	minimumHeadings: number;
	outlineOpacity: number;
}

export function htmlDescription(innerHTML: string): DocumentFragment {
	const desc = new DocumentFragment();
	desc.createSpan({}, (span) => {
		span.innerHTML = innerHTML;
	});
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

		new ToggleAutomaticallySetting(this.plugin, containerEl).display();
		new HighlightOnScrollSetting(this.plugin, containerEl).display();
		new ResetSearchSetting(this.plugin, containerEl).display();
		new AutofocusSearchOnOpenSetting(this.plugin, containerEl).display();
		new OutlineOpacitySetting(this.plugin, containerEl).display();
	}
}
