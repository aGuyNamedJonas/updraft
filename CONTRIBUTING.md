# Contributing to updraft
## Your contribution is what makes *updraft* special ✌🏿 
It's your contributions that turn *updraft* from an idea into a powerful & helpful resource for your fellow developers!  

**Thanks for investing your time & energy into this 🙏🏻**    

The following guidlines help you contribute your own *updraft* component to the `@updraft` package scope on NPM. You can also use this workflow to contribute other improvements to the project (e.g. documentation & CLI improvments)

> In staying true to our values, we pledge to always strive to make contributing to *updraft* an empowering and simple experience with the lowest entry barrier possible.

## Code of Conduct
By contributing to *updraft* and interacting in any way with the project, you agree to uphold the [Code of Conduct](./CODE_OF_CONDUCT.md). Thanks for helping keep *updraft* a safe and fun environment for everyone.

## Contribute your component to *updraft*
Got a cool idea for a great *updraft* component?  
Built a CDK component recently that you're really proud of?

Contributing a component to *updraft* is really simple:

0. Install the updraft CLI  
`npm i -g @updraft/cli`
1. Fork the [updraft repository](https://github.com/aGuyNamedJonas/updraft)
2. Navigate to the components folder  
`cd ./components/typescript`
3. Start a new component, using the `typescript-starter` template:  
`updraft templates @updraft typescript-starter aws-<your-component-name>`
4. Implement your component & fill in the TS-Doc fields in `index.ts`
5. Generate the docs by running `updraft docs` from the `./components/typescript/` directory
6. Create a Pull Request against the updraft repository

## Contribute something else
We also deeply appreciate your contributions to everything *updraft* that is not a component (e.g. documentation updates, CLI improvements etc.).  

To contribute in general, just fork the [updraft repository](https://github.com/aGuyNamedJonas/updraft) and submit a Pull Request, once you're done.  

> Please note that while we deeply appreciate any help in moving *updraft* forward, we might not accept all contributions to ensure we stay focused on our core [vision, mission and values](/docs/VisionValuesMission.md).  
Please check the open issues, or discuss your idea by creating an issue first, to lower your risk of investing time & energy into something we might end up rejecting at that time.