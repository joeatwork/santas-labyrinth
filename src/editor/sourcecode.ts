// TODO change this file name to "editor"
import { EditorState } from "draft-js";

export interface SourceCode {
  jobname: string;
  dirty: boolean;
  editor: EditorState;
}

export function emptySource(jobname: string) {
  return {
    jobname,
    dirty: false,
    editor: EditorState.createEmpty()
  };
}

export function getSourceText(s: SourceCode): string {
  return s.editor.getCurrentContent().getPlainText();
}
