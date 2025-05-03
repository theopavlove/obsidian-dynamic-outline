import { ButtonComponent, Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";
import RestartPluginButton from "../restartPluginButton";

export default class DisableHeadingCollapsingSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean =
			this.plugin.settings.disableHeadingCollapsing;

		new Setting(this.containerEl)
			.setName("Disable heading collapsing")
			.setDesc(
				"Turn off the ability to collapse/expand heading sections within the outline."
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
					.setValue(this.plugin.settings.disableHeadingCollapsing)
					.onChange(async (value) => {
						this.plugin.settings.disableHeadingCollapsing = value;
						await this.plugin.saveSettings();

						restartPluginButton.updateValue(value);
					});
			});
	}
}
