import { Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class StyleCustomizationSetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Style customization")
			.setDesc(
				htmlDescription(
					`Please use the <a href="https://obsidian.md/plugins?id=obsidian-style-settings">Style Settings</a> plugin to customize the appearance of the Dynamic Outline.`
				)
			);
	}
}
