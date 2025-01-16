import DynamicOutlinePlugin from "main";
import { App, PluginSettingTab, sanitizeHTMLToDom } from "obsidian";
import AutofocusSearchOnOpenSetting from "./options/autofocusSearchOnOpenSetting";

import HighlightOnScrollSetting from "./options/highlightOnScrollSetting";
import OutlineOpacitySetting from "./options/outlineOpacitySetting";
import ResetSearchSetting from "./options/resetSearchSetting";
import ToggleAutomaticallySetting from "./options/toggleAutomaticallySetting";

export { DEFAULT_SETTINGS, DynamicOutlineSettingTab };
export type { DynamicOutlinePluginSettings };

interface DynamicOutlinePluginSettings {
	autofocusSearchOnOpen: boolean;
	highlightCurrentHeading: boolean;
	minimumHeadings: number;
	resetSearchFieldOnHeadingClick: boolean;
	toggleAutomatically: boolean;
}

const DEFAULT_SETTINGS: DynamicOutlinePluginSettings = {
	autofocusSearchOnOpen: true,
	highlightCurrentHeading: true,
	minimumHeadings: 1,
	resetSearchFieldOnHeadingClick: true,
	toggleAutomatically: false,
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

		new ToggleAutomaticallySetting(this.plugin, containerEl).display();
		new HighlightOnScrollSetting(this.plugin, containerEl).display();
		new ResetSearchSetting(this.plugin, containerEl).display();
		new AutofocusSearchOnOpenSetting(this.plugin, containerEl).display();
		new OutlineOpacitySetting(this.plugin, containerEl).display();
	}
}
