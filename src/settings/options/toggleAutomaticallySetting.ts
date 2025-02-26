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
				`Show and hide outline automatically based on the number of headings in the file.`
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

			const preventContentOverlapSetting: Setting = new Setting(
				this.containerEl
			)
				.setName("Content overlap")
				.setDesc(
					"Set how much content overlap is acceptable for the automatic outline to trigger. Choosing to prevent overlap will show the outline less frequently, particularly when horizontal space is limited."
				)
				.addDropdown((dropdown) => {
					dropdown
						.addOption("allow", "Allow")
						.addOption("partial", "Partial")
						.addOption("prevent", "Prevent")
						.setValue(this.plugin.settings.contentOverlap)
						.onChange(async (value) => {
							this.plugin.settings.contentOverlap = value;
							await this.plugin.saveSettings();
						});
				})
				.setClass("dynamic-outline-setting-item-hidden")
				.setDisabled(!this.plugin.settings.toggleAutomatically);

		const minimumHeadingsSetting: Setting = new Setting(this.containerEl)
			.setName("Minimum number of headings")
			.setDesc(
				`Set the minimum number of headings to trigger the outline.`
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
			.setClass("dynamic-outline-setting-item-hidden")
			.setDisabled(!this.plugin.settings.toggleAutomatically);
	}
}
