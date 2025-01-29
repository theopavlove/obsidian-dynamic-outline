import { ButtonComponent, Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class HighlightOnScrollSetting extends DynamicOutlineSetting {
	public display(): void {
		let restartButton: ButtonComponent;
		const initialToggleValue: boolean =
			this.plugin.settings.highlightCurrentHeading;

		new Setting(this.containerEl)
			.setName("Highlight active heading")
			.setDesc(
				htmlDescription(
					`Highlight the current outline heading when scrolling the file.</span>`
				)
			)
			.addButton((button) => {
				restartButton = button;
				button.setButtonText("Reload plugin");
				button.setTooltip("Requires a plugin reload to take effect.");
				button.setDisabled(true);
				button.setClass("dynamic-outline-reload");
				button.setCta();

				button.onClick(() => {
					this.plugin.reloadPlugin();
				});
			})
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.highlightCurrentHeading)
					.onChange(async (value) => {
						this.plugin.settings.highlightCurrentHeading = value;
						await this.plugin.saveSettings();

						restartButton.setDisabled(value === initialToggleValue);
					});
			});
	}
}
