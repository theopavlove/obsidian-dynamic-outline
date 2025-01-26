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
					`Highlight the current outline heading when scrolling the file.<br><span style="color: var(--text-accent)">Requires a plugin restart to take full effect.</span>`
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
					.setValue(this.plugin.settings.highlightCurrentHeading)
					.onChange(async (value) => {
						this.plugin.settings.highlightCurrentHeading = value;
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
