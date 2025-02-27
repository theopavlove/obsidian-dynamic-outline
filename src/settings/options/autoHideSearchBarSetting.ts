import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class AutoHideSearchBarSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Auto-hide search bar")
			.setDesc(
				`The search bar is automatically hidden when there is only a few headings in the note.`
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autoHideSearchBar)
					.onChange(async (value) => {
						this.plugin.settings.autoHideSearchBar = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
