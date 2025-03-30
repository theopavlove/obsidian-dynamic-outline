import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class HideOutlineOnHeadingJump extends DynamicOutlineSetting {
    public display(): void {
        new Setting(this.containerEl)
            .setName("Hide when jumping to a heading")
            .setDesc("Automatically hide the outline panel after clicking a heading to navigate to that section.")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.hideOutlineOnHeadingJump)
                    .onChange(async (value) => {
                        this.plugin.settings.hideOutlineOnHeadingJump = value;
                        await this.plugin.saveSettings();
                    });
            });
    }
}
