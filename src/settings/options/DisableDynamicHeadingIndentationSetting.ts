import { ButtonComponent, Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";
import RestartPluginButton from "../restartPluginButton";

export default class DisableDynamicHeadingIndentationSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean =
			this.plugin.settings.disableDynamicHeadingIndentation;

		new Setting(this.containerEl)
			.setName("Disable dynamic heading indentation")
			.setDesc(
				"Turn off automatic heading indentation adjustments based on the previous heading's level."
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
					.setValue(this.plugin.settings.disableDynamicHeadingIndentation)
					.onChange(async (value) => {
						this.plugin.settings.disableDynamicHeadingIndentation = value;
						await this.plugin.saveSettings();

						restartPluginButton.updateValue(value);
					});
			});
	}
}
