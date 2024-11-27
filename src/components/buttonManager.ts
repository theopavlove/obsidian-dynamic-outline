import DynamicOutlinePlugin from "main";
import { MarkdownView, setIcon, WorkspaceLeaf } from "obsidian";

export { ButtonManager, BUTTON_CLASS };

const LUCID_ICON_NAME = "list";
const BUTTON_CLASS = "dynamic-outline-button";

class ButtonManager {
	private _createButtonHTML(): HTMLButtonElement {
		const button: HTMLButtonElement = createEl("button", {
			cls: `clickable-icon view-action ${BUTTON_CLASS}`,
			attr: {
				"aria-label": "Toggle Dynamic Outline",
			},
		});
		setIcon(button, LUCID_ICON_NAME);
		return button;
	}

	private _handleButtonClick(event: MouseEvent, plugin: DynamicOutlinePlugin) {
		const button = event.target as HTMLButtonElement;
		const markdownView: MarkdownView | null =
			plugin.getActiveMarkdownView();

		if (!markdownView) return;

		const windowContainer: HTMLElement | null | undefined =
			plugin.windowManager.getWindowFromView(markdownView);

		if (!windowContainer) {
			plugin.windowManager.createWindowInView(
				markdownView,
				plugin.headingsManager.getHeadingsForView(markdownView, plugin),
				plugin
			);
			// button?.classList.add("button-active");
		} else {
			plugin.windowManager.hideWindow(windowContainer, button);
			// button?.classList.remove("button-active");
		}
	}

	// Do I need the leaf? Maybe the view right away?
	addButtonToLeaf(leaf: WorkspaceLeaf, plugin: DynamicOutlinePlugin) {
		if (this.getButtonFromLeaf(leaf)) return;

		const markdownActionButtons: HTMLElement | null =
			leaf.view.containerEl.querySelector("div.view-actions");
		if (!markdownActionButtons) return;

		const newButton: HTMLButtonElement = this._createButtonHTML();
		markdownActionButtons.insertBefore(
			newButton,
			markdownActionButtons.firstChild
		);

		plugin.registerDomEvent(
			newButton,
			"click",
			// (event) => plugin.onButtonClick(event)
			(event) => this._handleButtonClick(event, plugin)
		);

		return newButton;
	}

	addButtonToLeaves(plugin: DynamicOutlinePlugin) {
		plugin.app.workspace.onLayoutReady(() => {
			const markdownLeaves: WorkspaceLeaf[] =
				plugin.getAllMarkdownLeaves();
			markdownLeaves.forEach((leaf) => {
				this.addButtonToLeaf(leaf, plugin);
			});
		});
	}

	getButtonFromLeaf(leaf: WorkspaceLeaf): HTMLButtonElement | null {
		return leaf.view.containerEl.querySelector(`button.${BUTTON_CLASS}`);
	}

	removeButtonFromLeaf(leaf: WorkspaceLeaf) {
		this.getButtonFromLeaf(leaf)?.remove();
	}

	removeButtonFromLeaves(plugin: DynamicOutlinePlugin) {
		const markdowns = plugin.getAllMarkdownLeaves();
		markdowns.forEach((md) => {
			this.removeButtonFromLeaf(md);
		});
	}
}
