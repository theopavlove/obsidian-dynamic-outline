import { ButtonComponent, Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";
import RestartPluginButton from "../restartPluginButton";

export default class RevealOnHoverSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean = this.plugin.settings.revealOnHover;

		new Setting(this.containerEl)
			.setName("Reveal on hover")
			.setDesc(
				"Show the outline when hovering over its button. Click the button to pin it open."
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
					.setValue(this.plugin.settings.revealOnHover)
					.onChange(async (value) => {
						this.plugin.settings.revealOnHover = value;
						await this.plugin.saveSettings();

						restartPluginButton.updateValue(value);
					});
			});
	}
}
