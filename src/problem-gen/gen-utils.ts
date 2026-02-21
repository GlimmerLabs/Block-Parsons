import {
  parseValue,
  stringToTokens,
  Tokenizer,
} from "scamper/src/parser/parser.ts";
import { AST, SyntaxNode } from "scamper/src/ast.ts";
import { newUUID, SectionTitles, throwNull } from "../common/utils.ts";
import {
  type BlockData,
  isBlockWithChildrenData,
  isConstantBlockData,
  type Slot,
} from "../common/block-types.ts";
import type { TokenHandler } from "scamper/src/parser/tokenhandler.ts";
import { DefaultTokenHandlingSettings } from "scamper/src/parser/tokenhandler.ts";
import {
  DefaultParseHandlingSettings,
  type ParseHandler,
} from "scamper/src/parser/parsehandler.ts";
import { Value } from "scamper/src/lang";
import type { BlockContextType } from "../common/providers/block/BlockContext.ts";

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
      isSymbol: node.value.includes("Symbol"),
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

  // TODO: find way to detect varargs, for now just check for list or + in first
  const firstBlockData =
    blockMap.get(
      firstBlockSlot.id ?? throwNull("first block slot id is somehow null"),
    ) ?? throwNull("first block data doesn't exist somehow");
  const expandable =
    (firstBlockSlot.locked ? !caretOperator : caretOperator) &&
    firstBlockData.type === "ConstantBlock" &&
    isExpandableSymbol(firstBlockData.value);

  blockMap.set(blockId, {
    type: "BlockWithChildren",
    parentId: SectionTitles.SolutionBox,
    children: blockChildren,
    expandable,
  });

  return {
    id: blockId,
    locked: !caretOperator,
    allowFirstClass: false,
  };
}

function isExpandableSymbol(value: string) {
  const expandableSymbols = ["list", "+"];
  return expandableSymbols.includes(value);
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

interface ConversionError {
  type: "ConversionError";
  message: string;
}
interface ConversionSuccess {
  type: "ConversionSuccess";
  code: string;
  blocksEncountered: number;
}
type ConversionResult = ConversionSuccess | ConversionError;

export function isConversionError(
  result: ConversionResult,
): result is ConversionError {
  return result.type === "ConversionError";
}
export function convertBlocksToScamper(
  blocks: BlockContextType["blocks"],
  topLevel: BlockContextType["solution"]["topLevel"],
): ConversionResult {
  const count = blocks.size;

  function scamperifyBlock(block: BlockData): ConversionResult {
    if (isConstantBlockData(block)) {
      return {
        type: "ConversionSuccess",
        code: block.value,
        blocksEncountered: 1,
      };
    }
    if (!isBlockWithChildrenData(block))
      return throwNull("block is neither constant nor block with children?");
    // else is block with children
    const childCode: string[] = [];
    let blocksEncountered = 1;
    for (const { id } of block.children) {
      if (!id) {
        return { type: "ConversionError", message: "null child id" };
      }
      const conversionResult = scamperifyBlock(
        blocks.get(id) ?? throwNull("child block id is not a real block?"),
      );
      if (isConversionError(conversionResult)) return conversionResult;
      childCode.push(conversionResult.code);
      blocksEncountered += conversionResult.blocksEncountered;
    }
    return {
      type: "ConversionSuccess",
      code: `(${childCode.join(" ")})`,
      blocksEncountered,
    };
  }

  let finalCode: string = "";
  let blocksEncountered = 0;
  for (const blockId of topLevel) {
    const block =
      blocks.get(blockId) ?? throwNull("top level block not found?");
    const conversionResult = scamperifyBlock(block);
    if (isConversionError(conversionResult)) return conversionResult;
    finalCode += conversionResult.code;
    blocksEncountered += conversionResult.blocksEncountered;
  }
  return blocksEncountered === count
    ? { type: "ConversionSuccess", code: finalCode, blocksEncountered }
    : {
        type: "ConversionError",
        message: `blocks encountered don't match count (${blocksEncountered.toString()} / ${count.toString()})`,
      };
}
