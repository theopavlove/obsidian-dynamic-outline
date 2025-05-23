import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class DisableSearchClearOnJumpSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Disable search clear on jump")
			.setDesc(
				"Turn off the ability to keep the search field text after clicking a heading."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(
						this.plugin.settings.disableSearchClearOnJump
					)
					.onChange(async (value) => {
						this.plugin.settings.disableSearchClearOnJump =
							value;
						await this.plugin.saveSettings();
					});
			});
	}
}
