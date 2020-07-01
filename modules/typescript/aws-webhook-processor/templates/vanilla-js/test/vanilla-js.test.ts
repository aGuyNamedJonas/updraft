import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as VanillaJs from '../lib/vanilla-js-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new VanillaJs.VanillaJsStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
