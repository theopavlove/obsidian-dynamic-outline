import DynamicOutlinePlugin from "main";
import { HeadingCache, htmlToMarkdown, MarkdownView, TFile } from "obsidian";

export default class HeadingsManager {
	private plugin: DynamicOutlinePlugin;

	constructor(plugin: DynamicOutlinePlugin) {
		this.plugin = plugin;
	}

	private _cleanupHeadings(headings: HeadingCache[]): HeadingCache[] {
		const cleanMarkdown = (inputHeading: string) => {
			return htmlToMarkdown(inputHeading)
				.replaceAll("*", "")
				.replaceAll("_", "")
				.replaceAll("`", "")
				.replaceAll("==", "")
				.replaceAll("~~", "");
		};
		const extractLinkText = (inputHeading: string) => {
			return (
				inputHeading
					// Extract markdown link [text](link) text
					.replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
					// Extract wikilink [[link|text]] text
					.replace(/\[\[([^\]]+)\|([^\]]+)\]\]/g, "$2")
					// Extact another wikilink [[text]] text
					.replace(/\[\[([^\]]+)\]\]/g, "$1")
			);
		};
		const cleanedHeadings: HeadingCache[] = headings;
		cleanedHeadings.forEach((headingData) => {
			let cleanedHeading: string = headingData.heading;
			cleanedHeading = cleanMarkdown(cleanedHeading);
			cleanedHeading = extractLinkText(cleanedHeading);
			headingData.heading = cleanedHeading;
		});
		return cleanedHeadings;
	}

	getHeadingsForView(view: MarkdownView | null): HeadingCache[] {
		const file: TFile | null | undefined = view?.file;
		if (!file) return [];

		const fileMetadata =
			this.plugin.app.metadataCache.getFileCache(file) || {};
		const fileHeadings: HeadingCache[] = fileMetadata.headings ?? [];
		const cleanedHeadings = this._cleanupHeadings(fileHeadings);
		return cleanedHeadings;
	}
}
