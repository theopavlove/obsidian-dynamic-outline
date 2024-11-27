import DynamicOutlinePlugin from "main";

export default abstract class DynamicOutlineSetting {
	plugin: DynamicOutlinePlugin;
	containerEl: HTMLElement;

	constructor(plugin: DynamicOutlinePlugin, containerEl: HTMLElement) {
		this.plugin = plugin;
		this.containerEl = containerEl;
	}

	public abstract display(): void;
}
