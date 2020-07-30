import * as os from 'os'
import * as ts from 'typescript'
import * as tsdoc from '@microsoft/tsdoc'
import * as chalk from 'chalk'
import { DocNode, DocExcerpt } from '@microsoft/tsdoc'

/**
 * Functions for parsing TS-Doc tags.
 * This file is in a pretty messy state as it
 * is a direct copy of the ts-doc example:
 *
 * <TODO: Insert link>
 */

interface IFoundComment {
  compilerNode: ts.Node;
  textRange: tsdoc.TextRange;
}

type ParsedNode = {
  type: tsdoc.ExcerptKind,
  content: string
}

export type ParsedTag = {
  tagType: string,
  content: string,
}

export type Feature = {
  headline: string,
  description: string,
  optional: boolean
}

/**
 * Returns true if the specified SyntaxKind is part of a declaration form.
 *
 * Based on ts.isDeclarationKind() from the compiler.
 * https://github.com/Microsoft/TypeScript/blob/v3.0.3/src/compiler/utilities.ts#L6382
 */
function isDeclarationKind(kind: ts.SyntaxKind): boolean {
  return kind === ts.SyntaxKind.ArrowFunction
    || kind === ts.SyntaxKind.BindingElement
    || kind === ts.SyntaxKind.ClassDeclaration
    || kind === ts.SyntaxKind.ClassExpression
    || kind === ts.SyntaxKind.Constructor
    || kind === ts.SyntaxKind.EnumDeclaration
    || kind === ts.SyntaxKind.EnumMember
    || kind === ts.SyntaxKind.ExportSpecifier
    || kind === ts.SyntaxKind.FunctionDeclaration
    || kind === ts.SyntaxKind.FunctionExpression
    || kind === ts.SyntaxKind.GetAccessor
    || kind === ts.SyntaxKind.ImportClause
    || kind === ts.SyntaxKind.ImportEqualsDeclaration
    || kind === ts.SyntaxKind.ImportSpecifier
    || kind === ts.SyntaxKind.InterfaceDeclaration
    || kind === ts.SyntaxKind.JsxAttribute
    || kind === ts.SyntaxKind.MethodDeclaration
    || kind === ts.SyntaxKind.MethodSignature
    || kind === ts.SyntaxKind.ModuleDeclaration
    || kind === ts.SyntaxKind.NamespaceExportDeclaration
    || kind === ts.SyntaxKind.NamespaceImport
    || kind === ts.SyntaxKind.Parameter
    || kind === ts.SyntaxKind.PropertyAssignment
    || kind === ts.SyntaxKind.PropertyDeclaration
    || kind === ts.SyntaxKind.PropertySignature
    || kind === ts.SyntaxKind.SetAccessor
    || kind === ts.SyntaxKind.ShorthandPropertyAssignment
    || kind === ts.SyntaxKind.TypeAliasDeclaration
    || kind === ts.SyntaxKind.TypeParameter
    || kind === ts.SyntaxKind.VariableDeclaration
    || kind === ts.SyntaxKind.JSDocTypedefTag
    || kind === ts.SyntaxKind.JSDocCallbackTag
    || kind === ts.SyntaxKind.JSDocPropertyTag;
}

/**
 * Retrieves the JSDoc-style comments associated with a specific AST node.
 *
 * Based on ts.getJSDocCommentRanges() from the compiler.
 * https://github.com/Microsoft/TypeScript/blob/v3.0.3/src/compiler/utilities.ts#L924
 */
function getJSDocCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
  const commentRanges: ts.CommentRange[] = [];

  switch (node.kind) {
    case ts.SyntaxKind.Parameter:
    case ts.SyntaxKind.TypeParameter:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.ParenthesizedExpression:
      commentRanges.push(...ts.getTrailingCommentRanges(text, node.pos) || []);
      break;
  }
  commentRanges.push(...ts.getLeadingCommentRanges(text, node.pos) || []);

  // True if the comment starts with '/**' but not if it is '/**/'
  return commentRanges.filter((comment) =>
    text.charCodeAt(comment.pos + 1) === 0x2A /* ts.CharacterCodes.asterisk */ &&
    text.charCodeAt(comment.pos + 2) === 0x2A /* ts.CharacterCodes.asterisk */ &&
    text.charCodeAt(comment.pos + 3) !== 0x2F /* ts.CharacterCodes.slash */);
}

function walkCompilerAstAndFindComments(node: ts.Node, indent: string, foundComments: IFoundComment[]): void {
  // The TypeScript AST doesn't store code comments directly.  If you want to find *every* comment,
  // you would need to rescan the SourceFile tokens similar to how tsutils.forEachComment() works:
  // https://github.com/ajafff/tsutils/blob/v3.0.0/util/util.ts#L453
  //
  // However, for this demo we are modeling a tool that discovers declarations and then analyzes their doc comments,
  // so we only care about TSDoc that would conventionally be associated with an interesting AST node.

  let foundCommentsSuffix: string = '';
  const buffer: string = node.getSourceFile().getFullText(); // don't use getText() here!

  // Only consider nodes that are part of a declaration form.  Without this, we could discover
  // the same comment twice (e.g. for a MethodDeclaration and its PublicKeyword).
  if (isDeclarationKind(node.kind)) {
    // Find "/** */" style comments associated with this node.
    // Note that this reinvokes the compiler's scanner -- the result is not cached.
    const comments: ts.CommentRange[] = getJSDocCommentRanges(node, buffer);

    if (comments.length > 0) {
      if (comments.length === 1) {
        foundCommentsSuffix = chalk.cyan(`  (FOUND 1 COMMENT)`);
      } else {
        foundCommentsSuffix = chalk.cyan(`  (FOUND ${comments.length} COMMENTS)`);
      }

      for (const comment of comments) {
        foundComments.push({
          compilerNode: node,
          textRange: tsdoc.TextRange.fromStringRange(buffer, comment.pos, comment.end)
        });
      }
    }
  }

  // console.log(`${indent}- ${ts.SyntaxKind[node.kind]}${foundCommentsSuffix}`);

  return node.forEachChild(child => walkCompilerAstAndFindComments(child, indent + '  ', foundComments));
}

function dumpTSDocTree(docNode: tsdoc.DocNode, indent: string): ParsedNode[] {
  let parsedNodes = [] as ParsedNode[]
  let dumpText: string = '';
  if (docNode instanceof tsdoc.DocExcerpt) {
    const content: string = docNode.content.toString();
    // console.log(chalk.red(`${indent} Content: ${content}`))
    dumpText += chalk.gray(`${indent}* ${docNode.excerptKind}=`) + chalk.cyan(JSON.stringify(content));
    parsedNodes.push({ type: docNode.excerptKind, content })
  } else {
    dumpText += `${indent}- ${docNode.kind}`;
  }
  // console.log(dumpText);

  for (const child of docNode.getChildNodes()) {
    const subTreeParsedNodes = dumpTSDocTree(child, indent + '  ')
    parsedNodes = [...parsedNodes, ...subTreeParsedNodes]
  }

  return parsedNodes
}

function parseTSDoc(foundComment: IFoundComment): ParsedNode[] {
  // console.log(os.EOL + chalk.green('Comment to be parsed:') + os.EOL);
  // console.log(chalk.gray('<<<<<<'));
  // console.log(foundComment.textRange.toString());
  // console.log(chalk.gray('>>>>>>'));

  const customConfiguration: tsdoc.TSDocConfiguration = new tsdoc.TSDocConfiguration();

  const customInlineDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
    tagName: '@customInline',
    syntaxKind: tsdoc.TSDocTagSyntaxKind.InlineTag,
    allowMultiple: true
  });

  // NOTE: Defining this causes a new DocBlock to be created under docComment.customBlocks.
  // Otherwise, a simple DocBlockTag would appear inline in the @remarks section.
  const customBlockDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
    tagName: '@customBlock',
    syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag
  });

  // NOTE: Defining this causes @customModifier to be removed from its section,
  // and added to the docComment.modifierTagSet
  const customModifierDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
    tagName: '@customModifier',
    syntaxKind: tsdoc.TSDocTagSyntaxKind.ModifierTag
  });

  const featureHeadline: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
    tagName: '@feature',
    syntaxKind: tsdoc.TSDocTagSyntaxKind.InlineTag
  })

  const optionalFeatureHeadline: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
    tagName: '@optionalFeature',
    syntaxKind: tsdoc.TSDocTagSyntaxKind.InlineTag
  })

  const featureDescription: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
    tagName: '@featureDescription',
    syntaxKind: tsdoc.TSDocTagSyntaxKind.InlineTag
  })

  const author: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
    tagName: '@author',
    syntaxKind: tsdoc.TSDocTagSyntaxKind.InlineTag
  })

  customConfiguration.addTagDefinitions([
    customInlineDefinition,
    customBlockDefinition,
    customModifierDefinition,
    featureHeadline,
    optionalFeatureHeadline,
    featureDescription,
    author
  ]);

  // console.log(os.EOL + 'Invoking TSDocParser with custom configuration...' + os.EOL);
  const tsdocParser: tsdoc.TSDocParser = new tsdoc.TSDocParser(customConfiguration);
  const parserContext: tsdoc.ParserContext = tsdocParser.parseRange(foundComment.textRange);
  const docComment: tsdoc.DocComment = parserContext.docComment;

  // console.log(os.EOL + chalk.green('Parser Log Messages:') + os.EOL);

  if (parserContext.log.messages.length === 0) {
    // console.log(chalk.green('No errors or warnings.'))
  } else {
    const sourceFile: ts.SourceFile = foundComment.compilerNode.getSourceFile();
    for (const message of parserContext.log.messages) {
      // Since we have the compiler's analysis, use it to calculate the line/column information,
      // since this is currently faster than TSDoc's TextRange.getLocation() lookup.
      const location: ts.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition(message.textRange.pos);
      const formattedMessage: string = `${sourceFile.fileName}(${location.line + 1},${location.character + 1}):`
        + ` [TSDoc] ${message}`;
      console.log(formattedMessage);
    }
  }

  const parsedNodes = dumpTSDocTree(docComment, '');
  return parsedNodes
}

/**
 * This is a simplistic solution until we implement proper DocNode rendering APIs.
 */
export class Formatter {
  public static renderDocNode(docNode: DocNode): string {
    let result: string = '';
    if (docNode) {
      if (docNode instanceof DocExcerpt) {
        result += docNode.content.toString();
      }
      for (const childNode of docNode.getChildNodes()) {
        result += Formatter.renderDocNode(childNode);
      }
    }
    return result;
  }

  public static renderDocNodes(docNodes: ReadonlyArray<DocNode>): string {
    let result: string = '';
    for (const docNode of docNodes) {
      result += Formatter.renderDocNode(docNode);
    }
    return result;
  }
}

const groupByTags = (nodes: ParsedNode[]): ParsedTag[] => {
  let condensedNodes = [] as ParsedTag[]
  let currentTag = 'default'
  let currentContent = ''

  nodes.forEach(({ type, content }, index) => {
    if (type === 'BlockTag') {
      condensedNodes[currentTag] = currentContent.trim()
      condensedNodes.push({ tagType: currentTag, content: currentContent.trim() })
      currentTag = content
      currentContent = ''
      return
    }

    // Add the content of the current node
    // console.log('Adding content: ', JSON.stringify({ type, content }, null, 2))
    currentContent += content
  })

  condensedNodes.push({ tagType: currentTag, content: currentContent.trim() })
  return condensedNodes
}

export const extractTsDoc = (fileName): ParsedTag[] => {
  const compilerOptions: ts.CompilerOptions = {
    'target': ts.ScriptTarget.ES5
  };

  // Compile the input
  // console.log(`Invoking the TypeScript compiler to analyze ${fileName}...`);

  const program: ts.Program = ts.createProgram([ fileName ], compilerOptions);

  // Report any compiler errors
  const compilerDiagnostics: ReadonlyArray<ts.Diagnostic> = program.getSemanticDiagnostics();
  if (compilerDiagnostics.length > 0) {
    for (const diagnostic of compilerDiagnostics) {
      const message: string = ts.flattenDiagnosticMessageText(diagnostic.messageText, os.EOL);
      if (diagnostic.file) {
        const location: ts.LineAndCharacter = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        const formattedMessage: string = `${diagnostic.file.fileName}(${location.line + 1},${location.character + 1}):`
          + ` [TypeScript] ${message}`;
        console.log(chalk.red(formattedMessage));
      } else {
        console.log(chalk.red(message));
      }
    }
  } else {
    console.log(chalk.green('No compiler errors or warnings.'))
  }

  const sourceFile: ts.SourceFile | undefined = program.getSourceFile(fileName);
  if (!sourceFile) {
    throw new Error('Error retrieving source file');
  }

  // console.log(os.EOL + chalk.green('Scanning compiler AST for first code comment...') + os.EOL);

  const foundComments: IFoundComment[] = [];
  walkCompilerAstAndFindComments(sourceFile, '', foundComments);

  let parsedNodes = [] as ParsedNode[]
  if (foundComments.length === 0) {
    throw new Error('Error: No code comments were found in the input file')
  } else {
    // For the purposes of this demo, only analyze the first comment that we found
    parsedNodes = parseTSDoc(foundComments[0]);
  }

  // Condense content in nodes
  const parsedTags = groupByTags(parsedNodes)
  // console.log('----')
  // console.log(JSON.stringify(parsedTags, null, 2))
  return parsedTags
}

export const getTagContent = (parsedTags: ParsedTag[], tagType: string): string | null => {
  const foundItem = parsedTags.find((parsedTag) => parsedTag.tagType === tagType)
  if (foundItem === undefined) {
    return null
  }

  return foundItem.content
}

export const getFeaturesFromTags = (parsedTags: ParsedTag[]): Feature[] => {
  let features = [] as Feature[]
  let currentFeature = null as Feature | null
  let previousTagType = ''

  parsedTags.forEach(({ tagType, content }) => {
    const isFeatureTag = (tagType === '@feature' || tagType === '@optionalFeature')
    const isDescriptionTag = (tagType === '@featureDescription')
    const prevIsFeatureTag = (previousTagType === '@feature' || previousTagType === '@optionalFeature')

    if (isFeatureTag && currentFeature !== null) {
      features.push(currentFeature)
    }

    if (isFeatureTag) {
      currentFeature = {
        headline: content,
        description: '',
        optional: (tagType === '@optionalFeature')
      }
    }

    if (isDescriptionTag && !prevIsFeatureTag) {
      throw new Error(`The @featureDescrption tag has to be preceeded by a @feature or @optionalFeature tag`)
    }

    if (isDescriptionTag && prevIsFeatureTag) {
      currentFeature.description = content
    }

    previousTagType = tagType
  })

  if (currentFeature !== null) {
    features.push(currentFeature)
  }

  return features
}
