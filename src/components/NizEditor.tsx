import {
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  CreateLink,
  diffSourcePlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface Props {
  markdown: string;
  onChange?: (v: string) => void;
  viewMode?: boolean; // Thêm prop này để bật chế độ View
}

const NizEditor = ({ markdown, onChange, viewMode = false }: Props) => {
  const allPlugins = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
    markdownShortcutPlugin(),
    diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "suggested" }),
    frontmatterPlugin(),
  ];

  if (!viewMode) {
    allPlugins.push(
      toolbarPlugin({
        toolbarContents: () => (
          <div className="flex flex-wrap gap-1 items-center w-full">
            <UndoRedo />
            <Separator />
            <BoldItalicUnderlineToggles />
            <Separator />
            <ListsToggle />
            <Separator />
            <CreateLink />
            <InsertImage />
            <InsertTable />
            <InsertThematicBreak />
          </div>
        ),
      })
    );
  }

  return (
    <div
      className={`niz-editor-wrapper w-full h-full ${
        viewMode ? "is-view-mode border-none" : "is-edit-mode"
      }`}
    >
      <MDXEditor
        markdown={markdown}
        onChange={viewMode ? undefined : onChange}
        readOnly={viewMode}
        contentEditableClassName={`min-h-[100px] prose dark:prose-invert max-w-none text-foreground ${
          viewMode ? "" : "outline-none"
        }`}
        className="w-full h-full"
        plugins={allPlugins}
      />
    </div>
  );
};

export default NizEditor;
