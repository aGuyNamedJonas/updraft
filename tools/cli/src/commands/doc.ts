import * as chalk from 'chalk'
import {flags} from '@oclif/command'
import Command from './base'
import * as colors from 'colors'
import * as os from 'os'
import * as path from 'path'
import * as ts from 'typescript'
import * as fs from 'fs'
import * as tsdoc from '@microsoft/tsdoc'
import { DocNode, DocExcerpt } from '@microsoft/tsdoc';
import { exec } from 'child_process'
// import detectPackageJsonUpgrades from '../versionUpgrades'
import { NpmPackage } from '../lib/npm'
const Handlebars = require('handlebars')
const debug = require('debug')
const logger = debug('doc')

/**
 * Makes the Array.prototype.join function available in the handlebar templates.
 * Example use:
 * <p>
 *   {{#join companies "<br>"}}
 *     {{name}}
 *   {{/join}}
 * </p>
 */
Handlebars.registerHelper( "join", function( array, sep, options ) {
  return array.map(function( item ) {
      return options.fn( item )
  }).join( sep )
})

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

interface IFoundComment {
  compilerNode: ts.Node;
  textRange: tsdoc.TextRange;
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
        foundCommentsSuffix = colors.cyan(`  (FOUND 1 COMMENT)`);
      } else {
        foundCommentsSuffix = colors.cyan(`  (FOUND ${comments.length} COMMENTS)`);
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

type ParsedNode = {
  type: tsdoc.ExcerptKind,
  content: string
}
function dumpTSDocTree(docNode: tsdoc.DocNode, indent: string): ParsedNode[] {
  let parsedNodes = [] as ParsedNode[]
  let dumpText: string = '';
  if (docNode instanceof tsdoc.DocExcerpt) {
    const content: string = docNode.content.toString();
    // console.log(colors.red(`${indent} Content: ${content}`))
    dumpText += colors.gray(`${indent}* ${docNode.excerptKind}=`) + colors.cyan(JSON.stringify(content));
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
  // console.log(os.EOL + colors.green('Comment to be parsed:') + os.EOL);
  // console.log(colors.gray('<<<<<<'));
  // console.log(foundComment.textRange.toString());
  // console.log(colors.gray('>>>>>>'));

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

  // console.log(os.EOL + colors.green('Parser Log Messages:') + os.EOL);

  if (parserContext.log.messages.length === 0) {
    // console.log(colors.green('No errors or warnings.'))
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

type ParsedTag = {
  tagType: string,
  content: string,
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

const extractTsDoc = (fileName): ParsedTag[] => {
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
        console.log(colors.red(formattedMessage));
      } else {
        console.log(colors.red(message));
      }
    }
  } else {
    console.log(colors.green('No compiler errors or warnings.'))
  }

  const sourceFile: ts.SourceFile | undefined = program.getSourceFile(fileName);
  if (!sourceFile) {
    throw new Error('Error retrieving source file');
  }

  // console.log(os.EOL + colors.green('Scanning compiler AST for first code comment...') + os.EOL);

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

const getTagContent = (parsedTags: ParsedTag[], tagType: string): string | null => {
  const foundItem = parsedTags.find((parsedTag) => parsedTag.tagType === tagType)
  if (foundItem === undefined) {
    return null
  }

  return foundItem.content
}

type Feature = {
  headline: string,
  description: string,
  optional: boolean
}

const getFeaturesFromTags = (parsedTags: ParsedTag[]): Feature[] => {
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

type ModuleData = {
  author: string,
  headline: string,
  description: string,
  features: Feature[],
  example: string,
  moduleName: string
}

const consolidateModuleData = (parsedTags: ParsedTag[], packageJson: any): ModuleData => {
  const author = getTagContent(parsedTags, '@author')
  const headline = getTagContent(parsedTags, '@headline')
  const description = getTagContent(parsedTags, '@description')
  const example = getTagContent(parsedTags, '@example')
  const features = getFeaturesFromTags(parsedTags)

  if (!author || !headline || !description) {
    throw new Error('@author, @headline, and @description are required TSDoc fields in index.ts')
  }

  if (features.length === 0) {
    console.log(colors.yellow('No @feature or @optionalFeature tags found - consider describing 2-3 features that are special about your udpraft component.'))
  }

  const { name: moduleName } = packageJson

  return {
    author,
    headline,
    description,
    features,
    example,
    moduleName
  } as ModuleData
}

const renderReadme = (moduleData: ModuleData, readmeTemplatePath): string => {
  const template = fs.readFileSync(readmeTemplatePath, { encoding: 'utf8' })

  const renderer = Handlebars.compile(template, { noEscape: true })
  const renderedReadme = renderer(moduleData)

  return renderedReadme
}

const renderPackageJson = (moduleData: ModuleData, existingPackageJson: any, packageJsonTemplatePath: string): any => {
  const template = fs.readFileSync(packageJsonTemplatePath, { encoding: 'utf8' })

  const renderer = Handlebars.compile(template, { noEscape: true })
  const renderedPackageJsonStr = renderer(moduleData)
  const renderedPackageJsonObj = JSON.parse(renderedPackageJsonStr)

  const combinedPackageJson = { ...existingPackageJson, ...renderedPackageJsonObj }
  return combinedPackageJson
}

const generateDocs = async (npmPackage: NpmPackage, autoCommit: boolean, readmeTemplatePath: string, packageJsonTemplatePath: string) => {
  const { name, version, fullPath, dir } = npmPackage
  console.log(chalk.bold(name), chalk.green('~> ' + version), '\n', chalk.gray(fullPath))

  const packageJsonPath = path.join(dir, 'package.json')
  let packageJson = {} as any
  try {
    const rawPackageJson = fs.readFileSync(packageJsonPath, { encoding: 'utf8' })
    packageJson = JSON.parse(rawPackageJson)
  } catch (error) {
    console.log(colors.red(`Failed to load package.json file:\n${packageJsonPath}\n${error.toString()}`))
    return
  }
  console.log(colors.green('✓ Successfully loaded package.json file'))

  const inputFilePath = path.join(dir, 'index.ts')
  let parsedTags = [] as ParsedTag[]
  try {
    parsedTags = extractTsDoc(inputFilePath)
  } catch (error) {
    console.log(colors.red(`Failed to process component index.ts file:\n${inputFilePath}\n${error.toString()}`))
    return
  }
  console.log(colors.green('✓ Successfully parsed TSDoc tags from index.ts'))

  let moduleData = {} as ModuleData
  try {
    moduleData = consolidateModuleData(parsedTags, packageJson)
  } catch (error) {
    console.log(colors.red(`Failed to convert the parsed tags to module data\n${error.toString()}`))
    return
  }
  console.log(colors.green('✓ Done consolidating module data'))

  let readme = ''
  try {
    readme = renderReadme(moduleData, readmeTemplatePath)
  } catch (error) {
    console.log(colors.red(`Failed to render README:\n${error.toString()}`))
    return
  }
  console.log(colors.green('✓ Successfully rendered README'))

  let updatedPackageJson = ''
  try {
    updatedPackageJson = renderPackageJson(moduleData, packageJson, packageJsonTemplatePath)
  } catch (error) {
    console.log(colors.red(`Failed to render package.json:\n${error.toString()}`))
    return
  }
  console.log(colors.green('✓ Successfully rendered package.json'))

  const readmeFilePath = path.join(dir, 'README.md')
  try {
    fs.writeFileSync(readmeFilePath, readme)
  } catch (error) {
    console.log(colors.red(`Failed to write README:\n${error.toString()}`))
    return
  }
  console.log(colors.green('✓ Successfully replaced README.md with rendererd README'))

  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2))
  } catch (error) {
    console.log(colors.red(`Failed to write package.json:\n${error.toString()}`))
    return
  }
  console.log(colors.green('✓ Successfully wrote updated package.json'))

  if (autoCommit) {
    try {
      process.cwd()
      await exec(`cd ${dir} && git add package.json README.md && git commit -m "Auto-generate update of package.json and README.md for ${packageJson.name}"`)
    } catch (error) {
      console.log(colors.red(`Error while trying to commit changes to README.md and package.json:\n${error.toString()}`))
      return
    }
    console.log(colors.green('✓ Successfully committed changes to package.json & README.md'))
  }

  console.log('')
}

export default class Doc extends Command {
  static description = 'Auto-Generates the README and some package.json fields for your updraft module by parsing the tsdoc in your index.ts\n\nAuto-generated READMEs allow us to optimize the user-experience around the overall updraft project as a whole, while you can focus on optimizing the user experience of your own updraft modules.\n\nRun "$ updraft templates @updraft/templates updraft-module-ts" to download the latest example on how to use the tsdoc fields.'

  static examples = [
    `$ updraft doc
Takes the tsdoc from your index.ts and turns it into a README and some package.json fields
`,
  ]

  static flags = {
    ...Command.globalFlags,
    ...Command.changedModulesFlags,
    'auto-commit': flags.boolean({
      description: 'Set this flag to create a commit with the auto-generated README.md and package.json',
      required: false,
    }),
    'readme-template': flags.string({
      description: 'Relative path to the README.md.handlebars template file to use',
      required: false
    }),
    'packagejson-template': flags.string({
      description: 'Relative path to the package.json.handlebars template file to use',
      required: false
    }),
  }

  static args = [
    ...Command.changedModulesArgs,
  ]

  async run() {
    const autoCommit = this.getConfigValue('auto-commit', false)
    const readmeTemplate = this.getConfigValue('readme-template', 'README.md.handlebars')
    const packageJsonTemplate = this.getConfigValue('packagejson-template', 'package.json.handlebars')

    const readmeTempPath = path.join(process.cwd(), readmeTemplate)
    const packageJsonTempPath = path.join(process.cwd(), packageJsonTemplate)

    const changedNpmPackages = await this.getChangedModules()
    console.log(
      changedNpmPackages.length > 0
      ? chalk.yellow(`Found ${changedNpmPackages.length} package${changedNpmPackages.length === 1 ? '' : 's'} to regenerate docs for\n`)
      : chalk.yellow(`Found no package to regenrate docs for\n`)
    )

    if (changedNpmPackages.length === 0) {
      process.exit(0)
    }

    for (let npmPackage of changedNpmPackages) {
      await generateDocs(npmPackage, autoCommit, readmeTempPath, packageJsonTempPath)
    }
  }
}
