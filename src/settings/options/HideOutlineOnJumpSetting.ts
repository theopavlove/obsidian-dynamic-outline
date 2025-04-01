import { Setting } from "obsidian";
import DynamicOutlineSetting from "../settingsOption";

export default class HideOutlineOnJumpSetting extends DynamicOutlineSetting {
    public display(): void {
        new Setting(this.containerEl)
            .setName("Hide outline on jump")
            .setDesc("Automatically hide the outline panel when you navigate by selecting a heading.")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.hideOutlineOnJump)
                    .onChange(async (value) => {
                        this.plugin.settings.hideOutlineOnJump = value;
                        await this.plugin.saveSettings();
                    });
            });
    }
}
