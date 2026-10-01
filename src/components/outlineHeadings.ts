import DynamicOutlinePlugin from "main";
import {
	HeadingCache,
	MarkdownView,
	parseLinktext,
	TFile,
	htmlToMarkdown,
} from "obsidian";
import Outline from "src/components/Outline";

export type OutlineHeading = HeadingCache & { file: TFile };

export default class OutlineHeadings {
	private _plugin: DynamicOutlinePlugin;
	private _outline: Outline;
	private _headings: OutlineHeading[] = [];

	constructor(plugin: DynamicOutlinePlugin, outline: Outline) {
		this._plugin = plugin;
		this._outline = outline;
	}

	get headings(): OutlineHeading[] {
		this._headings = this._getHeadingsForView(this._outline.view);
		return this._headings;
	}

	private _getHeadingsForView(view: MarkdownView): OutlineHeading[] {
		const file: TFile | null | undefined = view?.file;
		if (!file) return [];

		const headings: OutlineHeading[] = [];
		const metadata = this._plugin.app.metadataCache.getFileCache(file);
		const items = [
				...(metadata?.headings ?? []).map((heading) => ({
					line: heading.position.start.line,
					type: "heading" as const,
					heading,
				})),
				...(this._plugin.settings.includeEmbeddedHeadings
					? (metadata?.embeds ?? []).map((embed) => ({
							line: embed.position.start.line,
							type: "embed" as const,
							embed,
						}))
					: []),
			].sort((a, b) => a.line - b.line);

		for (const item of items) {
			if (item.type === "heading") {
				headings.push({ ...item.heading, file });
				continue;
			}

			const { path: linkPath, subpath } = parseLinktext(item.embed.link);
			const embeddedFile =
				this._plugin.app.metadataCache.getFirstLinkpathDest(
					linkPath,
					file.path
				);
			if (!(embeddedFile instanceof TFile) || embeddedFile.extension !== "md") {
				continue;
			}

			const embeddedHeadings =
				this._plugin.app.metadataCache.getFileCache(embeddedFile)
					?.headings ?? [];
			const targetHeading = subpath.replace(/^#/, "");
			let headingsToInclude = embeddedHeadings;
			if (targetHeading) {
				const targetHeadingIndex = embeddedHeadings.findIndex(
					(heading) => heading.heading === targetHeading
				);
				if (targetHeadingIndex === -1) continue;

				const targetLevel = embeddedHeadings[targetHeadingIndex].level;
				let sectionEndIndex = targetHeadingIndex + 1;
				while (
					sectionEndIndex < embeddedHeadings.length &&
					embeddedHeadings[sectionEndIndex].level > targetLevel
				) {
					sectionEndIndex++;
				}
				headingsToInclude = embeddedHeadings.slice(
					targetHeadingIndex,
					sectionEndIndex
				);
			}

			for (const heading of headingsToInclude) {
				headings.push({
					...heading,
					position: item.embed.position,
					file,
				});
			}
		}

		const cleanedHeadings = this._cleanupHeadings(headings);
		return cleanedHeadings;
	}

	private _cleanupHeadings(headings: OutlineHeading[]): OutlineHeading[] {
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

		const cleanedHeadings: OutlineHeading[] = headings;
		cleanedHeadings.forEach((headingData) => {
			let cleanedHeading: string = headingData.heading;
			cleanedHeading = cleanMarkdown(cleanedHeading);
			cleanedHeading = extractLinkText(cleanedHeading);
			headingData.heading = cleanedHeading;
		});

		return cleanedHeadings;
	}
}
