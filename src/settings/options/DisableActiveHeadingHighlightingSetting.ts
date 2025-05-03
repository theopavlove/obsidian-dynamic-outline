import { ButtonComponent, Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";
import RestartPluginButton from "../restartPluginButton";

export default class DisableActiveHeadingHighlightingSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean =
			this.plugin.settings.disableActiveHeadingHighlighting;

		new Setting(this.containerEl)
			.setName("Disable active heading highlighting")
			.setDesc(
				"Turn off the highlighting of the corresponding heading in the outline as you scroll."
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
					.setValue(this.plugin.settings.disableActiveHeadingHighlighting)
					.onChange(async (value) => {
						this.plugin.settings.disableActiveHeadingHighlighting = value;
						await this.plugin.saveSettings();

						restartPluginButton.updateValue(value);
					});
			});
	}
}
