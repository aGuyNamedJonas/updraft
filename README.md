<p align="center">
  <img src="https://raw.githubusercontent.com/aGuyNamedJonas/updraft/master/design/updraft-logo-text-color.svg" alt="Sublime's custom image"/>
</p>

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

> Cloud Development Kit (CDK) Components - Easy to use cloud infrastructure building blocks for all developers

## What is it?
*updraft* is an open collection for CDK components, bringing the power of component-based development to the world of setting up cloud-infrastructure for your apps. Create complex cloud-setups through simply composing ready-to-go components.  

We also took the liberty to replace *complex examples* with *templates* - runnable code-examples that are provided alongside *updraft components* to get you up-and-running with cloud-infrastructure in no time. Check out the *Getting Started* guide to get started with your first template 👇🏻

## Getting started
```bash
# Install the updraft cli
npm install --global updraft
# Install the react-ts-starter template
updraft templates @updraft/aws-static-site react-ts-starter
# Go into the folder that contains the template
cd ./react-ts-starter
# Install & deploy
npm install && npm run deploy
# --> After deploy is done, go to the displayed url
```

[`@updraft/aws-static-site`](https://www.npmjs.com/package/@updraft/aws-static-site) is the [updraft component of the week](/docs/ComponentOfTheWeek.md).

`@updraft/aws-static-site` makes it easy for you to setup a static-site on AWS, including registering your domain and uploading your static assets, and it also provides quickstart-templates, so you can get started:

**react-ts-starter** Get started with deploying a `react` Single Page App to AWS: `updraft templates @updraft/aws-static-site react-ts-starter`.

👉🏻 For more inspiration, check out our other [updraft component of the week](/docs/ComponentOfTheWeek.md)

## Why? [![start with why](https://img.shields.io/badge/start%20with-why%3F-brightgreen.svg?style=flat)](http://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action)

We build updraft to empower every developer around the world to run their apps on highly scalable cloud-infrastructure with ease.

Updraft is an open module registry for [Cloud Development Kit (CDK)](https://github.com/aws/aws-cdk) modules, offering infrastructure building-blocks that can be easily composed into complex setups.

Services like [Vercel](https://vercel.com/dashboard) and [Netfliy](https://www.netlify.com/) have shown what a superb developer experience for deployments can look like - we strive to enable the same high level of DX for working with cloud-infrastructure in general.

👉🏻 Read more: [Vision, Values, Mission](/docs/VisionValuesMission.md)

## Contribute
