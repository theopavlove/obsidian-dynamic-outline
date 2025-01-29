import { ButtonComponent, Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class ToggleAutomaticallySetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean =
			this.plugin.settings.toggleAutomatically;

		new Setting(this.containerEl)
			.setName("Toggle automatically")
			.setDesc(
				htmlDescription(
					`Show and hide the outline automatically based on the number of headings in the file.</span>`
				)
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
					.setValue(this.plugin.settings.toggleAutomatically)
					.onChange(async (value) => {
						this.plugin.settings.toggleAutomatically = value;
						await this.plugin.saveSettings();

						restartButton.setDisabled(value === initialToggleValue);
						minimumHeadingsSetting.setDisabled(!value);
					});
			});

		const minimumHeadingsSetting: Setting = new Setting(this.containerEl)
			.setName("Minimum headings")
			.setDesc(
				htmlDescription(
					`The minimum number of headings in the file to trigger the outline.`
				)
			)
			.addSlider((slider) => {
				slider
					.setLimits(1, 10, 1)
					.setDynamicTooltip()
					.setValue(this.plugin.settings.minimumHeadings)
					.onChange(async (value) => {
						this.plugin.settings.minimumHeadings = value;
						await this.plugin.saveSettings();
					});
			})
			.setDisabled(!this.plugin.settings.toggleAutomatically);
	}
}
