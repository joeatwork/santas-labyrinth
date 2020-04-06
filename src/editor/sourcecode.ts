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

export function emptySource(jobname: string) {
  return {
    jobname,
    dirty: false,
    editor: EditorState.createEmpty(errorDecorator)
  };
}

export function getSourceText(s: SourceCode): string {
  return s.editor.getCurrentContent().getPlainText();
}

export function annotateErrorLine(line: number, s: SourceCode): SourceCode {
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
  let foundln = 0;
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
