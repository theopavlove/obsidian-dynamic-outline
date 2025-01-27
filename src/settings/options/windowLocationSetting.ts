import { ButtonComponent, Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class WindowLocationSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: string = this.plugin.settings.windowLocation;

		new Setting(this.containerEl)
			.setName("Window location")
			.setDesc(
				htmlDescription(
					`Set the location for the window (right by default).</span>`
				)
			)
			.addButton((button) => {
				restartButton = button;
				button.setButtonText("Reload");
				button.setTooltip("Requires a plugin reload to take effect.");
				button.setDisabled(true);
				button.setClass("dynamic-outline-reload");
				button.setCta();

				button.onClick(() => {
					this.plugin.reloadPlugin();
				});
			})
			.addDropdown((dropdown) =>
				dropdown
					.addOption("right", "Right")
					.addOption("left", "Left")
					.setValue(this.plugin.settings.windowLocation)
					.onChange(async (value) => {
						this.plugin.settings.windowLocation = value;
						await this.plugin.saveSettings();

						restartButton.setDisabled(value === initialToggleValue);
					})
			);
	}
}
