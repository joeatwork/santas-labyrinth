import _ from "lodash";
import {
  EditorState,
  ContentBlock,
  ContentState,
  CompositeDecorator,
  Modifier,
  SelectionState
} from "draft-js";

import { ErrorComponent } from "../editor/ErrorComponent";

export interface SourceCode {
  jobname: string;
  dirty: boolean;
  editor: EditorState;
}

export function createSource(jobname: string, initialText: string) {
  return {
    jobname,
    dirty: false,
    editor: EditorState.createWithContent(
      ContentState.createFromText(initialText),
      errorDecorator
    )
  };
}

export function getSourceText(s: SourceCode): string {
  return s.editor.getCurrentContent().getPlainText();
}

export function annotateErrors(s: SourceCode, lines: number[]): SourceCode {
  const cleared = clearAllErrors(s);
  return lines.reduce(annotateErrorOnLine, cleared);
}

export function clearAllErrors(s: SourceCode): SourceCode {
  const marked = s.editor.getCurrentContent();
  const begin = marked.getFirstBlock();
  const end = marked.getLastBlock();
  const selection = new SelectionState({
    anchorKey: begin.getKey(),
    anchorOffset: 0,
    focusKey: end.getKey(),
    focusOffset: end.getText().length
  });
  const cleared = Modifier.applyEntity(marked, selection, null);
  return {
    ...s,
    editor: EditorState.push(s.editor, cleared, "apply-entity")
  };
}

function annotateErrorOnLine(s: SourceCode, line: number): SourceCode {
  const withEntity = s.editor
    .getCurrentContent()
    .createEntity("ERROR", "MUTABLE");
  const ek = withEntity.getLastCreatedEntityKey();

  const selection = selectionForLine(line, withEntity);
  if (!selection) {
    console.log(`can't find line ${line} in source code`);
    return s;
  }

  const withError = Modifier.applyEntity(withEntity, selection, ek);
  return {
    ...s,
    editor: EditorState.push(s.editor, withError, "apply-entity")
  };
}

function selectionForLine(ln: number, content: ContentState) {
  let foundln = -1; // lines start at zero
  let ret: SelectionState | undefined;

  content.getBlockMap().forEach(b => {
    const block = b!;
    const blockText = block.getText();
    foundln += blockText.split("\n").length;
    if (foundln >= ln) {
      ret = SelectionState.createEmpty(block.getKey()).merge({
        anchorOffset: 0,
        focusOffset: blockText.length
      }) as SelectionState;
    }

    return _.isUndefined(ret);
  });

  return ret;
}

function errorStrategy(
  block: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) {
  block.findEntityRanges(stuff => {
    const ek = stuff.getEntity();
    if (!ek) {
      return false;
    }
    return contentState.getEntity(ek).getType() === "ERROR";
  }, callback);
}

const errorDecorator = new CompositeDecorator([
  {
    strategy: errorStrategy,
    component: ErrorComponent
  }
]);
