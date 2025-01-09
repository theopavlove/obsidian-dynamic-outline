import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class ResetSearchSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Reset search field on heading click")
			.setDesc(
				"Reset the search field to empty when clicking on a outline heading."
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
