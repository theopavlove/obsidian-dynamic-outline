import { Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class ToggleOnHoverSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Toggle on hover")
			.setDesc(
				htmlDescription(
					`Show and hide on mouse hover. Pin the outline on mouse click.`
				)
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.toggleOnHover)
					.onChange(async (value) => {
						this.plugin.settings.toggleOnHover = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
