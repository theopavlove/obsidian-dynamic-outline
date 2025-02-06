import DynamicOutlinePlugin from "main";
import { App, PluginSettingTab, sanitizeHTMLToDom } from "obsidian";
import AutofocusSearchOnOpenSetting from "./options/autofocusSearchOnOpenSetting";

import HighlightOnScrollSetting from "./options/highlightOnScrollSetting";
import StyleCustomizationSetting from "./options/styleCustomizationSetting";
import ResetSearchSetting from "./options/resetSearchSetting";
import ToggleAutomaticallySetting from "./options/toggleAutomaticallySetting";
import ToggleOnHoverSetting from "./options/toggleOnHoverSetting";
import WindowLocationSetting from "./options/windowLocationSetting";

export { DEFAULT_SETTINGS, DynamicOutlineSettingTab };
export type { DynamicOutlinePluginSettings };

interface DynamicOutlinePluginSettings {
	autofocusSearchOnOpen: boolean;
	highlightCurrentHeading: boolean;
	minimumHeadings: number;
	resetSearchFieldOnHeadingClick: boolean;
	toggleAutomatically: boolean;
	toggleOnHover: boolean;
	windowLocation: string;
}

const DEFAULT_SETTINGS: DynamicOutlinePluginSettings = {
	autofocusSearchOnOpen: true,
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

		new HighlightOnScrollSetting(this.plugin, containerEl).display();
		new ToggleOnHoverSetting(this.plugin, containerEl).display();
		new ToggleAutomaticallySetting(this.plugin, containerEl).display();
		new AutofocusSearchOnOpenSetting(this.plugin, containerEl).display();
		new ResetSearchSetting(this.plugin, containerEl).display();
		new WindowLocationSetting(this.plugin, containerEl).display();
		new StyleCustomizationSetting(this.plugin, containerEl).display();
	}
}
