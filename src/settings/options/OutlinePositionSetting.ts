import { ButtonComponent, Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";
import RestartPluginButton from "../restartPluginButton";

export default class OutlinePositionSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: string = this.plugin.settings.outlinePosition;

		new Setting(this.containerEl)
			.setName("Outline position")
			.setDesc(
				"Set the screen location for the outline window and its trigger button."
			)
			.addButton((button) => {
				restartButton = button;
			})
			.addDropdown((dropdown) => {
				const restartPluginButton = new RestartPluginButton(
					this.plugin,
					restartButton,
					initialToggleValue
				);

				dropdown
					.addOption("right", "Right")
					.addOption("left", "Left")
					.setValue(this.plugin.settings.outlinePosition)
					.onChange(async (value) => {
						this.plugin.settings.outlinePosition = value;
						await this.plugin.saveSettings();

						restartPluginButton.updateValue(value);
					});
			});
	}
}
