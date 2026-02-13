import {
  parseValue,
  stringToTokens,
  Tokenizer,
} from "scamper/src/parser/parser.ts";
import { AST, SyntaxNode } from "scamper/src/ast.ts";
import { newUUID, SectionTitles, throwNull } from "../common/utils.ts";
import type { BlockData, Slot } from "../common/block-types.ts";
import type { TokenHandler } from "scamper/src/parser/tokenhandler.ts";
import { DefaultTokenHandlingSettings } from "scamper/src/parser/tokenhandler.ts";
import {
  DefaultParseHandlingSettings,
  type ParseHandler,
} from "scamper/src/parser/parsehandler.ts";
import { Value } from "scamper/src/lang";

const BacktickTag = "invert-generation";
const CaretTag = "convert-function-style";

export function turnIntoBlock(
  node: SyntaxNode,
  blockMap: Map<string, BlockData>,
  caretOperator: boolean = false,
): Slot {
  const blockId = newUUID();
  if (node.simplename.toLowerCase() !== "s-expression") {
    blockMap.set(blockId, {
      type: "ConstantBlock",
      value: node.simplename,
      parentId: SectionTitles.SolutionBox,
    });
    return {
      id: blockId,
      locked: !caretOperator,
      // TODO: should find better way, symbols aren't necessarily first-class functions
      allowFirstClass: node.value.startsWith("Symbol"),
    };
  }

  // otherwise it is an s-expression with optional children
  const firstNode =
    node.children.shift() ??
    throwNull("Scamper is broken: first node of s-expression doesn't exist?");

  // if first node is a caret, it should be inverted
  if (firstNode.simplename === `"${CaretTag}"`) {
    return turnIntoBlock(node.children[0], blockMap, true);
  }
  // if it includes a backtick, it should be popped out
  if (firstNode.simplename === `"${BacktickTag}"`) {
    return turnIntoBlock(node.children[0], blockMap, !caretOperator);
  }

  function updateParentOfChild(childId: Slot["id"]) {
    if (!childId) {
      throw new Error("can't update parent of null childId");
    }
    const blockData =
      blockMap.get(childId) ?? throwNull("somehow block data doesn't exist?");
    blockMap.set(childId, {
      ...blockData,
      parentId: blockId,
    });
  }

  const firstBlockSlot = turnIntoBlock(firstNode, blockMap, caretOperator);
  updateParentOfChild(firstBlockSlot.id);

  const blockChildren: Slot[] = [
    {
      id: firstBlockSlot.id,
      locked: firstBlockSlot.locked ? !caretOperator : caretOperator,
      allowFirstClass: firstBlockSlot.allowFirstClass,
    },
  ];
  for (const child of node.children) {
    const childSlot = turnIntoBlock(child, blockMap, caretOperator);
    updateParentOfChild(childSlot.id);
    blockChildren.push(childSlot);
  }

  blockMap.set(blockId, {
    type: "BlockWithChildren",
    parentId: SectionTitles.SolutionBox,
    children: blockChildren,
  });

  return {
    id: blockId,
    locked: !caretOperator,
    allowFirstClass: false,
  };
}

const BacktickHandler: TokenHandler = {
  shouldHandle: (ch) => ch === "`",
  handle: (tokenizer) => {
    tokenizer.beginTracking();
    tokenizer.advance();
    return tokenizer.emitToken();
  },
};

const BacktickParseHandler: ParseHandler = {
  shouldHandle: (beg) => beg.text === "`",
  handle: (beg, tokens, handlingSettings) => {
    // console.log("! encountered backtick during parsing");
    return Value.mkSyntax(
      beg.range,
      Value.mkList(
        Value.mkSym(BacktickTag),
        parseValue(tokens, handlingSettings),
      ),
    );
  },
};

const CaretHandler: TokenHandler = {
  shouldHandle: (ch) => ch === "^",
  handle: (tokenizer) => {
    tokenizer.beginTracking();
    tokenizer.advance();
    return tokenizer.emitToken();
  },
};

const CaretParseHandler: ParseHandler = {
  shouldHandle: (beg) => beg.text === "^",
  handle: (beg, tokens, handlingSettings) => {
    // console.log("! encountered caret during parsing");
    return Value.mkSyntax(
      beg.range,
      Value.mkList(Value.mkSym(CaretTag), parseValue(tokens, handlingSettings)),
    );
  },
};

export function parseTemplateSolution(src: string) {
  const tokenizer = new Tokenizer(src, {
    customHandlers: [
      ...DefaultTokenHandlingSettings.customHandlers,
      BacktickHandler,
      CaretHandler,
    ],
    defaultHandler: DefaultTokenHandlingSettings.defaultHandler,
  });
  const tokens = stringToTokens(src, tokenizer);
  // console.log([...tokens]);

  const values = [];
  while (tokens.length > 0) {
    values.push(
      parseValue(tokens, {
        customHandlers: [
          ...DefaultParseHandlingSettings.customHandlers,
          BacktickParseHandler,
          CaretParseHandler,
        ],
        defaultHandler: DefaultParseHandlingSettings.defaultHandler,
      }),
    );
  }

  return new AST(values);
}
