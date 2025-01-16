import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class AutofocusSearchOnOpenSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Autofocus search field on open")
			.setDesc(
				"Focus the search field immediately after the outline is opened."
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
