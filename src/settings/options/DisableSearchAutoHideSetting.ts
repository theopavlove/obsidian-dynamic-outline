import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class DisableSearchAutoHideSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Disable search bar auto-hide")
			.setDesc(
				"Turn off the automatic hiding of the search bar when the outline contains only a few headings."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.disableSearchBarAutoHide)
					.onChange(async (value) => {
						this.plugin.settings.disableSearchBarAutoHide = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
