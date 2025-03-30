import { ButtonComponent, Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class ToggleWhenNotEnoughWidthSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean = this.plugin.settings.toggleWhenNotEnoughWidth;

		new Setting(this.containerEl)
			.setName("Toggle when not enough width")
			.setDesc(
				"Toggle the outline visibility based on note width: hide the outline when the width is insufficient, and show it when the width is sufficient again."
			)
			.addButton((button) => {
				restartButton = button;
				button.setButtonText("Reload plugin");
				button.setTooltip("Requires a plugin reload to take effect.");
				button.setDisabled(true);
				button.setClass("dynamic-outline-reload");
				button.setCta();

				button.onClick(() => {
					this.plugin.reloadPlugin();
				});
			})
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.toggleWhenNotEnoughWidth)
					.onChange(async (value) => {
						this.plugin.settings.toggleWhenNotEnoughWidth = value;
						await this.plugin.saveSettings();

						restartButton.setDisabled(value === initialToggleValue);
					});
			});
	}
}
