import { ButtonComponent, Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class ToggleOnHoverSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean = this.plugin.settings.toggleOnHover;

		new Setting(this.containerEl)
			.setName("Toggle on hover")
			.setDesc(
				htmlDescription(
					`Show and hide on mouse hover. Pin the outline on mouse click.<br><span style="color: var(--text-accent)">Requires a plugin restart to take full effect.</span>`
				)
			)
			.addButton((button) => {
				restartButton = button;
				button.setButtonText("Restart");
				button.setDisabled(true);

				button.onClick(() => {
					this.plugin.reloadPlugin();
				});
			})
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.toggleOnHover)
					.onChange(async (value) => {
						this.plugin.settings.toggleOnHover = value;
						await this.plugin.saveSettings();

						if (value !== initialToggleValue) {
							restartButton.setDisabled(false);
							restartButton.setCta();
						} else {
							restartButton.setDisabled(true);
							restartButton.removeCta();
						}
					});
			});
	}
}
