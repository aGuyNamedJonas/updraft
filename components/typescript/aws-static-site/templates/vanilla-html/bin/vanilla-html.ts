#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VanillaHtmlStack } from '../lib/vanilla-html-stack';

const app = new cdk.App();
new VanillaHtmlStack(app, 'VanillaHtmlStack', {
  env: {
    // Optional: You can specify an AWS account + region to use
    // account: '<AWS account ID>',
    // region: '<AWS region>'
  }
});
