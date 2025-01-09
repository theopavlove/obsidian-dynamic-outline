import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class AutofocusSearchOnOpenSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Autofocus search field on open")
			.setDesc(
				"When the outline is opened, focus the search field immediately."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autofocusSearchOnOpen)
					.onChange(async (value) => {
						this.plugin.settings.autofocusSearchOnOpen = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
