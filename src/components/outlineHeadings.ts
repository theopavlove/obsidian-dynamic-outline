import DynamicOutlinePlugin from "main";
import { HeadingCache, MarkdownView, TFile, htmlToMarkdown } from "obsidian";
import Outline from "src/components/Outline";

export default class OutlineHeadings {
	private _plugin: DynamicOutlinePlugin;
	private _outline: Outline;
	private _headings: HeadingCache[] = [];

	constructor(plugin: DynamicOutlinePlugin, outline: Outline) {
		this._plugin = plugin;
		this._outline = outline;
	}

	get headings(): HeadingCache[] {
		this._headings = this._getHeadingsForView(this._outline.view);
		return this._headings;
	}

	private _getHeadingsForView(view: MarkdownView): HeadingCache[] {
		const file: TFile | null | undefined = view?.file;
		if (!file) return [];

		const fileMetadata =
			this._plugin.app.metadataCache.getFileCache(file) || {};
		const fileHeadings: HeadingCache[] = fileMetadata.headings ?? [];

		const cleanedHeadings = this._cleanupHeadings(fileHeadings);
		return cleanedHeadings;
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
					.replace(/\[(.*?)\]\(.*?\)/g, "$1")
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
}
