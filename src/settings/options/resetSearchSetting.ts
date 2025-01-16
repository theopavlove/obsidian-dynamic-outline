import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class ResetSearchSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Reset search field")
			.setDesc(
				"Erase the search field contents after jumping to a heading."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(
						this.plugin.settings.resetSearchFieldOnHeadingClick
					)
					.onChange(async (value) => {
						this.plugin.settings.resetSearchFieldOnHeadingClick =
							value;
						await this.plugin.saveSettings();
					});
			});
	}
}
