import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";
import { htmlDescription } from "../settings";

export default class OutlineOpacitySetting extends DynamicOutlineSetting {
	public display(): void {
        new Setting(this.containerEl)
			.setName("Outline opacity")
			.setDesc(
				htmlDescription(
					`To customize the opacity of the Dynamic Outline, please use the <a href="https://obsidian.md/plugins?id=obsidian-style-settings">Style Settings</a> plugin.`
				)
			);
	}
}
