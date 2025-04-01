import { ButtonComponent } from "obsidian";
import DynamicOutlinePlugin from "main";

export default class RestartPluginButton {
	button: ButtonComponent;
	initialValue: any;
	currentValue: any;

	constructor(
		plugin: DynamicOutlinePlugin,
		button: ButtonComponent,
		initialValue: any
	) {
		this.button = button;
		this.initialValue = initialValue;
		this.currentValue = initialValue;

		this.button.setButtonText("Reload plugin");
		this.button.setTooltip("Requires a plugin reload to take effect.");
		this.button.setDisabled(true);
		this.button.setClass("dynamic-outline-reload");
		this.button.setCta();

		this.button.onClick(() => {
			plugin.reloadPlugin();
		});
	}

	updateValue(value: any): void {
		this.currentValue = value;
		this.button.setDisabled(this.initialValue === this.currentValue);
	}
}
