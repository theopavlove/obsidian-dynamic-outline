import { Setting } from "obsidian";
import { htmlDescription } from "../settings";
import DynamicOutlineSetting from "../settingsOption";

export default class OutlineOpacitySetting extends DynamicOutlineSetting {
	public display(): void {
		new Setting(this.containerEl)
			.setName("Style customizations")
			.setDesc(
				htmlDescription(
					`Please use the <a href="https://obsidian.md/plugins?id=obsidian-style-settings">Style Settings</a> plugin to apply custom font size, opacity, alignment, etc.`
				)
			);
	}
}
