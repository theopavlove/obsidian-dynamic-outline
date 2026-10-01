import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class IncludeEmbeddedHeadingsSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Include embedded headings")
			.setDesc("Include headings from embedded notes in the outline.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.includeEmbeddedHeadings)
					.onChange(async (value) => {
						this.plugin.settings.includeEmbeddedHeadings = value;
						await this.plugin.saveSettings();
						this.plugin.refreshOutlines();
					});
		});
	}
}