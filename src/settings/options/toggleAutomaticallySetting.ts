import { Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class ToggleAutomaticallySetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Toggle automatically")
			.setDesc(
				htmlDescription(
					`Show and hide the outline automatically based on the number of headings in the file.<br><span style="color: var(--text-accent)">Requires an Obsidian restart to take full effect.</span>`
				)
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.toggleAutomatically)
					.onChange(async (value) => {
						this.plugin.settings.toggleAutomatically = value;
						await this.plugin.saveSettings();

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
