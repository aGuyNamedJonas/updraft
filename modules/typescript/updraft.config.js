/**
 * Config file for running updraft cli from this folder.
 * You can also check out the config file we use for
 * the updraft cli: /tools/cli/updraft.config.js
 *
 * --> Create a custom updraft config file (includes docs):
 * updraft templates @updraft/cli config-starter
 */

// const Joi = require('@hapi/joi')
// const { string } = require('@hapi/joi')

const config = {
  alias: 'Typescript Components Config',
  'skip-npm-auth': true,
  'diff-cmd': 'diff origin/master...',
  include: './*/package.json',
  exclude: './templates/**',
  // validation: {
  //   'package.json': Joi.object({
  //     __packageScope: Joi.string()
  //                        .required()
  //                        .messages({
  //                          'string.empty': `Missing scope. Property "name" of package.json needs to start with the scope "@updraft"`
  //                        }),
  //     __packageName:  [
  //                       Joi.ref('__folderName')
  //                     ]
  //   })
  // },
  validation: {
    'package.json': {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          regex: /^@updraft\//
        }
      }
    }
  }
}

module.exports = config
