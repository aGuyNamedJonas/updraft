#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VanillaJsStack } from '../lib/vanilla-js-stack';

const app = new cdk.App();
new VanillaJsStack(app, 'VanillaJsStack', {
  env: {
    // REMOVE BEFORE MERGE
    account: '717741335539',
    region: 'eu-central-1',
    // Optional: You can specify an AWS account + region to use
    // account: '<AWS account ID>',
    // region: '<AWS region>'
  }
});
