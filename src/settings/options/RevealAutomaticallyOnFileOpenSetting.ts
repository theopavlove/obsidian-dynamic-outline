import { ButtonComponent, Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";
import RestartPluginButton from "../restartPluginButton";

export default class RevealAutomaticallyOnFileOpenSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean =
			this.plugin.settings.revealAutomaticallyOnFileOpen;

		new Setting(this.containerEl)
			.setName("Reveal automatically on file open")
			.setDesc(
				"Automatically show or hide the outline when opening a file, based on heading count."
			)
			.addButton((button) => {
				restartButton = button;
			})
			.addToggle((toggle) => {
				const restartPluginButton = new RestartPluginButton(
					this.plugin,
					restartButton,
					initialToggleValue
				);

				toggle
					.setValue(this.plugin.settings.revealAutomaticallyOnFileOpen)
					.onChange(async (value) => {
						this.plugin.settings.revealAutomaticallyOnFileOpen = value;
						await this.plugin.saveSettings();

						restartPluginButton.updateValue(value);
						minimumHeadingsSetting.setDisabled(!value);
						preventContentOverlapSetting.setDisabled(!value);
					});
			});

		const preventContentOverlapSetting: Setting = new Setting(
			this.containerEl
		)
			.setName("Handle content overlap")
			.setDesc(
				"Choose if the outline can overlap page content when space is limited, or if it should hide to prevent overlap."
			)
			.addDropdown((dropdown) => {
				dropdown
					.addOption("allow", "Allow")
					.addOption("partial", "Partial")
					.addOption("prevent", "Prevent")
					.setValue(this.plugin.settings.handleContentOverlap)
					.onChange(async (value) => {
						this.plugin.settings.handleContentOverlap = value;
						await this.plugin.saveSettings();
					});
			})
			.setClass("dynamic-outline-setting-item-hidden")
			.setDisabled(!this.plugin.settings.revealAutomaticallyOnFileOpen);

		const minimumHeadingsSetting: Setting = new Setting(this.containerEl)
			.setName("Minimum number of headings")
			.setDesc(
				"Set the minimum heading count required to automatically show the outline on file open."
			)
			.addSlider((slider) => {
				slider
					.setLimits(2, 10, 1)
					.setDynamicTooltip()
					.setValue(
						this.plugin.settings.minimumHeadingsToRevealAutomatically
					)
					.onChange(async (value) => {
						this.plugin.settings.minimumHeadingsToRevealAutomatically =
							value;
						await this.plugin.saveSettings();
					});
			})
			.setClass("dynamic-outline-setting-item-hidden")
			.setDisabled(!this.plugin.settings.revealAutomaticallyOnFileOpen);
	}
}
