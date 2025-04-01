import { ButtonComponent, Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";
import RestartPluginButton from "../restartPluginButton";

export default class AvoidContentOverlapSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean =
			this.plugin.settings.avoidContentOverlap;

		new Setting(this.containerEl)
			.setName("Avoid content overlap")
			.setDesc(
				"Automatically hide the outline when the note is too narrow."
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
					.setValue(this.plugin.settings.avoidContentOverlap)
					.onChange(async (value) => {
						this.plugin.settings.avoidContentOverlap = value;
						await this.plugin.saveSettings();

						restartPluginButton.updateValue(value);
					});
			});
	}
}
