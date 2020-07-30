import * as fs from 'fs'
import * as chalk from 'chalk'
import { Feature, ParsedTag, getTagContent, getFeaturesFromTags } from './tsdoc'
const Handlebars = require('handlebars')

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

export type ModuleData = {
  author: string,
  headline: string,
  description: string,
  features: Feature[],
  example: string,
  moduleName: string
}

export const consolidateModuleData = (parsedTags: ParsedTag[], packageJson: any): ModuleData => {
  const author = getTagContent(parsedTags, '@author')
  const headline = getTagContent(parsedTags, '@headline')
  const description = getTagContent(parsedTags, '@description')
  const example = getTagContent(parsedTags, '@example')
  const features = getFeaturesFromTags(parsedTags)

  if (!author || !headline || !description) {
    throw new Error('@author, @headline, and @description are required TSDoc fields in index.ts')
  }

  if (features.length === 0) {
    console.log(chalk.yellow('No @feature or @optionalFeature tags found - consider describing 2-3 features that are special about your udpraft component.'))
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

export const renderReadme = (moduleData: ModuleData, readmeTemplatePath): string => {
  const template = fs.readFileSync(readmeTemplatePath, { encoding: 'utf8' })

  const renderer = Handlebars.compile(template, { noEscape: true })
  const renderedReadme = renderer(moduleData)

  return renderedReadme
}

export const renderPackageJson = (moduleData: ModuleData, existingPackageJson: any, packageJsonTemplatePath: string): any => {
  const template = fs.readFileSync(packageJsonTemplatePath, { encoding: 'utf8' })

  const renderer = Handlebars.compile(template, { noEscape: true })
  const renderedPackageJsonStr = renderer(moduleData)
  const renderedPackageJsonObj = JSON.parse(renderedPackageJsonStr)

  const combinedPackageJson = { ...existingPackageJson, ...renderedPackageJsonObj }
  return combinedPackageJson
}
