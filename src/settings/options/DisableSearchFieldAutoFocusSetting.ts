import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class DisableSearchFieldAutofocusSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Disable search field autofocus")
			.setDesc(
				"Enable to automatically focus the search field when the outline window opens. Allows immediate keyboard input."
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
