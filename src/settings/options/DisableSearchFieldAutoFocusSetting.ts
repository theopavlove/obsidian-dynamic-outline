import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class DisableSearchFieldAutofocusSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Disable search field autofocus")
			.setDesc(
				"Turn off the automatic focusing of the search field when the outline window opens."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.disableSearchFieldAutofocus)
					.onChange(async (value) => {
						this.plugin.settings.disableSearchFieldAutofocus = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
