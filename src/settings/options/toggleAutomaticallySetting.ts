import { ButtonComponent, Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class ToggleAutomaticallySetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean =
			this.plugin.settings.toggleAutomatically;

		new Setting(this.containerEl)
			.setName("Toggle automatically on file open")
			.setDesc(
				htmlDescription(
					`Show and hide outline automatically based on the number of headings in the file.`
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
						preventContentOverlapSetting.setDisabled(!value);
					});
			});

		const minimumHeadingsSetting: Setting = new Setting(this.containerEl)
			.setName("Minimum number of headings")
			.setDesc(
				htmlDescription(
					`Set the minimum number of headings to trigger the outline.`
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

		const preventContentOverlapSetting: Setting = new Setting(
			this.containerEl
		)
			.setName("Prevent content overlap")
			.setDesc(
				htmlDescription(
					`When off, trigger the outline even if it overlaps note contents.`
				)
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.preventContentOverlap)
					.onChange(async (value) => {
						this.plugin.settings.preventContentOverlap = value;
						await this.plugin.saveSettings();
					});
			})
			.setDisabled(!this.plugin.settings.toggleAutomatically);
	}
}
