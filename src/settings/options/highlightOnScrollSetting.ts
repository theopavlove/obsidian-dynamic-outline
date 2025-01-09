import { Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class HighlightOnScrollSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Highlight active heading on scroll")
			.setDesc(
				htmlDescription(
					`When scrolling throught the file, highlight the current outline heading.<br><span style="color: var(--text-accent)">Requires a restart to take effect.</span>`
				)
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.highlightCurrentHeading)
					.onChange(async (value) => {
						this.plugin.settings.highlightCurrentHeading = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
